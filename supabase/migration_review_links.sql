-- ============================================
-- MIGRATION: Add Review Links Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Create review_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.review_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Editors can view own project links" ON public.review_links;
DROP POLICY IF EXISTS "Editors can create review links" ON public.review_links;
DROP POLICY IF EXISTS "Editors can update own project links" ON public.review_links;
DROP POLICY IF EXISTS "Public can access by valid token" ON public.review_links;

-- Create policies for review_links
CREATE POLICY "Editors can view own project links"
  ON public.review_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = review_links.project_id
    AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Editors can create review links"
  ON public.review_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = review_links.project_id
    AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Editors can update own project links"
  ON public.review_links FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = review_links.project_id
    AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Public can access by valid token"
  ON public.review_links FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! review_links table created.';
END $$;

