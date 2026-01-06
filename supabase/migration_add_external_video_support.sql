-- Migration: Add external video source support to video_versions table
-- This enables Google Drive, Dropbox, and Vimeo integrations

-- Add columns for external video sources
ALTER TABLE public.video_versions
ADD COLUMN IF NOT EXISTS external_provider TEXT CHECK (external_provider IN ('google_drive', 'dropbox', 'vimeo')),
ADD COLUMN IF NOT EXISTS external_file_id TEXT,
ADD COLUMN IF NOT EXISTS external_file_url TEXT;

-- Add index for external provider lookups
CREATE INDEX IF NOT EXISTS idx_video_versions_external_provider 
ON public.video_versions(external_provider) 
WHERE external_provider IS NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN public.video_versions.external_provider IS 'Source provider: google_drive, dropbox, vimeo, or NULL for uploaded files';
COMMENT ON COLUMN public.video_versions.external_file_id IS 'File ID from the external provider (e.g., Google Drive file ID)';
COMMENT ON COLUMN public.video_versions.external_file_url IS 'URL or reference to access the external file';

