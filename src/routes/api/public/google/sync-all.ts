import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { syncUserCalendar } from "@/lib/google-calendar.server";

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
          .select("user_id");
        const results: Array<{ userId: string; ok: boolean; error?: string }> = [];
        for (const c of conns ?? []) {
          try {
            await syncUserCalendar(c.user_id);
            results.push({ userId: c.user_id, ok: true });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await supabaseAdmin
              .from("google_calendar_connections")
              .update({ last_sync_error: msg })
              .eq("user_id", c.user_id);
            results.push({ userId: c.user_id, ok: false, error: msg });
          }
        }
        return Response.json({ ok: true, count: results.length, results });
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger sync" }),
    },
  },
});