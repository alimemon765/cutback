-- ============================================
-- FIX: Break RLS Infinite Recursion
-- ============================================

-- Step 1: Drop ALL review_links SELECT policies
DROP POLICY IF EXISTS "Editors can view own project links" ON review_links;
DROP POLICY IF EXISTS "Public can access by valid token" ON review_links;
DROP POLICY IF EXISTS "Public can view review links by token" ON review_links;

-- Step 2: Create NEW review_links SELECT policies with explicit roles

-- Policy for AUTHENTICATED users only (no recursion with projects)
CREATE POLICY "Authenticated users can view own project links"
ON review_links
FOR SELECT
TO authenticated  -- CRITICAL: Only authenticated, not PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = review_links.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Policy for ANON users only (no recursion - doesn't check other tables)
CREATE POLICY "Anonymous can access review links by token"
ON review_links
FOR SELECT
TO anon  -- CRITICAL: Only anon, separate from authenticated
USING (
  is_active = TRUE
  AND (expires_at IS NULL OR expires_at > NOW())
);

-- Step 3: Remove projects public policy (we query via REST API instead)
DROP POLICY IF EXISTS "Public can view projects via review links" ON projects;

-- Step 4: Keep other review_links policies (UPDATE policy for access count)
-- This doesn't cause recursion because it's UPDATE, not SELECT
DROP POLICY IF EXISTS "Public can update review link access count" ON review_links;
CREATE POLICY "Public can update review link access count"
ON review_links
FOR UPDATE
TO anon
USING (
  is_active = TRUE 
  AND (expires_at IS NULL OR expires_at > NOW())
)
WITH CHECK (
  is_active = TRUE 
  AND (expires_at IS NULL OR expires_at > NOW())
);

-- Step 5: Verify video_versions policy is correct
-- This is fine because it only checks review_links, not projects
DROP POLICY IF EXISTS "Public can view videos via review links" ON video_versions;
CREATE POLICY "Public can view videos via review links"
ON video_versions
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM review_links
    WHERE review_links.project_id = video_versions.project_id
    AND review_links.is_active = TRUE
    AND (review_links.expires_at IS NULL OR review_links.expires_at > NOW())
  )
);

-- Step 6: Ensure RLS is enabled on all tables
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_versions ENABLE ROW LEVEL SECURITY;
