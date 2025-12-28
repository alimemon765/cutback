-- Check if RLS is enabled on projects table
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'projects';

-- Check existing policies on projects table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'projects';

-- Enable RLS if not enabled (run this if RLS is disabled)
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

