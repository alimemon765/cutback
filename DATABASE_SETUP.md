# Database Setup Instructions

## Step 1: Run the Schema in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (`tuqodkaweecctmnitaxu`)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

## Step 2: Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `video_versions`
   - ✅ `comments`
   - ✅ `team_members`
   - ✅ `project_invitations`
   - ✅ `notifications`

## Step 3: Verify Storage Bucket

1. Go to **Storage** in the left sidebar
2. Verify the `videos` bucket exists and is **Private**

## What Was Created?

### Core Tables:
- **profiles** - User profile information (extends Supabase auth)
- **projects** - Video projects/workspaces
- **video_versions** - Video files with versioning (v1, v2, v3...)
- **comments** - Timestamp-based comments on videos
- **team_members** - Team collaboration (owner, editor, viewer roles)
- **project_invitations** - Email-based project invitations
- **notifications** - In-app notifications

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies configured for proper access control
- ✅ Users can only access their own projects and shared projects

### Features:
- ✅ Automatic profile creation on signup
- ✅ Automatic `updated_at` timestamps
- ✅ Indexes for performance
- ✅ Foreign key constraints for data integrity

## Next Steps

Once the schema is created, we'll:
1. Create TypeScript types from the database
2. Build authentication pages
3. Create project management features
4. Build video upload functionality

