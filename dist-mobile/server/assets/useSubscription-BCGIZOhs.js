import { useState, useCallback, useEffect } from "react";
import { s as supabase } from "./client-BiJkZOJ7.js";
const DEFAULT_STATE = {
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
  refresh: async () => {
  }
};
function computeDerived(tier, status, trialEndsAt, subscriptionEndDate) {
  const now = Date.now();
  const trialActive = tier === "trial" && !!trialEndsAt && trialEndsAt.getTime() > now;
  const trialDaysRemaining = trialActive && trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now) / 864e5)) : 0;
  const proActive = tier === "pro" && (status === "active" || status === "trialling") || tier === "lifetime";
  const basicActive = tier === "basic";
  const hasProAccess = trialActive || proActive;
  const hasFullAccess = hasProAccess || basicActive;
  const isLocked = !hasFullAccess;
  return { isTrialing: trialActive, trialDaysRemaining, hasFullAccess, hasProAccess, isLocked };
}
function useSubscription() {
  const [state, setState] = useState(DEFAULT_STATE);
  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setState({ ...DEFAULT_STATE, loading: false, signedIn: false });
      return;
    }
    const { data: row } = await supabase.from("profiles").select(
      "subscription_tier, subscription_status, trial_starts_at, trial_ends_at, subscription_end_date, stripe_customer_id, stripe_subscription_id"
    ).eq("id", user.id).maybeSingle();
    const tier = row?.subscription_tier ?? "trial";
    const status = row?.subscription_status ?? null;
    const trialStartsAt = row?.trial_starts_at ? new Date(row.trial_starts_at) : null;
    const trialEndsAt = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
    const subscriptionEndDate = row?.subscription_end_date ? new Date(row.subscription_end_date) : null;
    const derived = computeDerived(tier, status, trialEndsAt);
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
      refresh: load
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
    let channel = null;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || cancelled) return;
      channel = supabase.channel(`profile-subscription-${user.id}`).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => {
          void load();
        }
      ).subscribe();
    })();
    const tick = setInterval(() => {
      setState((prev) => {
        if (!prev.signedIn) return prev;
        const derived = computeDerived(prev.tier, prev.status, prev.trialEndsAt, prev.subscriptionEndDate);
        if (derived.isTrialing === prev.isTrialing && derived.trialDaysRemaining === prev.trialDaysRemaining && derived.hasFullAccess === prev.hasFullAccess && derived.hasProAccess === prev.hasProAccess && derived.isLocked === prev.isLocked) {
          return prev;
        }
        return { ...prev, ...derived };
      });
    }, 6e4);
    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
      clearInterval(tick);
    };
  }, [load]);
  return state;
}
export {
  useSubscription as u
};
