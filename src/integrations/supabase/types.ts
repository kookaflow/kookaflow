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
      categories: {
        Row: {
          color: string
          icon: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          color: string
          icon: string
          id: string
          label: string
          sort_order?: number
        }
        Update: {
          color?: string
          icon?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean
          category: string
          created_at: string
          ends_at: string
          hourly_rate: number | null
          icon_gradient: string | null
          icon_name: string | null
          id: string
          is_payday: boolean
          location: string | null
          notes: string | null
          recurrence: Json
          shift_role: string | null
          shift_type: string | null
          split_shift_break_duration: number | null
          split_shift_first_end: string | null
          split_shift_first_start: string | null
          split_shift_second_end: string | null
          split_shift_second_start: string | null
          starts_at: string
          title: string
          travel_duration_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          category: string
          created_at?: string
          ends_at: string
          hourly_rate?: number | null
          icon_gradient?: string | null
          icon_name?: string | null
          id?: string
          is_payday?: boolean
          location?: string | null
          notes?: string | null
          recurrence?: Json
          shift_role?: string | null
          shift_type?: string | null
          split_shift_break_duration?: number | null
          split_shift_first_end?: string | null
          split_shift_first_start?: string | null
          split_shift_second_end?: string | null
          split_shift_second_start?: string | null
          starts_at: string
          title: string
          travel_duration_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          category?: string
          created_at?: string
          ends_at?: string
          hourly_rate?: number | null
          icon_gradient?: string | null
          icon_name?: string | null
          id?: string
          is_payday?: boolean
          location?: string | null
          notes?: string | null
          recurrence?: Json
          shift_role?: string | null
          shift_type?: string | null
          split_shift_break_duration?: number | null
          split_shift_first_end?: string | null
          split_shift_first_start?: string | null
          split_shift_second_end?: string | null
          split_shift_second_start?: string | null
          starts_at?: string
          title?: string
          travel_duration_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          onboarded_at: string | null
          role: string | null
          shift_pattern: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          onboarded_at?: string | null
          role?: string | null
          shift_pattern?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded_at?: string | null
          role?: string | null
          shift_pattern?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_holidays: {
        Row: {
          country: string
          created_at: string
          date: string
          id: string
          name: string
          region: string | null
        }
        Insert: {
          country: string
          created_at?: string
          date: string
          id?: string
          name: string
          region?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          date?: string
          id?: string
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accent_colour: string | null
          country: string
          currency: string
          default_view: string
          email: string | null
          hourly_rate: number | null
          phone: string | null
          reminders: Json
          sounds: Json
          theme: string
          theme_mode: string
          updated_at: string
          user_id: string
          week_starts_on: number
        }
        Insert: {
          accent_colour?: string | null
          country?: string
          currency?: string
          default_view?: string
          email?: string | null
          hourly_rate?: number | null
          phone?: string | null
          reminders?: Json
          sounds?: Json
          theme?: string
          theme_mode?: string
          updated_at?: string
          user_id: string
          week_starts_on?: number
        }
        Update: {
          accent_colour?: string | null
          country?: string
          currency?: string
          default_view?: string
          email?: string | null
          hourly_rate?: number | null
          phone?: string | null
          reminders?: Json
          sounds?: Json
          theme?: string
          theme_mode?: string
          updated_at?: string
          user_id?: string
          week_starts_on?: number
        }
        Relationships: []
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
    Enums: {},
  },
} as const
