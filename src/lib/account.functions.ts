import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Permanently deletes the authenticated user's account and all their data.
 */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Delete from every table that holds per-user rows. Order isn't critical
    // because none have FKs to one another, but we batch for clarity.
    const userScopedTables = [
      "events",
      "google_events_cache",
      "google_calendar_connections",
      "nudge_dismissals",
      "shift_templates",
      "user_category_visibility",
      "scheduled_push_alerts",
      "reminder_sends",
      "user_preferences",
      "categories",
    ] as const;

    for (const table of userScopedTables) {
      const { error } = await (supabaseAdmin.from(table) as any)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.error(`[deleteAccount] failed to clear ${table}:`, error.message);
      }
    }
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) {
      console.error(`[deleteAccount] failed to clear profiles:`, profileError.message);
    }

    // Finally, delete the auth user itself.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      throw new Error(`Failed to delete account: ${authError.message}`);
    }

    return { ok: true as const };
  });