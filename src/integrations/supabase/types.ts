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
          is_active: boolean
          is_system: boolean
          label: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          color: string
          icon: string
          id: string
          is_active?: boolean
          is_system?: boolean
          label: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          color?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          label?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          calculated_earnings: number | null
          category: string
          created_at: string
          end_time: string
          google_event_id: string | null
          hourly_rate: number | null
          icon_color: string | null
          icon_name: string | null
          id: string
          is_all_day: boolean
          is_payday: boolean
          is_recurring: boolean
          location: string | null
          notes: string | null
          recurrence_days: string[] | null
          recurrence_end_date: string | null
          recurrence_group_id: string | null
          recurrence_pattern: string | null
          shift_role: string | null
          shift_type: string | null
          split_shift_break_duration: number | null
          split_shift_first_end: string | null
          split_shift_first_start: string | null
          split_shift_second_end: string | null
          split_shift_second_start: string | null
          start_time: string
          title: string
          travel_duration_minutes: number | null
          unpaid_break_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calculated_earnings?: number | null
          category: string
          created_at?: string
          end_time: string
          google_event_id?: string | null
          hourly_rate?: number | null
          icon_color?: string | null
          icon_name?: string | null
          id?: string
          is_all_day?: boolean
          is_payday?: boolean
          is_recurring?: boolean
          location?: string | null
          notes?: string | null
          recurrence_days?: string[] | null
          recurrence_end_date?: string | null
          recurrence_group_id?: string | null
          recurrence_pattern?: string | null
          shift_role?: string | null
          shift_type?: string | null
          split_shift_break_duration?: number | null
          split_shift_first_end?: string | null
          split_shift_first_start?: string | null
          split_shift_second_end?: string | null
          split_shift_second_start?: string | null
          start_time: string
          title: string
          travel_duration_minutes?: number | null
          unpaid_break_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calculated_earnings?: number | null
          category?: string
          created_at?: string
          end_time?: string
          google_event_id?: string | null
          hourly_rate?: number | null
          icon_color?: string | null
          icon_name?: string | null
          id?: string
          is_all_day?: boolean
          is_payday?: boolean
          is_recurring?: boolean
          location?: string | null
          notes?: string | null
          recurrence_days?: string[] | null
          recurrence_end_date?: string | null
          recurrence_group_id?: string | null
          recurrence_pattern?: string | null
          shift_role?: string | null
          shift_type?: string | null
          split_shift_break_duration?: number | null
          split_shift_first_end?: string | null
          split_shift_first_start?: string | null
          split_shift_second_end?: string | null
          split_shift_second_start?: string | null
          start_time?: string
          title?: string
          travel_duration_minutes?: number | null
          unpaid_break_minutes?: number | null
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
      nudge_dismissals: {
        Row: {
          dismissed_at: string
          id: string
          nudge_type: string
          reshow_after: string | null
          user_id: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          nudge_type: string
          reshow_after?: string | null
          user_id: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          nudge_type?: string
          reshow_after?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          job_role: string | null
          onboarded_at: string | null
          shift_pattern: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          job_role?: string | null
          onboarded_at?: string | null
          shift_pattern?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          job_role?: string | null
          onboarded_at?: string | null
          shift_pattern?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_holidays: {
        Row: {
          country_code: string
          created_at: string
          date: string
          fetched_at: string
          id: string
          name: string
          region: string | null
          year: number
        }
        Insert: {
          country_code: string
          created_at?: string
          date: string
          fetched_at?: string
          id?: string
          name: string
          region?: string | null
          year: number
        }
        Update: {
          country_code?: string
          created_at?: string
          date?: string
          fetched_at?: string
          id?: string
          name?: string
          region?: string | null
          year?: number
        }
        Relationships: []
      }
      reminder_sends: {
        Row: {
          id: string
          kind: string
          sent_at: string
          sent_for_date: string
          user_id: string
        }
        Insert: {
          id?: string
          kind: string
          sent_at?: string
          sent_for_date: string
          user_id: string
        }
        Update: {
          id?: string
          kind?: string
          sent_at?: string
          sent_for_date?: string
          user_id?: string
        }
        Relationships: []
      }
      shift_templates: {
        Row: {
          base_type: string | null
          category: string
          colour: string
          created_at: string
          default_end: string | null
          default_start: string | null
          icon_name: string | null
          id: string
          is_24_hour: boolean
          is_active: boolean
          is_all_day: boolean
          is_split_shift: boolean
          life_category: string
          name: string
          paid_break_minutes: number
          show_as: string | null
          sort_order: number
          split_end_2: string | null
          split_start_2: string | null
          total_hours: number | null
          unpaid_break_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_type?: string | null
          category: string
          colour: string
          created_at?: string
          default_end?: string | null
          default_start?: string | null
          icon_name?: string | null
          id?: string
          is_24_hour?: boolean
          is_active?: boolean
          is_all_day?: boolean
          is_split_shift?: boolean
          life_category?: string
          name: string
          paid_break_minutes?: number
          show_as?: string | null
          sort_order?: number
          split_end_2?: string | null
          split_start_2?: string | null
          total_hours?: number | null
          unpaid_break_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_type?: string | null
          category?: string
          colour?: string
          created_at?: string
          default_end?: string | null
          default_start?: string | null
          icon_name?: string | null
          id?: string
          is_24_hour?: boolean
          is_active?: boolean
          is_all_day?: boolean
          is_split_shift?: boolean
          life_category?: string
          name?: string
          paid_break_minutes?: number
          show_as?: string | null
          sort_order?: number
          split_end_2?: string | null
          split_start_2?: string | null
          total_hours?: number | null
          unpaid_break_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_category_visibility: {
        Row: {
          category_id: string
          created_at: string
          hidden: boolean
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          hidden?: boolean
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          hidden?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accent_colour: string | null
          country: string
          currency: string
          daily_reminder_channel: string | null
          daily_reminder_enabled: boolean
          daily_reminder_time: string | null
          default_view: string
          email: string | null
          hourly_rate: number | null
          notification_sound: string
          phone: string | null
          reminder_minutes_before: number
          reminders: Json
          shift_alert_sound: string
          sound_enabled: boolean
          sounds: Json
          theme: string
          theme_mode: string
          updated_at: string
          user_id: string
          week_starts_on: number
          weekly_reminder_channel: string | null
          weekly_reminder_day: string | null
          weekly_reminder_enabled: boolean
          weekly_reminder_time: string | null
        }
        Insert: {
          accent_colour?: string | null
          country?: string
          currency?: string
          daily_reminder_channel?: string | null
          daily_reminder_enabled?: boolean
          daily_reminder_time?: string | null
          default_view?: string
          email?: string | null
          hourly_rate?: number | null
          notification_sound?: string
          phone?: string | null
          reminder_minutes_before?: number
          reminders?: Json
          shift_alert_sound?: string
          sound_enabled?: boolean
          sounds?: Json
          theme?: string
          theme_mode?: string
          updated_at?: string
          user_id: string
          week_starts_on?: number
          weekly_reminder_channel?: string | null
          weekly_reminder_day?: string | null
          weekly_reminder_enabled?: boolean
          weekly_reminder_time?: string | null
        }
        Update: {
          accent_colour?: string | null
          country?: string
          currency?: string
          daily_reminder_channel?: string | null
          daily_reminder_enabled?: boolean
          daily_reminder_time?: string | null
          default_view?: string
          email?: string | null
          hourly_rate?: number | null
          notification_sound?: string
          phone?: string | null
          reminder_minutes_before?: number
          reminders?: Json
          shift_alert_sound?: string
          sound_enabled?: boolean
          sounds?: Json
          theme?: string
          theme_mode?: string
          updated_at?: string
          user_id?: string
          week_starts_on?: number
          weekly_reminder_channel?: string | null
          weekly_reminder_day?: string | null
          weekly_reminder_enabled?: boolean
          weekly_reminder_time?: string | null
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
