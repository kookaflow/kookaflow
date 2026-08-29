/**
 * Server-side RevenueCat webhook helpers: event typing, entitlement/product ->
 * tier mapping, and the reconcile rules that keep writes idempotent and
 * non-destructive relative to Stripe.
 *
 * Never imported by client code.
 */

export type Tier = "trial" | "basic" | "pro" | "lifetime" | "expired";
export type Status = "active" | "trialling" | "past_due" | "canceled" | "expired";

export interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  entitlement_id?: string | null;
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
  period_type?: string;
  store?: string;
}

export interface RevenueCatWebhookBody {
  event?: RevenueCatEvent;
  api_version?: string;
}

export interface ProfileSubscription {
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
  stripe_subscription_id: string | null;
}

export interface SubscriptionUpdate {
  subscription_tier?: Tier;
  subscription_status?: Status;
  subscription_end_date?: string | null;
}

const TIER_RANK: Record<string, number> = {
  expired: 0,
  trial: 1,
  basic: 2,
  pro: 3,
  lifetime: 4,
};

export function tierRank(tier: string | null | undefined): number {
  return TIER_RANK[tier ?? ""] ?? 0;
}

/** Constant-time string comparison (no Buffer/timingSafeEqual dependency). */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  // Compare a fixed number of bytes so length alone doesn't short-circuit.
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveUserId(event: RevenueCatEvent): string | null {
  for (const candidate of [event.app_user_id, event.original_app_user_id]) {
    if (candidate && UUID_RE.test(candidate)) return candidate;
  }
  return null;
}

function isLifetimeProduct(productId: string | null | undefined): boolean {
  return !!productId && /lifetime|forever|onetime|one_time/i.test(productId);
}

/** Tier implied by the event's entitlements/product. `pro` beats `basic`. */
export function tierForEvent(event: RevenueCatEvent): Tier | null {
  if (isLifetimeProduct(event.product_id)) return "lifetime";

  const ids = [
    ...(event.entitlement_ids ?? []),
    ...(event.entitlement_id ? [event.entitlement_id] : []),
  ].map((id) => id.toLowerCase());

  if (ids.includes("pro")) return "pro";
  if (ids.includes("basic")) return "basic";

  // No entitlement on the event (possible on some stores) — fall back to the
  // product id naming used by the app's App Store products.
  if (event.product_id && /pro/i.test(event.product_id)) return "pro";
  if (event.product_id && /basic/i.test(event.product_id)) return "basic";
  return null;
}

export function expiryIso(event: RevenueCatEvent): string | null {
  const ms = event.expiration_at_ms;
  return typeof ms === "number" && ms > 0 ? new Date(ms).toISOString() : null;
}

/** True when Stripe still grants this profile access we must not remove. */
export function hasProtectedStripeAccess(profile: ProfileSubscription): boolean {
  if (profile.subscription_tier === "lifetime") return true;
  if (!profile.stripe_subscription_id) return false;
  return (
    profile.subscription_status === "active" ||
    profile.subscription_status === "trialling"
  );
}

/**
 * Decide what (if anything) to write for a verified event. Returns null when the
 * event is a no-op: unknown type, missing tier, a retry that adds nothing, or a
 * downgrade that Stripe access protects.
 */
export function reconcile(
  event: RevenueCatEvent,
  profile: ProfileSubscription,
): SubscriptionUpdate | null {
  const type = (event.type ?? "").toUpperCase();
  const expiry = expiryIso(event);

  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
    case "SUBSCRIPTION_EXTENDED": {
      const tier = tierForEvent(event);
      if (!tier) return null;
      return applyGrant(tier, "active", expiry, profile);
    }

    case "NON_RENEWING_PURCHASE": {
      const tier = tierForEvent(event) ?? "lifetime";
      if (tier === "lifetime") {
        return applyGrant("lifetime", "active", null, profile);
      }
      return applyGrant(tier, "active", expiry, profile);
    }

    case "CANCELLATION": {
      // Access runs to period end — keep tier/expiry, only flag the status.
      if (hasProtectedStripeAccess(profile)) return null;
      if (profile.subscription_status === "canceled") return null;
      return { subscription_status: "canceled" };
    }

    case "EXPIRATION": {
      if (hasProtectedStripeAccess(profile)) return null;
      if (profile.subscription_tier === "expired") return null;
      return {
        subscription_tier: "expired",
        subscription_status: "expired",
        subscription_end_date: expiry ?? profile.subscription_end_date,
      };
    }

    case "BILLING_ISSUE": {
      if (hasProtectedStripeAccess(profile)) return null;
      if (profile.subscription_status === "past_due") return null;
      return { subscription_status: "past_due" };
    }

    default:
      // TRANSFER, TEST, SUBSCRIBER_ALIAS, and anything unknown: acknowledge only.
      return null;
  }
}

/**
 * Grants are additive and idempotent: write only when the tier improves, the
 * expiry moves later, or the status needs correcting. Lifetime is never
 * replaced by a lesser tier.
 */
function applyGrant(
  tier: Tier,
  status: Status,
  expiry: string | null,
  profile: ProfileSubscription,
): SubscriptionUpdate | null {
  if (profile.subscription_tier === "lifetime" && tier !== "lifetime") return null;

  const update: SubscriptionUpdate = {};
  const currentRank = tierRank(profile.subscription_tier);

  if (tierRank(tier) > currentRank) update.subscription_tier = tier;

  if (profile.subscription_status !== status) update.subscription_status = status;

  if (tier === "lifetime") {
    if (profile.subscription_end_date !== null) update.subscription_end_date = null;
  } else if (expiry) {
    const current = profile.subscription_end_date
      ? Date.parse(profile.subscription_end_date)
      : 0;
    // Out-of-order retries carry an older expiry — ignore those.
    if (Date.parse(expiry) > current) update.subscription_end_date = expiry;
  }

  return Object.keys(update).length > 0 ? update : null;
}
