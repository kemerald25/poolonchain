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
      users: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          cp_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          cp_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          cp_total?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          name: string
          host_user_id: string | null
          guest_user_id: string | null
          mode: 'free' | 'wager'
          wager_amount_drops: number | null
          status: 'waiting' | 'confirming' | 'active' | 'completed' | 'cancelled'
          escrow_condition: string | null
          escrow_sequence_host: number | null
          escrow_sequence_guest: number | null
          winner_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          host_user_id?: string | null
          guest_user_id?: string | null
          mode: 'free' | 'wager'
          wager_amount_drops?: number | null
          status?: 'waiting' | 'confirming' | 'active' | 'completed' | 'cancelled'
          escrow_condition?: string | null
          escrow_sequence_host?: number | null
          escrow_sequence_guest?: number | null
          winner_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          host_user_id?: string | null
          guest_user_id?: string | null
          mode?: 'free' | 'wager'
          wager_amount_drops?: number | null
          status?: 'waiting' | 'confirming' | 'active' | 'completed' | 'cancelled'
          escrow_condition?: string | null
          escrow_sequence_host?: number | null
          escrow_sequence_guest?: number | null
          winner_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_guest_user_id_fkey"
            columns: ["guest_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          room_id: string | null
          player_one_id: string | null
          player_two_id: string | null
          winner_id: string | null
          mode: 'free' | 'wager'
          wager_amount_drops: number | null
          cp_awarded: number
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          player_one_id?: string | null
          player_two_id?: string | null
          winner_id?: string | null
          mode: 'free' | 'wager'
          wager_amount_drops?: number | null
          cp_awarded?: number
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          player_one_id?: string | null
          player_two_id?: string | null
          winner_id?: string | null
          mode?: 'free' | 'wager'
          wager_amount_drops?: number | null
          cp_awarded?: number
          duration_seconds?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_player_one_id_fkey"
            columns: ["player_one_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player_two_id_fkey"
            columns: ["player_two_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cp_transactions: {
        Row: {
          id: string
          user_id: string | null
          amount: number
          reason: 'match_win'
          match_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount: number
          reason: 'match_win'
          match_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          amount?: number
          reason?: 'match_win'
          match_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cp_transactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_mode: 'free' | 'wager'
      room_status: 'waiting' | 'confirming' | 'active' | 'completed' | 'cancelled'
      cp_reason: 'match_win'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
