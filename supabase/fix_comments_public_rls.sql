-- ============================================
-- FIX: Allow anonymous users to insert comments via review links
-- ============================================

-- Add policy for anonymous users to insert comments when there's a valid review link
CREATE POLICY "Public can insert comments via review links"
ON comments
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM video_versions
    JOIN review_links ON review_links.project_id = video_versions.project_id
    WHERE video_versions.id = comments.video_version_id
    AND review_links.is_active = TRUE
    AND (review_links.expires_at IS NULL OR review_links.expires_at > NOW())
  )
);

-- Also allow anonymous users to SELECT comments for videos accessible via review links
-- (This might already be covered, but let's make sure)
CREATE POLICY "Public can view comments via review links"
ON comments
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM video_versions
    JOIN review_links ON review_links.project_id = video_versions.project_id
    WHERE video_versions.id = comments.video_version_id
    AND review_links.is_active = TRUE
    AND (review_links.expires_at IS NULL OR review_links.expires_at > NOW())
  )
);

