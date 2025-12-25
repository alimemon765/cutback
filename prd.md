# 📘 Product Requirements Document (PRD)

## Product Name
**CutBack**

## Product Type
Web Application (B2B SaaS)

## Product Stage
Post-MVP / Full Product Build

## Target Release
Phase-based rollout after MVP validation

---

## 1. Product Vision

CutBack aims to become the **go-to video feedback and approval tool for solo editors and small creative teams**, offering clarity, speed, and simplicity—without enterprise bloat.

---

## 2. Target Users

### Primary Users
- Freelance video editors
- Solo creators
- YouTube / social media editors

### Secondary Users
- Small creative agencies (2–10 people)
- Marketing teams collaborating with editors

### Non-Target Users
- Large enterprises
- Film studios
- Broadcast media houses

---

## 3. Problem Statement

Video editors struggle with inefficient feedback loops caused by:
- Vague, non-timestamped client feedback
- Feedback scattered across WhatsApp, email, and calls
- Increased revision cycles
- Tools that are overbuilt, slow, or confusing

Existing tools increasingly prioritize enterprise workflows, leading to feature bloat and degraded usability for solo editors.

---

## 4. Goals & Success Metrics

### Product Goals
- Reduce revision cycles
- Improve clarity of client feedback
- Save editors time per project
- Create a sticky workflow tool

### Success Metrics
- Percentage of projects with client comments
- Average comments per video
- Reduction in revision rounds (self-reported)
- Weekly active editors
- Project retention over 30 days

---

## 5. Core Features (Full Product)

### 5.1 Project & Workspace Management
- Create multiple projects
- Project-level settings
- Archive completed projects
- Simple workspace dashboard

---

### 5.2 Advanced Version Management
- Linear version stacking (v1 → v2 → v3)
- Upload new versions without breaking comment history
- Clear visual indicators for active version
- Optional side-by-side version comparison

---

### 5.3 Timestamp-Based Feedback
- Comment at exact timestamps
- Inline replies
- Emoji reactions (optional)
- @mentions for team members
- Jump-to-timestamp on click

---

### 5.4 Client Review Experience
- Clean, distraction-free review UI
- Optional password protection
- Comment editing within a defined time window
- Client name capture without account creation

---

### 5.5 Approval & Status System
- Comment statuses:
  - Open
  - In Progress
  - Resolved
- Version approval states:
  - Pending
  - Approved
- Final approval marker for completed projects

---

### 5.6 Notifications
- Email notifications for:
  - New comments
  - Replies
  - Version uploads
- Optional daily summary
- Notification preferences per project

---

### 5.7 Team Collaboration
- Invite team members
- Roles:
  - Owner
  - Editor
  - Viewer
- Simple permissions model

---

### 5.8 Branding & Customization
- Custom logo on client review pages
- Brand color customization
- Custom domain support (agency tier)

---

### 5.9 File & Storage Enhancements
- Direct video uploads
- External video integrations:
  - Google Drive
  - Dropbox
  - Vimeo
- Download permissions after approval

---

### 5.10 Analytics & Insights
- Revision count per project
- Average feedback turnaround time
- Comment resolution duration
- Client responsiveness metrics

---

## 6. Non-Functional Requirements

### Performance
- Fast video playback
- Minimal processing delay
- Optimized handling of large files

### Usability
- Zero learning curve for clients
- Editor-first interface
- Minimal clicks for core actions

### Security
- Secure share links
- Controlled access to private projects
- Encryption in transit and at rest

### Scalability
- Support for growing storage needs
- Concurrent reviewer access
- Modular backend architecture

---

## 7. Monetization Strategy

### Pricing Tiers

**Free**
- Limited projects
- Limited storage

**Pro**
- Unlimited projects
- Version history
- Notifications

**Agency**
- Team collaboration
- Branding and custom domains
- Advanced analytics

Pricing model: Monthly subscription.

---

## 8. Risks & Mitigation

| Risk | Mitigation |
|----|----|
| Competition from large tools | Focus on niche simplicity |
| Feature creep | Strict roadmap control |
| High storage costs | External links + tiered storage |
| Client adoption friction | No-login client experience |

---

## 9. Future Enhancements

- AI-generated feedback summaries
- Automatic task lists from comments
- Integration with editing tools (DaVinci Resolve, Premiere)
- Mobile-optimized review experience
- Public showcase links for approved projects

---

## 10. Technology Stack

### Frontend
- Next.js (React)
- Tailwind CSS
- HTML5 Video API

### Backend
- Next.js API routes
- Migration-ready Node.js services

### Database
- PostgreSQL
- Managed via Supabase or Neon

### Storage
- Supabase Storage
- External video integrations
- CDN-backed delivery

### Authentication
- Supabase Auth
- Magic links / OAuth for editors
- Token-based public access for clients

### Notifications
- Transactional email service
- Webhooks for future integrations

### Analytics
- PostHog or custom event tracking

### Deployment
- Vercel
- GitHub-based CI/CD

---

## 11. Positioning Summary

**CutBack** is a focused video feedback platform built for editors who want clarity and speed—without enterprise complexity.
