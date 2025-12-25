// App constants
export const APP_NAME = 'CutBack';
export const APP_DESCRIPTION = 'Video Feedback & Approval Tool';

// Comment statuses
export const COMMENT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
} as const;

// Version approval states
export const VERSION_APPROVAL = {
  PENDING: 'pending',
  APPROVED: 'approved',
} as const;

// Team roles
export const TEAM_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

// File upload limits
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

