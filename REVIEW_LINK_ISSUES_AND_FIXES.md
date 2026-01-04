# Review Link Issues - Complete Analysis & Fixes

## 🔍 Current Problems

### Problem 1: Infinite Recursion in RLS Policies ❌
**Error**: `infinite recursion detected in policy for relation "review_links"` (Error Code: 42P17)

**Root Cause**:
- When querying `review_links` as `anon` user, PostgreSQL evaluates ALL SELECT policies
- The "Editors can view own project links" policy doesn't specify `TO authenticated`, so it defaults to `PUBLIC` (includes both `authenticated` and `anon`)
- This policy checks `projects` table
- The `projects` public policy checks `review_links` table
- **Cycle**: `review_links` → `projects` → `review_links` → `projects` → ... = INFINITE RECURSION

**Why It Happens**:
```sql
-- Policy 1: review_links (evaluated for anon)
CREATE POLICY "Editors can view own project links"
ON review_links FOR SELECT  -- No TO clause = PUBLIC (includes anon!)
USING (EXISTS (SELECT 1 FROM projects WHERE ...));  -- Checks projects

-- Policy 2: projects (evaluated for anon)
CREATE POLICY "Public can view projects via review links"
ON projects FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM review_links WHERE ...));  -- Checks review_links

-- When anon queries review_links:
-- 1. Evaluates "Editors" policy → checks projects
-- 2. Evaluates projects policy → checks review_links
-- 3. Back to step 1 → INFINITE LOOP
```

### Problem 2: Port Mismatch in Share Links ❌
**Issue**: Generated share links use port 3000 instead of actual server port (3002)

**Root Cause**:
- `request.headers.get('origin')` returns `http://localhost:3000` (wrong port)
- Fallback uses hardcoded `http://localhost:3001`
- Server is actually running on port 3002

**Why It Happens**:
- Browser sends `Origin` header with port 3000 (from cached URL or default)
- Code doesn't extract port from actual request URL
- No environment variable set for `NEXT_PUBLIC_APP_URL`

---

## ✅ What We've Done To Fix

### Fix 1: Changed API Route to Use Anon Key ✅
**File**: `app/api/review/[token]/verify/route.ts`

**Changes**:
- ❌ Removed: `createAPIClient(request)` (requires auth cookies)
- ✅ Added: `createClient(supabaseUrl, supabaseAnonKey)` (anon key only)
- ✅ Removed: `projects!inner(id, name)` join (was causing RLS issues)
- ✅ Added: Separate query for project name using REST API

**Result**: API route now works for anonymous users (no auth cookies needed)

### Fix 2: Added Public RLS Policies ✅
**File**: `supabase/fix_review_link_public_rls.sql`

**Policies Added**:
1. `review_links` SELECT policy for `anon` role
2. `video_versions` SELECT policy for `anon` role (via review links)
3. `review_links` UPDATE policy for `anon` role (access count)
4. `projects` SELECT policy for `anon` role (via review links)

**Issue**: Created recursion because `projects` policy checks `review_links`, and `review_links` "Editors" policy checks `projects`

### Fix 3: Fixed Port Detection ✅
**File**: `app/api/projects/[id]/share/route.ts`

**Changes**:
- ✅ Improved `baseUrl` detection to use actual request URL
- ✅ Added fallback to extract port from `request.url`
- ✅ Changed default fallback to port 3002

**Result**: Share links should now use correct port

---

## 🎯 What Still Needs Fixing

### Fix 4: Break RLS Recursion (CRITICAL) ⚠️

**Solution**: Ensure "Editors" policy is ONLY for authenticated users

**SQL Needed**:
```sql
-- Drop and recreate "Editors" policy with explicit TO authenticated
DROP POLICY IF EXISTS "Editors can view own project links" ON review_links;
CREATE POLICY "Editors can view own project links"
ON review_links
FOR SELECT
TO authenticated  -- EXPLICITLY only authenticated users
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = review_links.project_id
  AND projects.owner_id = auth.uid()
));
```

**Why This Works**:
- `TO authenticated` means this policy is ONLY evaluated for authenticated users
- When `anon` queries `review_links`, PostgreSQL skips this policy
- Only the `TO anon` policy is evaluated → no recursion

### Fix 5: Break Projects Policy Recursion ⚠️

**Solution Option A**: Use SECURITY DEFINER function (breaks recursion)

**SQL Needed**:
```sql
-- Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.has_valid_review_link(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER  -- Runs with creator's privileges, bypasses RLS
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM review_links
    WHERE project_id = p_project_id
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Update projects policy to use function
DROP POLICY IF EXISTS "Public can view projects via review links" ON projects;
CREATE POLICY "Public can view projects via review links"
ON projects
FOR SELECT
TO anon
USING (public.has_valid_review_link(id));
```

**Solution Option B**: Remove projects policy, query projects via REST API (simpler)

**Code Change**: Already done in `app/api/review/[token]/verify/route.ts` - we query projects separately using REST API

**SQL Needed**: Remove the projects policy entirely, rely on REST API query

---

## 📋 Complete Fix Plan

### Step 1: Fix RLS Recursion (Run This SQL)
```sql
-- Fix 1: Ensure "Editors" policy is only for authenticated
DROP POLICY IF EXISTS "Editors can view own project links" ON review_links;
CREATE POLICY "Editors can view own project links"
ON review_links
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = review_links.project_id
  AND projects.owner_id = auth.uid()
));

-- Fix 2: Remove projects policy (we query projects via REST API instead)
DROP POLICY IF EXISTS "Public can view projects via review links" ON projects;

-- Keep these policies (they don't cause recursion):
-- - "Public can access by valid token" on review_links (TO anon)
-- - "Public can view videos via review links" on video_versions (TO anon)
-- - "Public can update review link access count" on review_links (TO anon)
```

### Step 2: Verify Port Fix Works
- Generate a new share link
- Check if it uses port 3002 (not 3000)
- If still wrong, check `NEXT_PUBLIC_APP_URL` environment variable

---

## 🔄 Why Recursion Happens (Technical Details)

### PostgreSQL RLS Policy Evaluation

When a query runs, PostgreSQL:
1. Identifies the role (`anon`, `authenticated`, etc.)
2. Evaluates ALL policies that match the role
3. Combines them with `OR` (if any policy allows, access is granted)

### The Problem

```sql
-- Policy A: review_links (evaluated for anon because no TO clause)
CREATE POLICY "Editors can view own project links"
ON review_links FOR SELECT  -- Defaults to PUBLIC = anon + authenticated
USING (EXISTS (SELECT 1 FROM projects WHERE ...));

-- Policy B: projects (evaluated for anon)
CREATE POLICY "Public can view projects via review links"
ON projects FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM review_links WHERE ...));
```

**When anon queries review_links**:
1. PostgreSQL evaluates Policy A (because it's PUBLIC)
2. Policy A checks `projects` table
3. PostgreSQL evaluates Policy B for `projects` query
4. Policy B checks `review_links` table
5. Back to step 1 → INFINITE LOOP

### The Solution

```sql
-- Policy A: review_links (ONLY for authenticated)
CREATE POLICY "Editors can view own project links"
ON review_links FOR SELECT TO authenticated  -- EXPLICITLY authenticated only
USING (EXISTS (SELECT 1 FROM projects WHERE ...));

-- Policy C: review_links (ONLY for anon)
CREATE POLICY "Public can access by valid token"
ON review_links FOR SELECT TO anon  -- EXPLICITLY anon only
USING (is_active = TRUE AND ...);
```

**When anon queries review_links**:
1. PostgreSQL evaluates Policy C (matches `anon` role)
2. Policy C doesn't check other tables → NO RECURSION ✅
3. Policy A is skipped (doesn't match `anon` role)

---

## 📊 Summary

### Problems Identified:
1. ✅ **Infinite Recursion**: "Editors" policy evaluated for anon users
2. ✅ **Port Mismatch**: Share links use wrong port

### Fixes Applied:
1. ✅ Changed verify route to use anon key
2. ✅ Added public RLS policies
3. ✅ Fixed port detection in share route
4. ✅ Removed projects join to avoid RLS issues

### Fixes Still Needed:
1. ⚠️ **Fix recursion**: Add `TO authenticated` to "Editors" policy
2. ⚠️ **Remove projects policy**: We query projects via REST API anyway

---

## 🚀 Next Steps

1. Run the SQL fix to break recursion
2. Test review link again
3. Verify port is correct in generated links
4. Remove debug instrumentation after confirmation



