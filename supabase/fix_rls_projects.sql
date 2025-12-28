-- Fix RLS for projects table
-- Run this in Supabase SQL Editor if you're getting 500 errors

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;

-- Create SELECT policy (users can view their own projects)
-- Simplified to avoid recursion - team members check removed for now
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id);

-- Create INSERT policy (users can create projects where they're the owner)
CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Create UPDATE policy (project owners can update their projects)
CREATE POLICY "Project owners can update projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create DELETE policy (project owners can delete their projects)
CREATE POLICY "Project owners can delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'projects';

-- List all policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'projects';

