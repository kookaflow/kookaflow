import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { deviceProfileUpdate, parseDeviceUpdate } from "./pushDevice";

export const getOneSignalConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    return { appId: process.env.ONESIGNAL_APP_ID ?? null };
  },
);

/**
 * Device-only update, called by every app version on load.
 * It NEVER changes the account push setting: any `enabled` value sent by
 * older builds is accepted for compatibility and ignored.
 */
export const updatePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parseDeviceUpdate(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.playerId) return { ok: true };
    const { error } = await supabase
      .from("profiles")
      .update(deviceProfileUpdate(data))
      .eq("id", userId);
    if (error) throw new Error(error.message);
    const { error: devErr } = await supabase.from("push_devices").upsert(
      {
        user_id: userId,
        subscription_id: data.playerId,
        platform: data.platform ?? null,
        opted_in: data.optedIn ?? data.enabled ?? false,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,subscription_id" },
    );
    if (devErr) console.warn("[push] device save failed", devErr.message);
    return { ok: true };
  });

/** The only way to change the account push setting: the settings switch. */
export const setPushEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ enabled: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("set_push_enabled", {
      _enabled: data.enabled,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPushStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "onesignal_player_id, push_notifications_enabled, push_daily_reminder, push_weekly_reminder, push_shift_alerts",
      )
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updatePushPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        push_daily_reminder: z.boolean().optional(),
        push_weekly_reminder: z.boolean().optional(),
        push_shift_alerts: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });