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
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      video_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          duration: number | null
          storage_url: string
          is_active: boolean
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          duration?: number | null
          storage_url: string
          is_active?: boolean
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          duration?: number | null
          storage_url?: string
          is_active?: boolean
          uploaded_by?: string
          created_at?: string
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
          status: string
          parent_comment_id: string | null
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
          status?: string
          parent_comment_id?: string | null
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
          status?: string
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_links: {
        Row: {
          id: string
          project_id: string
          token: string
          password_hash: string | null
          expires_at: string | null
          is_active: boolean
          access_count: number
          last_accessed_at: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          project_id: string
          token?: string
          password_hash?: string | null
          expires_at?: string | null
          is_active?: boolean
          access_count?: number
          last_accessed_at?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          project_id?: string
          token?: string
          password_hash?: string | null
          expires_at?: string | null
          is_active?: boolean
          access_count?: number
          last_accessed_at?: string | null
          created_at?: string
          created_by?: string
        }
      }
      team_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      project_invitations: {
        Row: {
          id: string
          project_id: string
          email: string
          role: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          email: string
          role?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          email?: string
          role?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          type: string
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
          type: string
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
          type?: string
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
