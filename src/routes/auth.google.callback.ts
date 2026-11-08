import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  exchangeCodeForTokens,
  getRedirectUri,
  getUserInfoEmail,
  syncUserCalendar,
  verifyStateDetailed,
} from "@/lib/google-calendar.server";
import { hasCalendarReadScope, SCOPE_MISSING_MESSAGE } from "@/lib/googleErrors";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const APP_RETURN = "com.kookaflow.app://google-calendar";

function htmlResponse(
  title: string,
  body: string,
  status = 200,
  native = false,
  nativeStatus?: string,
) {
  const ok = status < 400;
  const target = native
    ? `${APP_RETURN}?status=${nativeStatus ?? (ok ? "connected" : "error")}`
    : ok
      ? "/settings?google=connected"
      : "/settings";
  const label = native ? "Return to Kookaflow" : "Back to Settings";
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}main{max-width:420px}h1{margin:0 0 12px;font-size:22px}p{color:#aaa;margin:0 0 24px}a{display:inline-block;padding:10px 18px;border-radius:8px;background:#fff;color:#000;text-decoration:none;font-weight:600}</style>
    </head><body><main>${body}<p style="margin-top:24px"><a href="${target}">${label}</a></p></main>
    ${ok || native ? `<script>setTimeout(function(){location.href=${JSON.stringify(target)}},${native ? 300 : 1500})</script>` : ""}
    </body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const parsed = state ? verifyStateDetailed(state) : null;
        const native = parsed?.native ?? false;

        if (error) {
          return htmlResponse(
            "Connection cancelled",
            `<h1>Connection cancelled</h1><p>Google Calendar wasn't connected. You can try again any time.</p>`,
            400,
            native,
          );
        }
        if (!code || !state) {
          return htmlResponse(
            "Missing parameters",
            `<h1>Missing code or state</h1>`,
            400,
            native,
          );
        }
        const userId = parsed?.userId ?? null;
        if (!userId) {
          return htmlResponse(
            "Invalid state",
            `<h1>Invalid or expired state</h1><p>Please try connecting again.</p>`,
            400,
            native,
          );
        }

        try {
          const redirectUri = getRedirectUri(request);
          const tokens = await exchangeCodeForTokens(code, redirectUri);
          if (!hasCalendarReadScope(tokens.scope)) {
            // The user unticked the calendar permission: don't save, release the token.
            console.warn(`[google] connect without calendar scope for ${userId}: ${tokens.scope}`);
            await fetch("https://oauth2.googleapis.com/revoke", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ token: tokens.refresh_token || tokens.access_token }),
            }).catch((e) => console.error("[google-revoke] failed", e));
            return htmlResponse(
              "Permission needed",
              `<h1>Permission needed</h1><p>${escapeHtml(SCOPE_MISSING_MESSAGE)}</p>`,
              400,
              native,
              "scope_missing",
            );
          }
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

          syncUserCalendar(userId).catch((e) =>
            console.warn("initial google sync failed", e),
          );

          return htmlResponse(
            "Connected!",
            `<h1>Google Calendar connected</h1><p>${escapeHtml(email ?? "")}</p><p>Returning…</p>`,
            200,
            native,
          );
        } catch (e) {
          console.error("[google] connect callback failed", e);
          return htmlResponse(
            "Connection failed",
            `<h1>Connection didn't finish</h1><p>Something went wrong connecting Google Calendar. Please try again.</p>`,
            500,
            native,
          );
        }
      },
    },
  },
});