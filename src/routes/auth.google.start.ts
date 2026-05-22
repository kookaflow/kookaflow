import { createFileRoute } from "@tanstack/react-router";
import {
  GOOGLE_SCOPES,
  getRedirectUri,
  signState,
} from "@/lib/google-calendar.server";

export const Route = createFileRoute("/auth/google/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const accessToken =
          url.searchParams.get("access_token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          null;
        if (!accessToken) {
          return new Response("Unauthorized — missing access token", {
            status: 401,
          });
        }

        const supabaseUrl = process.env.SUPABASE_URL!;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            apikey: publishableKey,
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!userRes.ok) {
          return new Response("Unauthorized — please sign in first", {
            status: 401,
          });
        }
        const user = (await userRes.json()) as { id?: string };
        if (!user.id) return new Response("Unauthorized", { status: 401 });

        const clientId =
          process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
        if (!clientId) {
          return new Response("Google OAuth not configured", { status: 500 });
        }

        const redirectUri = getRedirectUri(request);
        const state = signState(user.id);

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