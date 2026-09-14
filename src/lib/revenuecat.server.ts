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
  aliases?: string[] | null;
  transferred_to?: string[] | null;
  transferred_from?: string[] | null;
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

function firstUuid(
  candidates: Array<string | null | undefined>,
): string | null {
  for (const candidate of candidates) {
    if (candidate && UUID_RE.test(candidate)) return candidate;
  }
  return null;
}

/**
 * Identity comes only from a Supabase UUID present in the event's id fields or
 * alias list. Anonymous RevenueCat ids, emails and product ids are never
 * treated as identity.
 */
export function resolveUserId(event: RevenueCatEvent): string | null {
  return firstUuid([
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
  ]);
}

/** Destination Supabase user of a TRANSFER event, when it is one of ours. */
export function resolveTransferTarget(event: RevenueCatEvent): string | null {
  return firstUuid([
    ...(event.transferred_to ?? []),
    ...(event.aliases ?? []),
    event.app_user_id,
  ]);
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
      // TRANSFER (handled separately via subscriber lookup), TEST, and anything
      // unknown: acknowledge only.
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

/* -------------------------------------------------------------------------
 * Authoritative subscriber lookup (used by TRANSFER, whose payload does not
 * reliably carry product / entitlement / expiry fields).
 * ---------------------------------------------------------------------- */

interface RevenueCatEntitlementRecord {
  expires_date?: string | null;
  product_identifier?: string | null;
}

interface RevenueCatSubscriptionRecord {
  expires_date?: string | null;
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
}

export interface RevenueCatSubscriber {
  entitlements?: Record<string, RevenueCatEntitlementRecord> | null;
  subscriptions?: Record<string, RevenueCatSubscriptionRecord> | null;
  non_subscriptions?: Record<string, unknown[]> | null;
}

/**
 * Fetch the current RevenueCat state for an already-resolved Supabase user id.
 * Server-only: the secret key must never reach client code. Returns null on any
 * missing secret, non-200 response, or network error — a failed lookup never
 * changes access.
 */
export async function fetchRevenueCatSubscriber(
  userId: string,
): Promise<RevenueCatSubscriber | null> {
  const key = process.env.REVENUECAT_SECRET_API_KEY;
  if (!key) {
    console.warn("[revenuecat] REVENUECAT_SECRET_API_KEY is not configured");
    return null;
  }
  if (!UUID_RE.test(userId)) return null;

  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } },
    );
    if (!res.ok) {
      console.warn("[revenuecat] subscriber lookup failed", res.status);
      return null;
    }
    const body = (await res.json()) as { subscriber?: RevenueCatSubscriber };
    return body.subscriber ?? null;
  } catch (err) {
    console.warn("[revenuecat] subscriber lookup error", err);
    return null;
  }
}

function isActiveEntitlement(
  entitlement: RevenueCatEntitlementRecord | undefined,
): boolean {
  if (!entitlement) return false;
  // A null expiry means a non-expiring (lifetime) grant.
  if (!entitlement.expires_date) return true;
  return Date.parse(entitlement.expires_date) > Date.now();
}

/**
 * Derive tier / status / end date from the authoritative subscriber record and
 * pass it through applyGrant, so never-downgrade, lifetime protection, Stripe
 * protection and idempotency all still apply. Returns null when the subscriber
 * has no active paid entitlement — a transfer never removes access.
 */
export function updateFromSubscriber(
  subscriber: RevenueCatSubscriber,
  profile: ProfileSubscription,
): SubscriptionUpdate | null {
  const entitlements = subscriber.entitlements ?? {};

  const lifetime = entitlements["lifetime"];
  const pro = entitlements["pro"];
  const basic = entitlements["basic"];

  let tier: Tier | null = null;
  let active: RevenueCatEntitlementRecord | undefined;

  if (isActiveEntitlement(lifetime)) {
    tier = "lifetime";
    active = lifetime;
  } else if (isActiveEntitlement(pro)) {
    tier = "pro";
    active = pro;
  } else if (isActiveEntitlement(basic)) {
    tier = "basic";
    active = basic;
  }

  if (!tier || !active) return null;

  const productId = active.product_identifier ?? null;

  // A non-expiring entitlement, or a lifetime-shaped product, is lifetime.
  if (tier !== "lifetime" && (!active.expires_date || isLifetimeProduct(productId))) {
    return applyGrant("lifetime", "active", null, profile);
  }
  if (tier === "lifetime") {
    return applyGrant("lifetime", "active", null, profile);
  }

  const subscription = productId
    ? (subscriber.subscriptions ?? {})[productId]
    : undefined;

  let status: Status = "active";
  if (subscription?.billing_issues_detected_at) status = "past_due";
  else if (subscription?.unsubscribe_detected_at) status = "canceled";

  const expiry = subscription?.expires_date ?? active.expires_date ?? null;
  const expiryIsoValue = expiry ? new Date(expiry).toISOString() : null;

  return applyGrant(tier, status, expiryIsoValue, profile);
}
