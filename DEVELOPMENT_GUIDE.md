# CutBack Development Guide

This guide will walk you through building CutBack step-by-step, following the PRD requirements.

---

## Phase 1: Foundation & Authentication ✅ (In Progress)

### Step 1.1: Database Schema Setup
**Status**: Schema created, ready to run

**What to do:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and run in SQL Editor
4. Verify all 7 tables are created in Table Editor

**Files created:**
- ✅ `supabase/schema.sql` - Complete database schema
- ✅ `DATABASE_SETUP.md` - Setup instructions

**Next**: Once schema is run, proceed to Step 1.2

---

### Step 1.2: Generate TypeScript Types from Database
**Status**: Pending

**What we'll do:**
- Install Supabase CLI or use type generation tool
- Generate TypeScript types matching our database schema
- Update `types/index.ts` with generated types

**Files to create:**
- `types/database.ts` - Auto-generated database types
- Update `types/index.ts` - Merge with existing types

**Dependencies needed:**
- `supabase` CLI (optional, or manual type creation)

---

### Step 1.3: Authentication Pages
**Status**: Pending

**What we'll build:**
1. **Login Page** (`/login`)
   - Email/password or magic link
   - Redirect to dashboard after login
   
2. **Sign Up Page** (`/signup`)
   - Email, password, name
   - Auto-create profile on signup
   
3. **Auth Callback** (`/auth/callback`)
   - Handle Supabase auth redirects
   - Magic link confirmation

**Files to create:**
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/auth/callback/route.ts`
- `components/auth/LoginForm.tsx`
- `components/auth/SignupForm.tsx`
- `app/api/auth/[...supabase]/route.ts` (if needed)

**Features:**
- Email/password authentication
- Magic link support
- OAuth (Google/GitHub) - optional
- Form validation with Zod
- Error handling

---

### Step 1.4: Dashboard Layout & Navigation
**Status**: Pending

**What we'll build:**
1. **Main Layout** with:
   - Sidebar navigation
   - User menu (profile, settings, logout)
   - Project switcher
   
2. **Dashboard Home** (`/dashboard`)
   - Recent projects
   - Quick stats
   - Create project button

**Files to create:**
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`
- `components/layout/UserMenu.tsx`

**Features:**
- Responsive design
- Active project highlighting
- User profile display

---

## Phase 2: Project Management

### Step 2.1: Project CRUD Operations
**Status**: Pending

**What we'll build:**
1. **Create Project**
   - Modal/form to create new project
   - Name, description fields
   - Auto-assign as owner

2. **Project List**
   - Display all user's projects
   - Filter by archived/active
   - Search functionality

3. **Project Settings**
   - Edit name/description
   - Archive/unarchive
   - Delete project

**Files to create:**
- `app/dashboard/projects/page.tsx`
- `app/dashboard/projects/[id]/page.tsx`
- `app/dashboard/projects/[id]/settings/page.tsx`
- `components/projects/ProjectCard.tsx`
- `components/projects/CreateProjectModal.tsx`
- `components/projects/ProjectSettings.tsx`
- `app/api/projects/route.ts` (GET, POST)
- `app/api/projects/[id]/route.ts` (GET, PUT, DELETE)

**Features:**
- Real-time project list
- Archive functionality
- Project search
- Settings management

---

### Step 2.2: Project Detail Page
**Status**: Pending

**What we'll build:**
1. **Project View** (`/dashboard/projects/[id]`)
   - Project header with name/description
   - Version list sidebar
   - Active version display
   - Upload new version button

**Files to create:**
- `app/dashboard/projects/[id]/page.tsx`
- `components/projects/ProjectHeader.tsx`
- `components/projects/VersionList.tsx`
- `components/projects/VersionCard.tsx`

**Features:**
- Version navigation
- Active version indicator
- Project metadata display

---

## Phase 3: Video Upload & Playback

### Step 3.1: Video Upload System
**Status**: Pending

**What we'll build:**
1. **Upload Component**
   - Drag & drop interface
   - File picker
   - Progress indicator
   - File validation (size, type)

2. **Upload API**
   - Handle file upload to Supabase Storage
   - Create video_version record
   - Generate thumbnail (optional)
   - Extract video metadata (duration, etc.)

**Files to create:**
- `components/video/VideoUpload.tsx`
- `components/video/UploadProgress.tsx`
- `app/api/upload/route.ts`
- `lib/storage.ts` - Supabase storage helpers
- `lib/video.ts` - Video utilities

**Features:**
- Drag & drop upload
- Progress tracking
- File validation (500MB limit, video types)
- Automatic version numbering
- Thumbnail generation (future)

---

### Step 3.2: Video Player Component
**Status**: Pending

**What we'll build:**
1. **Custom Video Player**
   - HTML5 video with custom controls
   - Play/pause, seek, volume
   - Fullscreen support
   - Timestamp display

2. **Player Features**
   - Jump to timestamp
   - Keyboard shortcuts
   - Playback speed control

**Files to create:**
- `components/video/VideoPlayer.tsx`
- `components/video/VideoControls.tsx`
- `components/video/TimestampDisplay.tsx`
- `hooks/useVideoPlayer.ts` - Video player logic

**Features:**
- Custom styled controls
- Timestamp navigation
- Keyboard shortcuts (space, arrows)
- Responsive design

---

## Phase 4: Commenting System

### Step 4.1: Timestamp-Based Comments
**Status**: Pending

**What we'll build:**
1. **Comment Input**
   - Click on video timeline to add comment
   - Or click "Add Comment" button at current time
   - Text input with @mention support

2. **Comment Display**
   - Show comments at their timestamps
   - Timeline markers for comments
   - Comment list sidebar
   - Click comment to jump to timestamp

**Files to create:**
- `components/comments/CommentInput.tsx`
- `components/comments/CommentList.tsx`
- `components/comments/CommentItem.tsx`
- `components/comments/TimelineMarkers.tsx`
- `app/api/comments/route.ts` (GET, POST)
- `app/api/comments/[id]/route.ts` (PUT, DELETE)

**Features:**
- Click-to-comment on timeline
- Timestamp precision
- Real-time comment updates
- Comment status (open/in_progress/resolved)

---

### Step 4.2: Comment Threading & Replies
**Status**: Pending

**What we'll build:**
1. **Reply System**
   - Reply to any comment
   - Nested comment threads
   - Thread collapse/expand

2. **Comment Actions**
   - Edit comment (within time window)
   - Delete comment
   - Change status
   - Emoji reactions (optional)

**Files to create:**
- `components/comments/CommentThread.tsx`
- `components/comments/CommentActions.tsx`
- `components/comments/EditComment.tsx`
- Update comment API routes

**Features:**
- Nested replies
- Edit/delete with permissions
- Status management
- @mentions in replies

---

## Phase 5: Client Review Experience

### Step 5.1: Public Review Pages
**Status**: Pending

**What we'll build:**
1. **Review Page** (`/review/[token]`)
   - Token-based access (no login required)
   - Clean, distraction-free UI
   - Video player with comments
   - Client name capture

2. **Review Features**
   - Password protection (optional)
   - Comment without account
   - Approval button
   - Download link (after approval)

**Files to create:**
- `app/review/[token]/page.tsx`
- `components/review/ReviewPlayer.tsx`
- `components/review/ClientCommentForm.tsx`
- `components/review/ApprovalButton.tsx`
- `app/api/review/[token]/route.ts`

**Features:**
- No-login client experience
- Token-based security
- Optional password protection
- Client name capture
- Approval workflow

---

### Step 5.2: Share Links & Access Control
**Status**: Pending

**What we'll build:**
1. **Share Link Generation**
   - Generate unique tokens per project/version
   - Set expiration dates
   - Password protection option

2. **Link Management**
   - View active share links
   - Revoke links
   - Copy link to clipboard

**Files to create:**
- `components/projects/ShareLinkModal.tsx`
- `components/projects/ShareLinkManager.tsx`
- `app/api/share/route.ts`
- `lib/share.ts` - Token generation utilities

**Features:**
- Secure token generation
- Link expiration
- Password protection
- Link revocation

---

## Phase 6: Version Management

### Step 6.1: Version Stacking
**Status**: Pending

**What we'll build:**
1. **Version Management**
   - Upload new version (auto-increment)
   - View version history
   - Switch between versions
   - Mark version as active

2. **Version Comparison** (Optional)
   - Side-by-side version view
   - Comment history preservation

**Files to create:**
- `components/versions/VersionManager.tsx`
- `components/versions/VersionHistory.tsx`
- `components/versions/VersionComparison.tsx` (optional)
- `app/api/versions/route.ts`
- `app/api/versions/[id]/route.ts`

**Features:**
- Linear versioning (v1 → v2 → v3)
- Version switching
- Comment history per version
- Active version indicator

---

### Step 6.2: Approval System
**Status**: Pending

**What we'll build:**
1. **Version Approval**
   - Approve/reject versions
   - Approval status display
   - Final approval marker

2. **Approval Workflow**
   - Track approval history
   - Notify on approval
   - Lock comments after approval

**Files to create:**
- `components/versions/ApprovalButton.tsx`
- `components/versions/ApprovalStatus.tsx`
- Update version API routes

**Features:**
- Version-level approval
- Approval history
- Status indicators
- Workflow management

---

## Phase 7: Team Collaboration

### Step 7.1: Team Invitations
**Status**: Pending

**What we'll build:**
1. **Invite Team Members**
   - Email invitation form
   - Role selection (editor/viewer)
   - Send invitation email

2. **Accept Invitations**
   - Invitation link handling
   - Auto-add to project on accept
   - Email notifications

**Files to create:**
- `components/team/InviteMemberModal.tsx`
- `components/team/TeamMemberList.tsx`
- `app/api/invitations/route.ts`
- `app/api/invitations/[token]/route.ts`
- `app/invite/[token]/page.tsx`
- Email templates for invitations

**Features:**
- Email-based invitations
- Role management
- Invitation expiration
- Auto-acceptance flow

---

### Step 7.2: Permissions & Roles
**Status**: Pending

**What we'll build:**
1. **Role-Based Access**
   - Owner: Full control
   - Editor: Upload, comment, manage
   - Viewer: View and comment only

2. **Permission Checks**
   - UI elements based on role
   - API route protection
   - Action restrictions

**Files to create:**
- `lib/permissions.ts` - Permission utilities
- `hooks/usePermissions.ts` - Permission hook
- Update components with permission checks

**Features:**
- Role-based UI
- API route protection
- Action restrictions
- Permission helpers

---

## Phase 8: Notifications

### Step 8.1: Email Notifications
**Status**: Pending

**What we'll build:**
1. **Email Templates**
   - New comment notification
   - Reply notification
   - Version upload notification
   - Invitation email

2. **Notification Service**
   - Send emails on events
   - User preferences
   - Daily summary option

**Files to create:**
- `lib/email/templates.ts` - Email templates
- `lib/email/notifications.ts` - Notification logic
- `app/api/notifications/send/route.ts`
- Email template components

**Features:**
- Event-triggered emails
- HTML email templates
- User preferences
- Daily summaries

---

### Step 8.2: In-App Notifications
**Status**: Pending

**What we'll build:**
1. **Notification Center**
   - Bell icon with badge
   - Notification list
   - Mark as read
   - Clear all

2. **Real-Time Updates**
   - Supabase realtime subscriptions
   - Toast notifications
   - Badge counts

**Files to create:**
- `components/notifications/NotificationCenter.tsx`
- `components/notifications/NotificationItem.tsx`
- `hooks/useNotifications.ts`
- `app/api/notifications/route.ts`

**Features:**
- Real-time notifications
- Unread badge
- Notification history
- Mark as read

---

## Phase 9: Polish & Enhancements

### Step 9.1: Branding & Customization
**Status**: Pending

**What we'll build:**
1. **Brand Settings**
   - Upload custom logo
   - Brand color customization
   - Apply to review pages

2. **Custom Domain** (Agency tier)
   - Domain configuration
   - SSL setup
   - Custom branding

**Files to create:**
- `components/settings/BrandSettings.tsx`
- `components/settings/LogoUpload.tsx`
- `app/api/settings/brand/route.ts`
- Update review pages with branding

**Features:**
- Logo upload
- Color customization
- Brand application
- Custom domains (future)

---

### Step 9.2: Analytics & Insights
**Status**: Pending

**What we'll build:**
1. **Project Analytics**
   - Revision count
   - Average feedback time
   - Comment resolution time
   - Client responsiveness

2. **Dashboard Charts**
   - Visual charts/graphs
   - Time-based metrics
   - Export data

**Files to create:**
- `components/analytics/AnalyticsDashboard.tsx`
- `components/analytics/MetricsCard.tsx`
- `app/api/analytics/route.ts`
- Chart components (recharts or similar)

**Features:**
- Project metrics
- Time-based analytics
- Visual charts
- Data export

---

## Phase 10: Testing & Deployment

### Step 10.1: Testing
**Status**: Pending

**What we'll do:**
1. **Manual Testing**
   - Test all user flows
   - Cross-browser testing
   - Mobile responsiveness

2. **Error Handling**
   - Error boundaries
   - User-friendly error messages
   - Logging setup

**Files to create:**
- Error boundary components
- Error logging setup
- Test documentation

---

### Step 10.2: Deployment
**Status**: Pending

**What we'll do:**
1. **Vercel Setup**
   - Connect GitHub repo
   - Configure environment variables
   - Deploy production build

2. **Post-Deployment**
   - Domain configuration
   - SSL setup
   - Monitoring setup

**Files to create:**
- `vercel.json` (if needed)
- Deployment documentation

---

## Development Workflow

### Recommended Order:
1. ✅ **Phase 1** - Foundation (Database, Auth, Dashboard)
2. **Phase 2** - Project Management
3. **Phase 3** - Video Upload & Playback
4. **Phase 4** - Commenting System
5. **Phase 5** - Client Review
6. **Phase 6** - Version Management
7. **Phase 7** - Team Collaboration
8. **Phase 8** - Notifications
9. **Phase 9** - Polish
10. **Phase 10** - Testing & Deployment

### Best Practices:
- Build and test each phase before moving to next
- Commit code after each major feature
- Test authentication flows thoroughly
- Ensure RLS policies work correctly
- Test file uploads with various sizes
- Verify mobile responsiveness

---

## Quick Reference

### Key Files Structure:
```
app/
├── (auth)/              # Auth pages
│   ├── login/
│   └── signup/
├── dashboard/           # Protected routes
│   ├── projects/
│   └── settings/
├── review/              # Public review pages
│   └── [token]/
└── api/                 # API routes
    ├── auth/
    ├── projects/
    ├── upload/
    └── comments/

components/
├── auth/                # Auth components
├── layout/              # Layout components
├── projects/            # Project components
├── video/               # Video components
├── comments/            # Comment components
└── ui/                  # Reusable UI components

lib/
├── supabase/           # Supabase clients
├── email/              # Email utilities
├── storage/            # Storage helpers
└── permissions.ts      # Permission logic
```

---

## Next Immediate Steps

1. **Run the database schema** (Step 1.1)
2. **Generate TypeScript types** (Step 1.2)
3. **Build authentication pages** (Step 1.3)
4. **Create dashboard layout** (Step 1.4)

Once you complete Step 1.1 (running the schema), let me know and we'll proceed with the next steps!

