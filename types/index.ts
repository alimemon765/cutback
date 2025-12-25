// Re-export database types
export type { Database } from './database';

// Convenience types for common use cases
import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type VideoVersion = Database['public']['Tables']['video_versions']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type ProjectInvitation = Database['public']['Tables']['project_invitations']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type VideoVersionInsert = Database['public']['Tables']['video_versions']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type VideoVersionUpdate = Database['public']['Tables']['video_versions']['Update'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

// Extended types with relations
export type ProjectWithOwner = Project & {
  owner?: Profile;
};

export type VideoVersionWithProject = VideoVersion & {
  project?: Project;
};

export type CommentWithUser = Comment & {
  user?: Profile;
  replies?: CommentWithUser[];
};

export type ProjectWithTeam = Project & {
  team_members?: (TeamMember & { user?: Profile })[];
};

