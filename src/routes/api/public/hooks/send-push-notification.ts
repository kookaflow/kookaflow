import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdminClient } from "@/lib/reminders/email.server";
import { sendPushToUser } from "@/lib/reminders/push.server";

const BodySchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  url: z.string().url().optional(),
  scheduledFor: z.string().datetime().optional(),
});

export const Route = createFileRoute(
  "/api/public/hooks/send-push-notification",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY ??
          process.env.SUPABASE_ANON_KEY;
        if (!expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "validation_failed", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const supabase = getAdminClient();
        try {
          const result = await sendPushToUser({
            supabaseAdmin: supabase,
            userId: parsed.data.userId,
            title: parsed.data.title,
            message: parsed.data.message,
            url: parsed.data.url,
            scheduledFor: parsed.data.scheduledFor,
          });
          return Response.json({ ok: true, result });
        } catch (e: any) {
          return Response.json(
            { ok: false, error: e?.message ?? "send_failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});