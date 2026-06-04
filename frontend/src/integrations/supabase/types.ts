export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string | null
          requirement_value: number | null
          xp_reward: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type?: string | null
          requirement_value?: number | null
          xp_reward?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string | null
          requirement_value?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          end_time: string
          id: string
          notes: string | null
          package_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
          workstation_id: string
          xp_earned: number
          zone_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          package_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          user_id: string
          workstation_id: string
          xp_earned?: number
          zone_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          package_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          user_id?: string
          workstation_id?: string
          xp_earned?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          title?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          category: Database["public"]["Enums"]["package_category"]
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
          xp_reward: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["package_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          xp_reward?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["package_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          level: number
          phone_number: string | null
          total_hours: number
          total_sessions: number
          username: string | null
          xp_points: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          level?: number
          phone_number?: string | null
          total_hours?: number
          total_sessions?: number
          username?: string | null
          xp_points?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          level?: number
          phone_number?: string | null
          total_hours?: number
          total_sessions?: number
          username?: string | null
          xp_points?: number
        }
        Relationships: []
      }
      tournament_registrations: {
        Row: {
          id: string
          registered_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          registered_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          registered_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          entry_fee: number | null
          game: string | null
          id: string
          image_url: string | null
          max_participants: number | null
          name: string
          prize_pool: number | null
          start_time: string | null
          status: Database["public"]["Enums"]["tournament_status"]
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          entry_fee?: number | null
          game?: string | null
          id?: string
          image_url?: string | null
          max_participants?: number | null
          name: string
          prize_pool?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          entry_fee?: number | null
          game?: string | null
          id?: string
          image_url?: string | null
          max_participants?: number | null
          name?: string
          prize_pool?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workstations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          position_x: number
          position_y: number
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position_x?: number
          position_y?: number
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position_x?: number
          position_y?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workstations_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string
          description: string | null
          hourly_rate: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          seat_count: number
          specs: Json | null
          tier: Database["public"]["Enums"]["zone_tier"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          hourly_rate?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          seat_count?: number
          specs?: Json | null
          tier?: Database["public"]["Enums"]["zone_tier"]
        }
        Update: {
          created_at?: string
          description?: string | null
          hourly_rate?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          seat_count?: number
          specs?: Json | null
          tier?: Database["public"]["Enums"]["zone_tier"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      booking_status:
        | "Pending"
        | "Confirmed"
        | "Active"
        | "Completed"
        | "Cancelled"
        | "No-Show"
      package_category:
        | "Hourly"
        | "Day Pass"
        | "Night Session"
        | "Tournament Slot"
        | "VR Experience"
      tournament_status:
        | "Upcoming"
        | "Registration Open"
        | "In Progress"
        | "Completed"
      zone_tier: "Standard" | "Pro" | "VIP" | "Streaming" | "VR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
      booking_status: [
        "Pending",
        "Confirmed",
        "Active",
        "Completed",
        "Cancelled",
        "No-Show",
      ],
      package_category: [
        "Hourly",
        "Day Pass",
        "Night Session",
        "Tournament Slot",
        "VR Experience",
      ],
      tournament_status: [
        "Upcoming",
        "Registration Open",
        "In Progress",
        "Completed",
      ],
      zone_tier: ["Standard", "Pro", "VIP", "Streaming", "VR"],
    },
  },
} as const
