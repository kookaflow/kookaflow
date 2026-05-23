import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { createCustomerPortalSession } from "@/lib/stripe.functions";

function initials(name?: string | null, email?: string | null) {
  const src = (name ?? email ?? "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function AccountSection() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const sub = useSubscription();
  const openPortal = useServerFn(createCustomerPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setName(profile?.full_name ?? null);
    })();
  }, []);

  const tierLabel =
    sub.tier === "lifetime" ? "Lifetime Pro" :
    sub.tier === "pro" ? "Pro" :
    sub.tier === "basic" ? "Basic" :
    sub.tier === "expired" ? "Expired" :
    sub.isTrialing ? "Free trial" : "Trial";

  const tierBadgeClass =
    sub.tier === "pro" || sub.tier === "lifetime"
      ? "bg-primary/15 text-primary"
      : sub.tier === "basic"
        ? "bg-accent/30 text-accent-foreground"
        : sub.tier === "expired"
          ? "bg-destructive/15 text-destructive"
          : "bg-muted text-muted-foreground";

  const subSubtitle =
    sub.tier === "lifetime" ? "Lifetime — thanks for your support" :
    sub.tier === "pro" ? "Pro — all features unlocked" :
    sub.tier === "basic" ? "Basic — upgrade for the dashboard & sync" :
    sub.tier === "expired" ? "Trial ended — upgrade to keep using Pro" :
    sub.isTrialing
      ? `${sub.trialDaysRemaining} day${sub.trialDaysRemaining === 1 ? "" : "s"} left in your free trial`
      : "14-day trial";

  const showManage = sub.tier === "pro" && !!sub.stripeCustomerId;
  const showUpgrade = sub.tier === "trial" || sub.tier === "basic" || sub.tier === "expired";

  async function handlePortal() {
    try {
      setPortalLoading(true);
      const res = await openPortal({});
      if (res?.url) window.location.assign(res.url);
      else toast.error("Could not open billing portal.");
    } catch {
      toast.error("Could not open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Account
      </h2>
      <Card className="p-0 overflow-hidden">
        <Link
          to="/settings"
          className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">
            {initials(name, email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {name ?? "Add your name"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {email ?? "—"}
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <div className="mx-4 h-px bg-border" />
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Subscription</p>
            <p className="truncate text-xs text-muted-foreground">{subSubtitle}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tierBadgeClass}`}>
            {tierLabel}
          </span>
          <div className="flex w-full gap-2 sm:w-auto">
            {showUpgrade && (
              <Button asChild size="sm" variant="default" className="flex-1 sm:flex-none">
                <Link to="/pricing">Upgrade</Link>
              </Button>
            )}
            {showManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePortal}
                disabled={portalLoading}
                className="flex-1 sm:flex-none"
              >
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}