-- CutBack Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE ALL TABLES FIRST
-- ============================================

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TEAM MEMBERS TABLE (created early for policy references)
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, user_id)
);

-- ============================================
-- VIDEO VERSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.video_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  duration NUMERIC(10, 2), -- Duration in seconds
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, version_number)
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_version_id UUID REFERENCES public.video_versions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT, -- For clients who comment without accounts
  timestamp NUMERIC(10, 2) NOT NULL, -- Timestamp in seconds
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- PROJECT INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'version_upload', 'invitation', 'mention')),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ALL POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.project_id = projects.id
    AND team_members.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Users can view team members in accessible projects"
  ON public.team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = team_members.project_id
    AND (projects.owner_id = auth.uid() OR team_members.user_id = auth.uid())
  ));

CREATE POLICY "Project owners can manage team members"
  ON public.team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = team_members.project_id
    AND projects.owner_id = auth.uid()
  ));

-- Video versions policies
CREATE POLICY "Users can view videos in accessible projects"
  ON public.video_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = video_versions.project_id
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Project members can create video versions"
  ON public.video_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = video_versions.project_id
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'editor')
    ))
  ));

CREATE POLICY "Project members can update video versions"
  ON public.video_versions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = video_versions.project_id
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'editor')
    ))
  ));

-- Comments policies
CREATE POLICY "Users can view comments in accessible videos"
  ON public.comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.video_versions
    JOIN public.projects ON projects.id = video_versions.project_id
    WHERE video_versions.id = comments.video_version_id
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.video_versions
    JOIN public.projects ON projects.id = video_versions.project_id
    WHERE video_versions.id = comments.video_version_id
    AND (projects.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Comment authors can update comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.video_versions
    JOIN public.projects ON projects.id = video_versions.project_id
    WHERE video_versions.id = comments.video_version_id
    AND projects.owner_id = auth.uid()
  ));

-- Invitations policies
CREATE POLICY "Project owners can manage invitations"
  ON public.project_invitations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_invitations.project_id
    AND projects.owner_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON public.projects(is_archived);
CREATE INDEX IF NOT EXISTS idx_video_versions_project_id ON public.video_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_video_versions_active ON public.video_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_comments_video_version_id ON public.comments(video_version_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON public.team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_versions_updated_at BEFORE UPDATE ON public.video_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
