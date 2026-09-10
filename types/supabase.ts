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
          user_id: string
          display_name: string | null
          mobile_number: string | null
          avatar_url: string | null
          region_id: string | null
          province_id: string | null
          status: string | null
          status_message: string | null
          last_seen: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          mobile_number?: string | null
          avatar_url?: string | null
          region_id?: string | null
          province_id?: string | null
          status?: string | null
          status_message?: string | null
          last_seen?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          mobile_number?: string | null
          avatar_url?: string | null
          region_id?: string | null
          province_id?: string | null
          status?: string | null
          status_message?: string | null
          last_seen?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      buddies: {
        Row: {
          id: string
          user_id: string
          buddy_id: string
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          buddy_id: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          buddy_id?: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string | null
          chatroom_id: string | null
          content: string
          type: string
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id?: string | null
          chatroom_id?: string | null
          content: string
          type?: string
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string | null
          chatroom_id?: string | null
          content?: string
          type?: string
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      chatrooms: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          region_id: string | null
          created_by: string | null
          is_public: boolean | null
          member_count: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          region_id?: string | null
          created_by?: string | null
          is_public?: boolean | null
          member_count?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          region_id?: string | null
          created_by?: string | null
          is_public?: boolean | null
          member_count?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      chatroom_members: {
        Row: {
          id: string
          chatroom_id: string
          user_id: string
          role: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          chatroom_id: string
          user_id: string
          role?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          chatroom_id?: string
          user_id?: string
          role?: string | null
          joined_at?: string
        }
      }
      message_status: {
        Row: {
          id: string
          message_id: string
          user_id: string
          is_read: boolean | null
          read_at: string | null
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          is_read?: boolean | null
          read_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          is_read?: boolean | null
          read_at?: string | null
        }
      }
      regions: {
        Row: {
          id: string
          name: string
          code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          created_at?: string
        }
      }
      provinces: {
        Row: {
          id: string
          name: string
          region_id: string
          code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          region_id: string
          code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          region_id?: string
          code?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          notifications: boolean | null
          auto_message_display: boolean | null
          offline_delivery: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          notifications?: boolean | null
          auto_message_display?: boolean | null
          offline_delivery?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          notifications?: boolean | null
          auto_message_display?: boolean | null
          offline_delivery?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          inviter_id: string
          invited_phone: string
          status: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inviter_id: string
          invited_phone: string
          status?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inviter_id?: string
          invited_phone?: string
          status?: string | null
          sent_at?: string | null
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
      user_status: 'online' | 'offline' | 'busy' | 'away'
      offline_delivery_method: 'server' | 'sms' | 'email'
    }
  }
}
