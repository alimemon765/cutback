# Review Link Loading Issue - Analysis & Fix Plan

## 📋 Current Status

**Issue**: Generated share links open but remain in an infinite loading state  
**URL Pattern**: `http://localhost:3000/review/[token]`  
**Symptom**: Page shows loading spinner indefinitely, never completes loading

---

## 🔍 Why We Think This Is Happening

### Root Cause Analysis

Based on our previous fixes and the architecture, we believe the issue is caused by **multiple factors**:

#### 1. **Review Link Verification API Using Wrong Authentication Method** ❌
- **File**: `app/api/review/[token]/verify/route.ts`
- **Problem**: Currently uses `createAPIClient(request)` which requires authentication cookies
- **Why This Fails**: Review links are accessed by **unauthenticated reviewers** who don't have auth cookies
- **Result**: API returns `401 Unauthorized`, causing the page to fail loading

#### 2. **Video Versions RLS Policy Blocking Public Access** ❌
- **Table**: `video_versions`
- **Problem**: RLS policies likely only allow authenticated project members to view videos
- **Why This Fails**: Reviewers are anonymous users (`anon` role), not authenticated
- **Result**: Even if we fix the API, the database query will fail with RLS policy violation

#### 3. **Comments API Using Wrong Authentication Method** ❌
- **File**: `app/api/review/[token]/comments/route.ts`
- **Problem**: Likely uses `createAPIClient` which requires auth cookies
- **Why This Fails**: Reviewers don't have authentication cookies
- **Result**: Comments can't be loaded or submitted

#### 4. **Signed URL Generation May Be Failing** ⚠️
- **Problem**: Storage signed URLs might require authentication
- **Why This Could Fail**: If storage RLS policies don't allow public access
- **Result**: Video won't play even if everything else works

---

## 🎯 What We Will Try To Fix It

### Fix Strategy: Public Access Pattern

Since review links are accessed by **unauthenticated reviewers**, we need to use a **different pattern** than authenticated routes:

#### Pattern for Public Routes:
```
Public Request → Use Anon Key → REST API (No Authorization Header) → RLS Policy Allows Public Access
```

#### Pattern for Authenticated Routes (What We've Been Using):
```
Authenticated Request → Extract Token → REST API (With Authorization Header) → RLS Policy Checks auth.uid()
```

---

### Step 1: Fix Review Link Verification API ✅ (Priority: HIGH)

**File**: `app/api/review/[token]/verify/route.ts`

**Changes Needed**:
1. Remove `createAPIClient` usage
2. Use Supabase REST API with **anon key only** (no Authorization header)
3. Query `review_links` table to verify token is valid
4. Query `video_versions` to get the latest video
5. Generate signed URL using `createClient` with anon key

**Expected Behavior**:
- API accepts requests without authentication
- Returns video URL and review link details
- Works for anonymous users

---

### Step 2: Add Public RLS Policy for Video Versions ✅ (Priority: HIGH)

**File**: `supabase/schema.sql` or new migration file

**SQL Needed**:
```sql
-- Allow public access to video_versions when accessed via valid review link
CREATE POLICY "Public can view videos via review links"
ON video_versions FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM review_links
    WHERE review_links.project_id = video_versions.project_id
    AND review_links.is_active = TRUE
    AND (review_links.expires_at IS NULL OR review_links.expires_at > NOW())
  )
);
```

**Why This Works**:
- Allows anonymous users to SELECT video_versions
- Only if there's a valid, active, non-expired review link for that project
- Maintains security while enabling public access

---

### Step 3: Fix Comments API for Public Access ✅ (Priority: MEDIUM)

**File**: `app/api/review/[token]/comments/route.ts`

**Changes Needed**:
1. Remove `createAPIClient` usage
2. Use REST API with anon key (no Authorization header)
3. Verify review link token is valid before allowing comments
4. Add RLS policy for public comment access if needed

**Expected Behavior**:
- Comments can be loaded without authentication
- Comments can be submitted without authentication
- Only works for valid review link tokens

---

### Step 4: Add Public RLS Policy for Comments ✅ (Priority: MEDIUM)

**SQL Needed**:
```sql
-- Allow public access to comments when accessed via valid review link
CREATE POLICY "Public can view comments via review links"
ON comments FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM review_links
    JOIN video_versions ON video_versions.project_id = review_links.project_id
    WHERE review_links.is_active = TRUE
    AND (review_links.expires_at IS NULL OR review_links.expires_at > NOW())
    AND comments.video_version_id = video_versions.id
  )
);

-- Allow public to insert comments via valid review link
CREATE POLICY "Public can insert comments via review links"
ON comments FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM review_links
    JOIN video_versions ON video_versions.project_id = review_links.project_id
    WHERE review_links.is_active = TRUE
    AND (review_links.expires_at IS NULL OR review_links.expires_at > NOW())
    AND video_versions.id = comments.video_version_id
  )
);
```

---

### Step 5: Verify Storage RLS Policies ✅ (Priority: LOW)

**Check**: `supabase/storage_policies.sql`

**Ensure**:
- Storage bucket allows public read access OR
- Signed URLs can be generated with anon key
- Storage RLS policies allow access via review links

---

## 📊 What We Have Done Till Now

### ✅ Completed Fixes

#### 1. **Authentication System** ✅
- **Fixed**: Client-side authentication working
- **Files**: `components/auth/LoginForm.tsx`, `components/auth/SignupForm.tsx`
- **Status**: Fully functional

#### 2. **Project Creation** ✅
- **Fixed**: RLS policy violations using REST API with Authorization header
- **File**: `app/api/projects/route.ts`
- **Solution**: Extract token from cookie → REST API with `Authorization: Bearer <token>`
- **Status**: Working correctly

#### 3. **Video Upload** ✅
- **Fixed**: Storage RLS violations and file size errors
- **File**: `app/api/projects/[id]/videos/route.ts`
- **Solution**: 
  - Use Storage REST API with Authorization header
  - Extract token from cookie
  - Add file size validation
- **Status**: Working correctly

#### 4. **Share Link Generation** ✅ (Just Fixed)
- **Fixed**: RLS policy violations in share link creation
- **File**: `app/api/projects/[id]/share/route.ts`
- **Solution**: 
  - Extract token from cookie
  - Use REST API with Authorization header for POST, GET, PATCH
  - All three handlers now work correctly
- **Status**: Share links generate successfully

---

### ❌ Remaining Issues

#### 1. **Review Link Verification** ❌
- **File**: `app/api/review/[token]/verify/route.ts`
- **Problem**: Uses `createAPIClient` which requires auth cookies
- **Status**: Needs fix (Step 1)

#### 2. **Video Versions Public Access** ❌
- **Table**: `video_versions`
- **Problem**: No RLS policy for public access via review links
- **Status**: Needs fix (Step 2)

#### 3. **Comments API Public Access** ❌
- **File**: `app/api/review/[token]/comments/route.ts`
- **Problem**: Uses `createAPIClient` which requires auth cookies
- **Status**: Needs fix (Step 3)

#### 4. **Comments RLS Policies** ❌
- **Table**: `comments`
- **Problem**: No RLS policies for public access via review links
- **Status**: Needs fix (Step 4)

---

## 🔄 Technical Pattern Comparison

### Authenticated Routes (What We Fixed)
```typescript
// Extract token from cookie
const cookieHeader = request.headers.get('cookie') ?? '';
const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
const [, cookieValue] = authCookie.split('=');
const cookieData = JSON.parse(decodeURIComponent(cookieValue));
const accessToken = cookieData.access_token;

// Use REST API with Authorization header
const response = await fetch(`${supabaseUrl}/rest/v1/table`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`, // ✅ Required for RLS
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
});
```

### Public Routes (What We Need To Do)
```typescript
// No token extraction needed

// Use REST API with anon key only (no Authorization header)
const response = await fetch(`${supabaseUrl}/rest/v1/table`, {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ Only anon key
    // No Authorization header for public access
  },
});
```

---

## 🧪 Testing Plan

### After Implementing Fixes:

1. **Generate a new share link**
   - Should work (already fixed)

2. **Open share link in incognito window**
   - Should load without authentication
   - Should show video player
   - Should show comments section

3. **Test password protection** (if enabled)
   - Should prompt for password
   - Should verify password correctly
   - Should load video after correct password

4. **Test video playback**
   - Video should load and play
   - Signed URL should be valid
   - No 403/404 errors

5. **Test comments**
   - Comments should load
   - Should be able to submit new comments
   - Comments should appear immediately

---

## 📝 Key Learnings

### What We've Learned:

1. **RLS Requires JWT in Authorization Header**
   - `auth.uid()` only works when JWT is passed to PostgreSQL
   - JavaScript `setSession()` doesn't propagate to database context
   - Solution: Always use REST API with `Authorization: Bearer <token>` header

2. **Public Access Needs Different Pattern**
   - Authenticated routes: Use Authorization header with user token
   - Public routes: Use anon key only, no Authorization header
   - RLS policies must explicitly allow `anon` role

3. **Storage RLS Also Requires Authorization**
   - Storage operations need Authorization header for RLS
   - Signed URLs can be generated with anon key for public access

4. **Cookie Parsing in API Routes**
   - `cookies()` from `next/headers` unreliable in API routes
   - Must manually parse from `request.headers.get('cookie')`
   - Extract and decode JSON cookie value

---

## 🎯 Next Steps (In Order)

1. ✅ **Fix Review Link Verification API** - Use anon key, no auth
2. ✅ **Add Video Versions Public RLS Policy** - Allow public access via review links
3. ✅ **Fix Comments API** - Use anon key, no auth
4. ✅ **Add Comments Public RLS Policies** - Allow public read/write via review links
5. ✅ **Test Complete Flow** - Generate link → Open in incognito → Verify everything works

---

## 📚 Files That Need Changes

### Code Files:
- `app/api/review/[token]/verify/route.ts` - Rewrite to use anon key
- `app/api/review/[token]/comments/route.ts` - Rewrite to use anon key

### Database Files:
- `supabase/schema.sql` - Add public RLS policies
- OR create new migration file for public access policies

---

## 🚨 Important Notes

1. **Security**: Public access is only allowed via valid, active, non-expired review links
2. **RLS Policies**: Must be carefully designed to prevent unauthorized access
3. **Testing**: Always test in incognito window to simulate unauthenticated users
4. **Pattern Consistency**: Use the same pattern for all public routes

---

**Last Updated**: Current session  
**Status**: Share link generation fixed, review link page needs fixes (Steps 1-4)

