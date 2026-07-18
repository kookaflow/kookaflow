import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

// Beta OAuth namespace on the Supabase client — declare the shape locally.
type AuthorizationClient = { name?: string | null; client_uri?: string | null };
type AuthorizationDetails = {
  client?: AuthorizationClient | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
  scopes?: string[] | null;
};
type OAuthResult = { data: AuthorizationDetails | null; error: { message: string } | null };
type SupabaseOAuth = {
  auth: {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
      approveAuthorization: (id: string) => Promise<OAuthResult>;
      denyAuthorization: (id: string) => Promise<OAuthResult>;
    };
  };
};

function oauthClient() {
  return supabase as unknown as SupabaseOAuth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const params = new URLSearchParams(location.search);
    const authorizationId = params.get("authorization_id")!;
    const { data, error } = await oauthClient().auth.oauth.getAuthorizationDetails(
      authorizationId,
    );
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <AuthShell tagline="Connect an app" subtitle="Could not load this request">
      <p className="text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </AuthShell>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const call = approve
      ? oauthClient().auth.oauth.approveAuthorization(authorization_id)
      : oauthClient().auth.oauth.denyAuthorization(authorization_id);
    const { data, error } = await call;
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <AuthShell
      tagline="Connect an app"
      subtitle={`Allow ${clientName} to use Kookaflow as you?`}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{clientName}</strong> will be able to call
          Kookaflow's enabled tools (read your calendar and create events) while you are
          signed in. This does not bypass Kookaflow's permissions.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Working…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent/40 disabled:opacity-50"
          >
            Cancel connection
          </button>
        </div>
      </div>
    </AuthShell>
  );
}