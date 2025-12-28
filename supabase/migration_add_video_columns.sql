-- ============================================
-- MIGRATION: Add missing columns to video_versions table
-- ============================================

-- Add file_path column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_versions' 
    AND column_name = 'file_path'
  ) THEN
    ALTER TABLE public.video_versions ADD COLUMN file_path TEXT;
    -- Migrate existing data from file_url to file_path
    UPDATE public.video_versions SET file_path = file_url WHERE file_path IS NULL;
  END IF;
END $$;

-- Add mime_type column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_versions' 
    AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE public.video_versions ADD COLUMN mime_type TEXT;
  END IF;
END $$;

-- Add storage_url column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_versions' 
    AND column_name = 'storage_url'
  ) THEN
    ALTER TABLE public.video_versions ADD COLUMN storage_url TEXT;
    -- Migrate existing data from file_url to storage_url
    UPDATE public.video_versions SET storage_url = file_url WHERE storage_url IS NULL;
  END IF;
END $$;

-- Add uploaded_by column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_versions' 
    AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE public.video_versions ADD COLUMN uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make file_path NOT NULL if it has data
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.video_versions WHERE file_path IS NULL
  ) THEN
    -- If there are NULL values, we can't make it NOT NULL yet
    -- But we can set defaults for existing rows
    UPDATE public.video_versions 
    SET file_path = file_url 
    WHERE file_path IS NULL;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added missing columns to video_versions table';
END $$;

