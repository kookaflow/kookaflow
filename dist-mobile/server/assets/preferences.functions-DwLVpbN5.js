import { c as createServerRpc } from "./createServerRpc-ywx44k3B.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
import "@supabase/supabase-js";
import "./createMiddleware-BvN2ghIY.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  job_role: z.string().min(1).max(60).optional(),
  shift_pattern: z.string().min(1).max(60).optional(),
  timezone: z.string().max(80).optional()
});
const ChannelSchema = z.enum(["email", "sms", "push", "both"]).nullable().optional();
const PreferencesUpdateSchema = z.object({
  theme: z.enum(["slate", "midnight", "lavender", "forest"]).optional(),
  theme_mode: z.enum(["light", "dark"]).optional(),
  accent_colour: z.string().max(20).nullable().optional(),
  default_view: z.enum(["month", "week", "day"]).optional(),
  week_starts_on: z.union([z.literal(0), z.literal(1)]).optional(),
  time_format: z.enum(["12h", "24h"]).optional(),
  show_week_numbers: z.boolean().optional(),
  show_public_holidays: z.boolean().optional(),
  hourly_rate: z.number().nonnegative().nullable().optional(),
  currency: z.enum(["AUD", "USD", "GBP", "EUR", "NZD"]).optional(),
  country: z.string().min(2).max(2).optional(),
  daily_reminder_enabled: z.boolean().optional(),
  daily_reminder_time: z.string().nullable().optional(),
  daily_reminder_channel: ChannelSchema,
  weekly_reminder_enabled: z.boolean().optional(),
  weekly_reminder_day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]).nullable().optional(),
  weekly_reminder_time: z.string().nullable().optional(),
  weekly_reminder_channel: ChannelSchema,
  sound_enabled: z.boolean().optional(),
  notification_sound: z.string().max(40).optional(),
  reminder_minutes_before: z.number().int().min(0).max(1440).optional(),
  shift_alert_sound: z.enum(["triple_chime", "rising_alert", "double_bell", "gentle_pulse", "none"]).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(40).nullable().optional()
});
const getProfile_createServerFn_handler = createServerRpc({
  id: "2463312fc4d1b2ffd2434ce4c0f80068611403d6f74377dd28e6a9ab1196f3be",
  name: "getProfile",
  filename: "src/lib/preferences.functions.ts"
}, (opts) => getProfile.__executeServer(opts));
const getProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getProfile_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("profiles").select("id,full_name,job_role,shift_pattern,timezone,onboarded_at").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});
const updateProfile_createServerFn_handler = createServerRpc({
  id: "2c8c8cd158627a7870819d611e726b3c7236006dd291b701e81ae6a04d31114b",
  name: "updateProfile",
  filename: "src/lib/preferences.functions.ts"
}, (opts) => updateProfile.__executeServer(opts));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => ProfileUpdateSchema.parse(input)).handler(updateProfile_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("profiles").update(data).eq("id", userId).select("id,full_name,job_role,shift_pattern,timezone,onboarded_at").single();
  if (error) throw new Error(error.message);
  return row;
});
const completeOnboarding_createServerFn_handler = createServerRpc({
  id: "c32e024ea22c2aed7c00796b6360c5d8fe11cdc9b55858d7af2fe026227d169a",
  name: "completeOnboarding",
  filename: "src/lib/preferences.functions.ts"
}, (opts) => completeOnboarding.__executeServer(opts));
const completeOnboarding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  full_name: z.string().min(1).max(120),
  job_role: z.string().min(1).max(60),
  shift_pattern: z.string().min(1).max(60)
}).parse(input)).handler(completeOnboarding_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("profiles").update({
    full_name: data.full_name,
    job_role: data.job_role,
    shift_pattern: data.shift_pattern,
    onboarded_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", userId).select("id,full_name,job_role,shift_pattern,onboarded_at").single();
  if (error) throw new Error(error.message);
  return row;
});
const getPreferences_createServerFn_handler = createServerRpc({
  id: "19718eb6225df91d07a00f3dd911b486d48f4879d098f96ca62d2f45d591dc6b",
  name: "getPreferences",
  filename: "src/lib/preferences.functions.ts"
}, (opts) => getPreferences.__executeServer(opts));
const getPreferences = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getPreferences_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});
const updatePreferences_createServerFn_handler = createServerRpc({
  id: "ba75cdea88e86f3aea58df065aa9236671dd2d3a27c5fba4b388fd328930d87b",
  name: "updatePreferences",
  filename: "src/lib/preferences.functions.ts"
}, (opts) => updatePreferences.__executeServer(opts));
const updatePreferences = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => PreferencesUpdateSchema.parse(input)).handler(updatePreferences_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("user_preferences").update(data).eq("user_id", userId).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
export {
  completeOnboarding_createServerFn_handler,
  getPreferences_createServerFn_handler,
  getProfile_createServerFn_handler,
  updatePreferences_createServerFn_handler,
  updateProfile_createServerFn_handler
};
