import { useState, useRef, useCallback, useEffect } from "react";
import { s as supabase } from "./client-BHPGm-jd.js";
import { b as NO_ENTITLEMENTS, o as onRevenueCatEntitlementsChange, c as getRevenueCatEntitlements } from "./revenuecat-DysiFGY1.js";
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
  nativeEntitlements: NO_ENTITLEMENTS,
  refresh: async () => {
  }
};
function computeDerived(tier, status, trialEndsAt, subscriptionEndDate, native = NO_ENTITLEMENTS) {
  const now = Date.now();
  const trialActive = tier === "trial" && !!trialEndsAt && trialEndsAt.getTime() > now;
  const trialDaysRemaining = trialActive && trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now) / 864e5)) : 0;
  const proActive = tier === "pro" && (status === "active" || status === "trialling") || tier === "lifetime";
  const basicActive = tier === "basic";
  const hasProAccess = trialActive || proActive || native.pro;
  const hasFullAccess = hasProAccess || basicActive || native.basic;
  const isLocked = !hasFullAccess;
  return { isTrialing: trialActive, trialDaysRemaining, hasFullAccess, hasProAccess, isLocked };
}
let sharedChannel = null;
let sharedUserId = null;
async function subscribeToProfileChanges(listener) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return () => {
  };
  if (sharedChannel && sharedUserId !== user.id) {
    const stale = sharedChannel;
    sharedChannel = null;
    sharedUserId = null;
    void supabase.removeChannel(stale.channel);
  }
  if (!sharedChannel) {
    const listeners = /* @__PURE__ */ new Set();
    const topic = `profile-subscription-${user.id}`;
    const existing = supabase.getChannels().find((c) => c.topic === `realtime:${topic}`);
    if (existing) await supabase.removeChannel(existing);
    const channel = supabase.channel(topic).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
      () => {
        listeners.forEach((fn) => {
          try {
            fn();
          } catch {
          }
        });
      }
    ).subscribe();
    sharedChannel = { channel, listeners };
    sharedUserId = user.id;
  }
  const entry = sharedChannel;
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size === 0 && sharedChannel === entry) {
      sharedChannel = null;
      sharedUserId = null;
      void supabase.removeChannel(entry.channel);
    }
  };
}
function useSubscription() {
  const [state, setState] = useState(DEFAULT_STATE);
  const nativeRef = useRef(NO_ENTITLEMENTS);
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
    const native = nativeRef.current;
    const derived = computeDerived(tier, status, trialEndsAt, subscriptionEndDate, native);
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
      nativeEntitlements: native,
      refresh: load
    });
  }, []);
  const applyNative = useCallback((native) => {
    nativeRef.current = native;
    setState((prev) => {
      const derived = computeDerived(
        prev.tier,
        prev.status,
        prev.trialEndsAt,
        prev.subscriptionEndDate,
        native
      );
      if (prev.nativeEntitlements.basic === native.basic && prev.nativeEntitlements.pro === native.pro && derived.hasFullAccess === prev.hasFullAccess && derived.hasProAccess === prev.hasProAccess && derived.isLocked === prev.isLocked) {
        return prev;
      }
      return { ...prev, ...derived, nativeEntitlements: native };
    });
  }, []);
  useEffect(() => {
    let cancelled = false;
    void load();
    const refreshNative = () => {
      void getRevenueCatEntitlements().then((native) => {
        if (cancelled) return;
        applyNative(native);
      });
    };
    refreshNative();
    let detachNative = null;
    {
      detachNative = onRevenueCatEntitlementsChange((native) => {
        if (cancelled) return;
        applyNative(native);
      });
    }
    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        void load();
        if (event === "SIGNED_OUT") {
          nativeRef.current = NO_ENTITLEMENTS;
        } else {
          refreshNative();
        }
      }
    });
    let detach = null;
    let detached = false;
    subscribeToProfileChanges(() => {
      void load();
    }).then((off) => {
      if (detached) {
        off();
        return;
      }
      detach = off;
    }).catch((err) => {
      console.warn("[subscription] realtime setup failed", err);
    });
    const tick = setInterval(() => {
      setState((prev) => {
        if (!prev.signedIn) return prev;
        const derived = computeDerived(
          prev.tier,
          prev.status,
          prev.trialEndsAt,
          prev.subscriptionEndDate,
          nativeRef.current
        );
        if (derived.isTrialing === prev.isTrialing && derived.trialDaysRemaining === prev.trialDaysRemaining && derived.hasFullAccess === prev.hasFullAccess && derived.hasProAccess === prev.hasProAccess && derived.isLocked === prev.isLocked) {
          return prev;
        }
        return { ...prev, ...derived };
      });
    }, 6e4);
    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
      detached = true;
      detach?.();
      detachNative?.();
      clearInterval(tick);
    };
  }, [load, applyNative]);
  return state;
}
export {
  useSubscription as u
};
