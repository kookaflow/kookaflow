import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient } from "@/lib/reminders/email.server";
import { sendPushToUser } from "@/lib/reminders/push.server";

export const Route = createFileRoute(
  "/api/public/hooks/dispatch-shift-alerts",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        if (!expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabase = getAdminClient();
        const nowIso = new Date().toISOString();

        // Pull due, unsent alerts (limit batch for safety).
        const { data: due, error } = await supabase
          .from("scheduled_push_alerts")
          .select("id,user_id,title,message,url,fire_at")
          .is("sent_at", null)
          .lte("fire_at", nowIso)
          .order("fire_at", { ascending: true })
          .limit(200);
        if (error) {
          return new Response(`query error: ${error.message}`, { status: 500 });
        }

        const results: Array<{ id: string; status: string }> = [];
        for (const row of due ?? []) {
          try {
            const res = await sendPushToUser({
              supabaseAdmin: supabase,
              userId: row.user_id,
              title: row.title,
              message: row.message,
              url: row.url ?? undefined,
            });
            await supabase
              .from("scheduled_push_alerts")
              .update({ sent_at: new Date().toISOString() })
              .eq("id", row.id);
            results.push({
              id: row.id,
              status: res.skipped ? `skipped:${res.reason}` : "sent",
            });
          } catch (e: any) {
            results.push({ id: row.id, status: `error:${e?.message ?? "unknown"}` });
          }
        }

        return Response.json({ ok: true, dispatched: results.length, results });
      },
    },
  },
});