import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerClient } from "@supabase/ssr";
import {
  GOOGLE_SCOPES,
  getRedirectUri,
  signState,
} from "@/lib/google-calendar.server";

export const Route = createFileRoute("/api/public/google/oauth-start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Validate logged-in user via supabase session cookie
        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c) => {
            const idx = c.indexOf("=");
            if (idx < 0) return [c.trim(), ""];
            return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
          }),
        );
        const authHeader = request.headers.get("authorization");
        const url = new URL(request.url);
        const accessTokenFromQuery = url.searchParams.get("access_token");

        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll: () =>
              Object.entries(cookies).map(([name, value]) => ({ name, value })),
            setAll: () => undefined,
          },
          global: authHeader
            ? { headers: { Authorization: authHeader } }
            : accessTokenFromQuery
              ? { headers: { Authorization: `Bearer ${accessTokenFromQuery}` } }
              : undefined,
        });

        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          return new Response("Unauthorized — please sign in first", {
            status: 401,
          });
        }

        const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
        if (!clientId) {
          return new Response("Google OAuth not configured", { status: 500 });
        }

        const redirectUri = getRedirectUri(request);
        const state = signState(data.user.id);

        const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("redirect_uri", redirectUri);
        authorize.searchParams.set("response_type", "code");
        authorize.searchParams.set("scope", GOOGLE_SCOPES);
        authorize.searchParams.set("access_type", "offline");
        authorize.searchParams.set("prompt", "consent");
        authorize.searchParams.set("include_granted_scopes", "true");
        authorize.searchParams.set("state", state);

        return Response.redirect(authorize.toString(), 302);
      },
    },
  },
});

// keep redirect import referenced for tree-shaking safety
void redirect;