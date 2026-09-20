import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, ExternalLink, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { createCustomerPortalSession } from "@/lib/stripe.functions";
import {
  IS_NATIVE_IAP,
  openNativeSubscriptionManagement,
  refreshRevenueCatEntitlements,
  restoreRevenueCatPurchases,
} from "@/lib/revenuecat";

function initials(name?: string | null, email?: string | null) {
  const src = (name ?? email ?? "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function AccountSection() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const sub = useSubscription();
  const openPortal = useServerFn(createCustomerPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

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

  const native = sub.nativeSubscription;
  /** Apple/Mac App Store purchase — the only case we send to Apple. */
  const isAppleSubscriber =
    !!native && (native.store === "APP_STORE" || native.store === "MAC_APP_STORE");
  const isNativeLifetime = !!native?.isLifetime;

  const cadenceLabel =
    native?.periodLabel === "yearly"
      ? "yearly"
      : native?.periodLabel === "monthly"
        ? "monthly"
        : null;

  /**
   * On native iOS, a live Apple/RevenueCat paid entitlement wins over stale
   * database trial fields for display purposes. Access gating in
   * useSubscription is unchanged — this only affects what the Account row
   * shows (badge, subtitle, upgrade visibility).
   */
  const nativeEntKey: "pro" | "basic" | null = sub.nativeEntitlements.pro
    ? "pro"
    : sub.nativeEntitlements.basic
      ? "basic"
      : null;
  const nativePaid = IS_NATIVE_IAP && nativeEntKey !== null;

  const tierLabel =
    nativePaid && isNativeLifetime ? "Lifetime Pro" :
    nativePaid && nativeEntKey === "pro"
      ? (cadenceLabel === "yearly" ? "Pro Yearly" : cadenceLabel === "monthly" ? "Pro Monthly" : "Pro") :
    nativePaid && nativeEntKey === "basic"
      ? (cadenceLabel === "monthly" ? "Basic Monthly" : "Basic") :
    sub.tier === "lifetime" ? "Lifetime Pro" :
    sub.tier === "pro" ? "Pro" :
    sub.tier === "basic" ? "Basic" :
    sub.tier === "expired" ? "Expired" :
    sub.isTrialing ? "Free trial" : "Trial";

  const tierBadgeClass =
    (nativePaid && (nativeEntKey === "pro" || isNativeLifetime)) ||
    (!nativePaid && (sub.tier === "pro" || sub.tier === "lifetime"))
      ? "bg-primary/15 text-primary"
      : (nativePaid && nativeEntKey === "basic") ||
          (!nativePaid && sub.tier === "basic")
        ? "bg-accent/30 text-accent-foreground"
        : (!nativePaid && sub.tier === "expired")
          ? "bg-destructive/15 text-destructive"
          : "bg-muted text-muted-foreground";

  const baseSubtitle =
    sub.tier === "lifetime" ? "Lifetime access — thanks for your support" :
    sub.tier === "pro" ? "Pro — all features unlocked" :
    sub.tier === "basic" ? "Basic — upgrade for the dashboard & sync" :
    sub.tier === "expired" ? "Trial ended — upgrade to keep using Pro" :
    sub.isTrialing
      ? `${sub.trialDaysRemaining} day${sub.trialDaysRemaining === 1 ? "" : "s"} left in your free trial`
      : "14-day trial";

  const subSubtitle =
    nativePaid && isNativeLifetime
      ? "Lifetime access — thanks for your support"
      : nativePaid
        ? "Active"
        : isNativeLifetime && sub.tier !== "basic"
          ? "Lifetime access — thanks for your support"
          : cadenceLabel && (sub.tier === "pro" || sub.tier === "basic")
            ? `${sub.tier === "pro" ? "Pro" : "Basic"} — ${cadenceLabel}`
            : baseSubtitle;

  /** Renewal line, only when the store gave us a reliable date. */
  const renewalLine =
    native && !native.isLifetime && native.expirationDate
      ? native.willRenew
        ? `Renews ${formatDate(native.expirationDate)}`
        : `Access ends ${formatDate(native.expirationDate)}`
      : null;

  const showAppleManage = isAppleSubscriber && !isNativeLifetime;
  const showStripeManage =
    !IS_NATIVE_IAP &&
    (sub.tier === "pro" || sub.tier === "basic") &&
    !!sub.stripeCustomerId;
  // A native paid Pro/Lifetime subscriber has nothing to upgrade to.
  // A native Basic subscriber still sees Upgrade to Pro.
  const showUpgrade = nativePaid
    ? nativeEntKey === "basic" && !isNativeLifetime
    : sub.tier === "trial" || sub.tier === "basic" || sub.tier === "expired";
  const upgradeLabel =
    sub.tier === "basic"
      ? "Upgrade to Pro"
      : sub.tier === "expired"
        ? "Resubscribe"
        : "Upgrade";

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

  async function handleAppleManage() {
    const ok = await openNativeSubscriptionManagement(native?.managementURL);
    if (!ok) toast.error("Could not open Apple's subscription settings.");
  }

  async function handleRestore() {
    try {
      setRestoring(true);
      const res = await restoreRevenueCatPurchases();
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      await refreshRevenueCatEntitlements();
      await sub.refresh();
      if (res.entitlements.pro || res.entitlements.basic) {
        toast.success("Purchases restored.");
      } else {
        toast.info("No previous purchases found for this Apple ID.");
      }
    } finally {
      setRestoring(false);
    }
  }

  return (
    <section className="mb-6 min-w-0 max-w-full">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Account
      </h2>
      <Card className="min-w-0 max-w-full overflow-hidden p-0">
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
            {renewalLine && (
              <p className="truncate text-xs text-muted-foreground">{renewalLine}</p>
            )}
          </div>
          <span className={`max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tierBadgeClass}`}>
            {tierLabel}
          </span>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {showUpgrade && (
              <Button asChild size="sm" variant="default" className="flex-1 sm:flex-none">
                <Link to="/pricing">{upgradeLabel}</Link>
              </Button>
            )}
            {showAppleManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleAppleManage()}
                className="flex-1 gap-1.5 sm:flex-none"
              >
                Manage Subscription
                <ExternalLink className="size-3.5" />
              </Button>
            )}
            {showStripeManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePortal}
                disabled={portalLoading}
                className="flex-1 sm:flex-none"
              >
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Billing portal"}
              </Button>
            )}
          </div>
          {IS_NATIVE_IAP && (
            <div className="w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void handleRestore()}
                disabled={restoring}
                className="gap-1.5 px-0 text-muted-foreground"
              >
                {restoring ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCcw className="size-4" />
                )}
                Restore purchases
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
