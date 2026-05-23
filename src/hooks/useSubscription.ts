import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "trial" | "basic" | "pro" | "lifetime" | "expired";
export type SubscriptionStatus = "active" | "trialling" | "past_due" | "canceled" | "expired" | null;

export interface SubscriptionState {
  loading: boolean;
  signedIn: boolean;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialStartsAt: Date | null;
  trialEndsAt: Date | null;
  subscriptionEndDate: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;

  /** Computed: is the 14-day trial still active right now */
  isTrialing: boolean;
  /** Computed: days remaining in trial (0 if expired or not trialing) */
  trialDaysRemaining: number;
  /** Computed: has full access to all features (trial, pro, lifetime, or active basic) */
  hasFullAccess: boolean;
  /** Computed: has pro-level features (trial, pro, lifetime) */
  hasProAccess: boolean;
  /** Computed: should see paywall blocking advanced features */
  isLocked: boolean;

  refresh: () => Promise<void>;
}

const DEFAULT_STATE: SubscriptionState = {
  loading: true,
  signedIn: false,
  tier: "trial",
  status: null,
  trialStartsAt: null,
  trialEndsAt: null,
  subscriptionEndDate: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  isTrialing: false,
  trialDaysRemaining: 0,
  hasFullAccess: false,
  hasProAccess: false,
  isLocked: false,
  refresh: async () => {},
};

function computeDerived(
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  trialEndsAt: Date | null,
  subscriptionEndDate: Date | null,
) {
  const now = Date.now();
  const trialActive =
    tier === "trial" && !!trialEndsAt && trialEndsAt.getTime() > now;
  const trialDaysRemaining = trialActive && trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now) / 86_400_000))
    : 0;

  const proActive =
    (tier === "pro" && (status === "active" || status === "trialling")) ||
    tier === "lifetime";
  const basicActive = tier === "basic";
  const hasProAccess = trialActive || proActive;
  const hasFullAccess = hasProAccess || basicActive;
  const isLocked = !hasFullAccess;

  return { isTrialing: trialActive, trialDaysRemaining, hasFullAccess, hasProAccess, isLocked };
}

/**
 * Single source of truth for subscription state.
 * Every feature gate MUST read from this hook — never query the database directly.
 */
export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setState({ ...DEFAULT_STATE, loading: false, signedIn: false });
      return;
    }

    const { data: row } = await supabase
      .from("profiles")
      .select(
        "subscription_tier, subscription_status, trial_starts_at, trial_ends_at, subscription_end_date, stripe_customer_id, stripe_subscription_id",
      )
      .eq("id", user.id)
      .maybeSingle();

    const tier = (row?.subscription_tier ?? "trial") as SubscriptionTier;
    const status = (row?.subscription_status ?? null) as SubscriptionStatus;
    const trialStartsAt = row?.trial_starts_at ? new Date(row.trial_starts_at) : null;
    const trialEndsAt = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
    const subscriptionEndDate = row?.subscription_end_date
      ? new Date(row.subscription_end_date)
      : null;

    const derived = computeDerived(tier, status, trialEndsAt, subscriptionEndDate);

    setState({
      loading: false,
      signedIn: true,
      tier,
      status,
      trialStartsAt,
      trialEndsAt,
      subscriptionEndDate,
      stripeCustomerId: row?.stripe_customer_id ?? null,
      stripeSubscriptionId: row?.stripe_subscription_id ?? null,
      ...derived,
      refresh: load,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load();

    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        void load();
      }
    });

    // Realtime updates so webhook-driven subscription changes appear immediately.
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || cancelled) return;
      channel = supabase
        .channel(`profile-subscription-${user.id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
          () => { void load(); },
        )
        .subscribe();
    })();

    // Re-evaluate derived flags every minute so trial countdown stays fresh.
    const tick = setInterval(() => {
      setState((prev) => {
        if (!prev.signedIn) return prev;
        const derived = computeDerived(prev.tier, prev.status, prev.trialEndsAt, prev.subscriptionEndDate);
        if (
          derived.isTrialing === prev.isTrialing &&
          derived.trialDaysRemaining === prev.trialDaysRemaining &&
          derived.hasFullAccess === prev.hasFullAccess &&
          derived.hasProAccess === prev.hasProAccess &&
          derived.isLocked === prev.isLocked
        ) {
          return prev;
        }
        return { ...prev, ...derived };
      });
    }, 60_000);

    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
      clearInterval(tick);
    };
  }, [load]);

  return state;
}