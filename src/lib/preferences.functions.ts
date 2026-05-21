import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  role: z.string().min(1).max(60).optional(),
  shift_pattern: z.string().min(1).max(60).optional(),
  timezone: z.string().max(80).optional(),
});

const PreferencesUpdateSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  default_view: z.enum(["month", "week", "day"]).optional(),
  week_starts_on: z.union([z.literal(0), z.literal(1)]).optional(),
  reminders: z.record(z.string(), z.unknown()).optional(),
  sounds: z.record(z.string(), z.unknown()).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,role,shift_pattern,timezone,onboarded_at")
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
      .select("id,display_name,role,shift_pattern,timezone,onboarded_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        display_name: z.string().min(1).max(120),
        role: z.string().min(1).max(60),
        shift_pattern: z.string().min(1).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("profiles")
      .update({
        display_name: data.display_name,
        role: data.role,
        shift_pattern: data.shift_pattern,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id,display_name,role,shift_pattern,onboarded_at")
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
      .select("user_id,theme,default_view,week_starts_on,reminders,sounds,email,phone")
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
      .select("user_id,theme,default_view,week_starts_on,reminders,sounds,email,phone")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });