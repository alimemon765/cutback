-- ============================================
-- STORAGE POLICIES FOR VIDEOS BUCKET
-- Run this in Supabase SQL Editor AFTER creating the 'videos' bucket
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read videos via signed URL" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;

-- Policy 1: Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Policy 2: Allow authenticated users to read videos
CREATE POLICY "Users can read own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- Policy 3: Allow public read via signed URLs (for reviewers)
CREATE POLICY "Public can read videos via signed URL"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'videos');

-- Policy 4: Allow users to delete videos
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Storage policies created successfully!';
END $$;

