import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  job_role: z.string().min(1).max(60).optional(),
  shift_pattern: z.string().min(1).max(60).optional(),
  timezone: z.string().max(80).optional(),
});

const ChannelSchema = z.enum(["email", "sms", "both"]).nullable().optional();
const PreferencesUpdateSchema = z.object({
  theme: z.enum(["slate", "midnight", "lavender", "forest"]).optional(),
  theme_mode: z.enum(["light", "dark"]).optional(),
  accent_colour: z.string().max(20).nullable().optional(),
  default_view: z.enum(["month", "week", "day"]).optional(),
  week_starts_on: z.union([z.literal(0), z.literal(1)]).optional(),
  hourly_rate: z.number().nonnegative().nullable().optional(),
  currency: z.enum(["AUD", "USD", "GBP", "EUR", "NZD"]).optional(),
  country: z.string().min(2).max(2).optional(),
  daily_reminder_enabled: z.boolean().optional(),
  daily_reminder_time: z.string().nullable().optional(),
  daily_reminder_channel: ChannelSchema,
  weekly_reminder_enabled: z.boolean().optional(),
  weekly_reminder_day: z.enum(["mon","tue","wed","thu","fri","sat","sun"]).nullable().optional(),
  weekly_reminder_time: z.string().nullable().optional(),
  weekly_reminder_channel: ChannelSchema,
  sound_enabled: z.boolean().optional(),
  notification_sound: z.string().max(40).optional(),
  reminder_minutes_before: z.number().int().min(0).max(1440).optional(),
  shift_alert_sound: z.enum(["triple_chime","rising_alert","double_bell","gentle_pulse","none"]).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name,job_role,shift_pattern,timezone,onboarded_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProfileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select("id,full_name,job_role,shift_pattern,timezone,onboarded_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().min(1).max(120),
        job_role: z.string().min(1).max(60),
        shift_pattern: z.string().min(1).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        job_role: data.job_role,
        shift_pattern: data.shift_pattern,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id,full_name,job_role,shift_pattern,onboarded_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updatePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PreferencesUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("user_preferences")
      .update(data as never)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });