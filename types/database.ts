// Auto-generated database types based on Supabase schema
// These types match the database tables exactly

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          is_archived: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          is_archived?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          is_archived?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          created_at?: string
        }
      }
      video_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          file_url: string
          file_name: string
          file_size: number | null
          duration: number | null
          thumbnail_url: string | null
          is_active: boolean
          approval_status: 'pending' | 'approved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          file_url: string
          file_name: string
          file_size?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          is_active?: boolean
          approval_status?: 'pending' | 'approved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          file_url?: string
          file_name?: string
          file_size?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          is_active?: boolean
          approval_status?: 'pending' | 'approved'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          video_version_id: string
          user_id: string | null
          client_name: string | null
          timestamp: number
          content: string
          status: 'open' | 'in_progress' | 'resolved'
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_version_id: string
          user_id?: string | null
          client_name?: string | null
          timestamp: number
          content: string
          status?: 'open' | 'in_progress' | 'resolved'
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_version_id?: string
          user_id?: string | null
          client_name?: string | null
          timestamp?: number
          content?: string
          status?: 'open' | 'in_progress' | 'resolved'
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_invitations: {
        Row: {
          id: string
          project_id: string
          email: string
          role: 'editor' | 'viewer'
          token: string
          invited_by: string
          accepted_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          email: string
          role: 'editor' | 'viewer'
          token: string
          invited_by: string
          accepted_at?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          email?: string
          role?: 'editor' | 'viewer'
          token?: string
          invited_by?: string
          accepted_at?: string | null
          expires_at?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          type: 'comment' | 'reply' | 'version_upload' | 'invitation' | 'mention'
          title: string
          message: string | null
          read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          type: 'comment' | 'reply' | 'version_upload' | 'invitation' | 'mention'
          title: string
          message?: string | null
          read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          type?: 'comment' | 'reply' | 'version_upload' | 'invitation' | 'mention'
          title?: string
          message?: string | null
          read?: boolean
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

