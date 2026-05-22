import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  exchangeCodeForTokens,
  getRedirectUri,
  getUserInfoEmail,
  syncUserCalendar,
  verifyState,
} from "@/lib/google-calendar.server";

function htmlResponse(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}main{max-width:420px}h1{margin:0 0 12px;font-size:22px}p{color:#aaa;margin:0 0 24px}a{display:inline-block;padding:10px 18px;border-radius:8px;background:#fff;color:#000;text-decoration:none;font-weight:600}</style>
    </head><body><main>${body}<p style="margin-top:24px"><a href="/settings">Back to Settings</a></p></main>
    <script>setTimeout(function(){location.href="/settings?google=connected"},1500)</script>
    </body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/public/google/oauth-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          return htmlResponse(
            "Connection cancelled",
            `<h1>Connection cancelled</h1><p>${error}</p>`,
            400,
          );
        }
        if (!code || !state) {
          return htmlResponse(
            "Missing parameters",
            `<h1>Missing code or state</h1>`,
            400,
          );
        }
        const userId = verifyState(state);
        if (!userId) {
          return htmlResponse(
            "Invalid state",
            `<h1>Invalid or expired state</h1><p>Please try connecting again.</p>`,
            400,
          );
        }

        try {
          const redirectUri = getRedirectUri(request);
          const tokens = await exchangeCodeForTokens(code, redirectUri);
          const email = await getUserInfoEmail(tokens.access_token);
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

          await supabaseAdmin.from("google_calendar_connections").upsert(
            {
              user_id: userId,
              google_email: email,
              google_calendar_id: "primary",
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              token_expires_at: expiresAt.toISOString(),
              scope: tokens.scope,
              last_sync_error: null,
              sync_token: null,
            },
            { onConflict: "user_id" },
          );

          // Kick off an initial sync (best-effort)
          syncUserCalendar(userId).catch((e) =>
            console.warn("initial google sync failed", e),
          );

          return htmlResponse(
            "Connected!",
            `<h1>Google Calendar connected</h1><p>${email ?? ""}</p><p>Returning to Settings…</p>`,
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return htmlResponse(
            "Connection failed",
            `<h1>Connection failed</h1><p>${msg}</p>`,
            500,
          );
        }
      },
    },
  },
});