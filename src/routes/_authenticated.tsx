import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { EventsProvider } from "@/providers/EventsProvider";
import { ShiftAlertWatcher } from "@/components/notifications/ShiftAlertWatcher";
import { ShiftTemplatesProvider } from "@/providers/ShiftTemplatesProvider";
import { TrialBanner } from "@/components/subscription/TrialBanner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ready">("checking");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!data.user) {
        navigate({ to: "/login" });
      } else {
        // Check onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarded_at")
          .eq("id", data.user.id)
          .maybeSingle();
        if (!profile?.onboarded_at && window.location.pathname !== "/onboarding") {
          navigate({ to: "/onboarding" });
          return;
        }
        setStatus("ready");
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/login" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
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
        <ShiftAlertWatcher />
        <TrialBanner />
        <Outlet />
      </ShiftTemplatesProvider>
    </EventsProvider>
  );
}