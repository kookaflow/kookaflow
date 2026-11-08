import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { syncUserCalendar } from "@/lib/google-calendar.server";
import { classifyGoogleError, friendlyStoredError } from "@/lib/googleErrors";

export const Route = createFileRoute("/api/public/google/sync-all")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data: conns } = await supabaseAdmin
          .from("google_calendar_connections")
          .select("user_id, last_sync_error");
        const results: Array<{ userId: string; ok: boolean; error?: string }> = [];
        for (const c of conns ?? []) {
          // Skip connections waiting for the user to reconnect.
          if (friendlyStoredError(c.last_sync_error)?.code === "needs_reconnect") {
            results.push({ userId: c.user_id, ok: false, error: "needs_reconnect" });
            continue;
          }
          try {
            await syncUserCalendar(c.user_id);
            results.push({ userId: c.user_id, ok: true });
          } catch (e) {
            console.error(`[google] background sync failed for ${c.user_id}`, e);
            const code = classifyGoogleError(e);
            await supabaseAdmin
              .from("google_calendar_connections")
              .update({ last_sync_error: code })
              .eq("user_id", c.user_id);
            results.push({ userId: c.user_id, ok: false, error: code });
          }
        }
        return Response.json({ ok: true, count: results.length, results });
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger sync" }),
    },
  },
});