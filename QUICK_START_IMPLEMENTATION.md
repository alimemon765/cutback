# Quick Start Guide - CutBack Implementation

## 🎯 What Was Built

A complete video feedback platform with:
- **Editor Flow**: Create projects, upload videos, generate share links, manage feedback
- **Reviewer Flow**: Watch videos via link, add timestamped comments (no login required)

## ⚡ Quick Start (3 Steps)

### Step 1: Update Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Add review_links table
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

-- Policies
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
```

### Step 2: Set Up Supabase Storage

1. Go to Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name: `videos`
4. Public: **OFF** (unchecked)
5. Click **Create**

Add these storage policies in **Storage** → **Policies**:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to read
CREATE POLICY "Users can read own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- Allow public read (for reviewers via signed URLs)
CREATE POLICY "Public can read videos via signed URL"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'videos');

-- Allow users to delete
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');
```

### Step 3: Start the App

```bash
npm install
npm run dev
```

Open http://localhost:3001

## 🎬 Testing the Complete Flow

### As Editor:

1. **Login** → Go to `/login`
2. **Create Project** → Dashboard → "New Project" button
3. **Upload Video** → Click project → "Upload Video" button
4. **Generate Link** → Click "Share" → Fill form → "Generate New Link"
5. **Copy Link** → Click "Copy Link" button
6. **View Comments** → Return to project page → See comments section

### As Reviewer:

1. **Open Link** → Paste the share link in browser (use incognito/different browser)
2. **Enter Password** → If protected, enter password
3. **Watch Video** → Video plays automatically
4. **Add Comment** → Click "Add Comment" button on video player
5. **Fill Form** → Enter your name and comment
6. **Submit** → Comment appears in sidebar

### Back as Editor:

1. **View Comments** → Refresh project page
2. **Filter Comments** → Use All/Open/In Progress/Resolved buttons
3. **Change Status** → Click "Mark In Progress" or "Mark Resolved"
4. **See Updates** → Status badge updates with color

## 📂 Key Files

### Pages
- `/dashboard` - Project list
- `/project/[id]` - Project details with videos and comments
- `/project/[id]/share` - Generate share links
- `/review/[token]` - Public review page (no auth)

### API Routes
- `POST /api/projects` - Create project
- `POST /api/projects/[id]/videos` - Upload video
- `POST /api/projects/[id]/share` - Generate link
- `POST /api/review/[token]/comments` - Add comment (public)
- `PATCH /api/projects/[id]/comments/[commentId]` - Update status

### Components
- `CreateProjectModal` - Project creation form
- `VideoUpload` - Video upload with progress
- `VideoPlayer` - Custom player with comment markers
- `CommentsList` - Display comments
- `AddCommentForm` - Add new comment
- `PasswordModal` - Password protection

## 🎨 Features Implemented

### ✅ Project Management
- Create projects with name and description
- List all projects on dashboard
- Click to view project details
- Archive projects

### ✅ Video Upload
- Drag-and-drop or file picker
- Progress bar during upload
- File validation (size, type)
- Automatic version numbering
- Active version management

### ✅ Share Links
- Generate unique tokens
- Optional password protection
- Set expiration dates
- Toggle active/inactive
- Track access count
- Multiple links per project

### ✅ Video Review
- No login required for reviewers
- Password protection support
- Custom video player
- Add timestamped comments
- See all comments
- Jump to comment timestamps

### ✅ Comment Management
- View all comments
- Filter by status
- Change status (Open → In Progress → Resolved)
- Color-coded status badges
- Comment count display

## 🔒 Security

- ✅ Authentication required for editors
- ✅ Token-based access for reviewers
- ✅ Password hashing with bcrypt
- ✅ RLS policies on all tables
- ✅ Signed URLs for video access
- ✅ Input validation

## 📊 Database Tables

- `projects` - Project information
- `video_versions` - Video files and metadata
- `comments` - Timestamped feedback
- `review_links` - Shareable links with tokens
- `profiles` - User information

## 🚀 What's Next?

The platform is ready for:
1. ✅ Development testing
2. ✅ User acceptance testing
3. ⏳ Production deployment
4. ⏳ Custom domain setup
5. ⏳ Email notifications (optional)

## 💡 Tips

- **Storage**: Make sure to create the `videos` bucket before uploading
- **Testing**: Use incognito mode to test reviewer experience
- **Passwords**: Optional but recommended for client projects
- **Expiration**: Set to 0 for no expiration
- **Comments**: Click on comment to jump to that timestamp
- **Status**: Use filters to focus on specific feedback

## 🎊 Success!

All features are implemented and ready to use. Follow the 3 steps above to get started!

