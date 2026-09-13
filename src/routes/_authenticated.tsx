import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { EventsProvider } from "@/providers/EventsProvider";
import { ShiftAlertWatcher } from "@/components/notifications/ShiftAlertWatcher";
import { ShiftTemplatesProvider } from "@/providers/ShiftTemplatesProvider";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import { RevenueCatProvider } from "@/providers/RevenueCatProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function isExplicitAuthFailure(error: { message?: string; status?: number } | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  // Only these mean the session is genuinely gone. Network/gateway failures must not sign anyone out.
  return (
    error.status === 401 ||
    error.status === 403 ||
    msg.includes("invalid refresh token") ||
    msg.includes("refresh token not found") ||
    msg.includes("jwt expired") ||
    msg.includes("user not found") ||
    msg.includes("session_not_found") ||
    msg.includes("session from session_id claim in jwt does not exist")
  );
}

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ready">("checking");

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1. Trust the locally stored session first — no network round-trip.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = sessionData.session;

      if (!session) {
        navigate({ to: "/login" });
        return;
      }

      // Admit the user immediately; validation happens in the background below.
      setStatus("ready");

      // 2. Onboarding check — non-fatal. A failed read must never strand the user.
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarded_at")
          .eq("id", session.user.id)
          .maybeSingle();
        if (!mounted) return;
        if (!error && profile && !profile.onboarded_at && window.location.pathname !== "/onboarding") {
          navigate({ to: "/onboarding" });
          return;
        }
      } catch {
        /* offline or server slow — keep the user in the app */
      }

      // 3. Background validation. Redirect only on an explicit auth failure.
      try {
        const { error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (isExplicitAuthFailure(error)) navigate({ to: "/login" });
      } catch {
        /* transport error — session stays valid */
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/login" });
    });

    // 4. Coming back to the foreground after the phone slept: re-arm the token quietly.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void supabase.auth.refreshSession().catch(() => {
        /* offline — autoRefreshToken will retry */
      });
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [navigate]);


  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  return (
    <EventsProvider>
      <ShiftTemplatesProvider>
        <RevenueCatProvider />
        <ShiftAlertWatcher />
        <TrialBanner />
        <Outlet />
      </ShiftTemplatesProvider>
    </EventsProvider>
  );
}