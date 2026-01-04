# 🚀 CutBack – Full Product Completion Plan

This document defines the **final roadmap** for CutBack.
When every section in this file is completed, the product can be considered
**fully production-ready** for freelancers, teams, and agencies.

This file should be reviewed regularly during development.

---

## PHASE 0 – CURRENT STATUS (REFERENCE)

### ✅ Already Completed
- Authentication (Editor + Anonymous Reviewer)
- Project creation & dashboard
- Video upload with versioning
- Share links with password & expiry
- Public review page
- Timestamped commenting with status
- Secure RLS & Storage handling

**MVP Core:** ✔ Done

---

# PHASE 1 – EXTERNAL VIDEO SOURCES (START HERE)

## 1️⃣ Google Drive Integration (FIRST PRIORITY)

### Goal
Allow editors to **attach videos from Google Drive instead of uploading**.

### Why First?
- Removes upload friction
- Saves storage cost
- Huge real-world demand
- Unlocks agency workflows

### Features
- Connect Google account (OAuth)
- Browse Drive folders/files
- Select video file
- Store external reference instead of uploading
- Stream video securely in review page

### Technical Tasks
- Google OAuth flow
- Drive file picker
- Store:
  - external_provider = "google_drive"
  - external_file_id
  - external_file_url
- Signed access or proxy streaming
- Disable upload-based versioning for Drive files

### Completion Criteria
- Editor can select a Drive video
- Reviewer can watch it
- Comments work exactly like uploaded videos

---

## 2️⃣ Dropbox Integration

(Same structure as Google Drive)

### Goal
Support Dropbox-hosted videos.

### Completion Criteria
- OAuth works
- Video loads
- Versioning logic applies

---

## 3️⃣ Vimeo Integration

### Goal
Allow linking Vimeo-hosted review videos.

### Notes
- OAuth or public/private video support
- Token-based playback

### Completion Criteria
- Vimeo video playable inside review page
- Timestamp comments sync correctly

---

# PHASE 2 – VERSION & APPROVAL SYSTEM

## 4️⃣ Version Approval Workflow (CRITICAL)

### Goal
Introduce **formal approval** instead of "latest wins".

### Features
- Version states:
  - Pending
  - Approved
  - Rejected
- Approve / Reject buttons
- Lock comments after approval
- Approved badge
- Approval timestamp & user

### Completion Criteria
- Clients approve a version
- No new comments after approval
- Editor sees approval history

---

## 5️⃣ Advanced Version Management

### Features
- Manual "Set Active Version"
- Version history timeline
- Side-by-side comparison
- Download enabled only after approval

### Completion Criteria
- Editor fully controls version flow
- Clients clearly know what is final

---

# PHASE 3 – PROJECT LIFECYCLE

## 6️⃣ Project Management (Advanced)

### Features
- Archive / unarchive project
- Delete project (soft delete)
- Project settings page
- Project-level preferences (JSONB usage)
- Search & filter dashboard

### Completion Criteria
- Editor can fully manage project lifecycle

---

# PHASE 4 – COLLABORATION

## 7️⃣ Team Collaboration

### Features
- Invite team members via email
- Accept / reject invitation
- Roles:
  - Owner
  - Editor
  - Viewer
- Permission-based UI
- Remove team members

### Completion Criteria
- Multiple editors can work safely on one project

---

# PHASE 5 – COMMUNICATION & FEEDBACK

## 8️⃣ Advanced Commenting System

### Features
- Comment replies (threading)
- Comment editing (time-limited)
- Comment deletion
- Emoji reactions
- @mentions
- Inline comments on video

### Completion Criteria
- Commenting feels modern & collaborative

---

## 9️⃣ Notifications System

### Features
- Email notifications:
  - New comment
  - Reply
  - Version upload
  - Approval
  - Team invite
- In-app notification center
- Notification preferences
- Daily summaries
- Unread badges

### Completion Criteria
- Users never miss feedback

---

# PHASE 6 – BRANDING & BUSINESS READINESS

## 🔟 Branding & Customization

### Features
- Logo upload
- Brand colors
- Review page branding
- Custom domain (agency tier)

### Completion Criteria
- Agencies can white-label CutBack

---

# PHASE 7 – INSIGHTS & SCALE

## 1️⃣1️⃣ Analytics & Insights

### Features
- Revision count per project
- Avg feedback turnaround
- Comment resolution time
- Client responsiveness score
- Analytics dashboard with charts

### Completion Criteria
- Editors understand productivity & bottlenecks

---

# PHASE 8 – FUTURE INTELLIGENCE (OPTIONAL)

## 1️⃣2️⃣ AI Enhancements

### Features
- AI feedback summaries
- Auto-generated task lists
- Approval insights
- Suggested edits

### Completion Criteria
- Productivity multiplier, not required for v1

---

# ✅ FINAL CHECKLIST – PRODUCT IS READY WHEN:

- [ ] External video sources work (Drive, Dropbox, Vimeo)
- [ ] Version approval exists
- [ ] Projects can be archived/deleted
- [ ] Teams can collaborate
- [ ] Comments feel modern
- [ ] Notifications are reliable
- [ ] Branding is customizable
- [ ] Analytics provide insight

When all boxes are checked:
🎉 **CutBack is a complete, sellable SaaS product.**

---

**Owner:** You  
**Review Frequency:** Weekly  
**Rule:** Do not add new features until the next unchecked item is complete

