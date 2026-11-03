const TIER_RANK = {
  expired: 0,
  trial: 1,
  basic: 2,
  pro: 3,
  lifetime: 4
};
function tierRank(tier) {
  return TIER_RANK[tier ?? ""] ?? 0;
}
function timingSafeEqualStrings(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function firstUuid(candidates) {
  for (const candidate of candidates) {
    if (candidate && UUID_RE.test(candidate)) return candidate;
  }
  return null;
}
function resolveUserId(event) {
  return firstUuid([
    event.app_user_id,
    event.original_app_user_id,
    ...event.aliases ?? []
  ]);
}
function resolveTransferTarget(event) {
  return firstUuid([
    ...event.transferred_to ?? [],
    ...event.aliases ?? [],
    event.app_user_id
  ]);
}
function isLifetimeProduct(productId) {
  return !!productId && /lifetime|forever|onetime|one_time/i.test(productId);
}
function tierForEvent(event) {
  if (isLifetimeProduct(event.product_id)) return "lifetime";
  const ids = [
    ...event.entitlement_ids ?? [],
    ...event.entitlement_id ? [event.entitlement_id] : []
  ].map((id) => id.toLowerCase());
  if (ids.includes("pro")) return "pro";
  if (ids.includes("basic")) return "basic";
  if (event.product_id && /pro/i.test(event.product_id)) return "pro";
  if (event.product_id && /basic/i.test(event.product_id)) return "basic";
  return null;
}
function expiryIso(event) {
  const ms = event.expiration_at_ms;
  return typeof ms === "number" && ms > 0 ? new Date(ms).toISOString() : null;
}
function hasProtectedStripeAccess(profile) {
  if (profile.subscription_tier === "lifetime") return true;
  if (!profile.stripe_subscription_id) return false;
  return profile.subscription_status === "active" || profile.subscription_status === "trialling";
}
function reconcile(event, profile) {
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
        subscription_end_date: expiry ?? profile.subscription_end_date
      };
    }
    case "BILLING_ISSUE": {
      if (hasProtectedStripeAccess(profile)) return null;
      if (profile.subscription_status === "past_due") return null;
      return { subscription_status: "past_due" };
    }
    default:
      return null;
  }
}
function applyGrant(tier, status, expiry, profile) {
  if (profile.subscription_tier === "lifetime" && tier !== "lifetime") return null;
  const update = {};
  const currentRank = tierRank(profile.subscription_tier);
  if (tierRank(tier) > currentRank) update.subscription_tier = tier;
  if (profile.subscription_status !== status) update.subscription_status = status;
  if (tier === "lifetime") {
    if (profile.subscription_end_date !== null) update.subscription_end_date = null;
  } else if (expiry) {
    const current = profile.subscription_end_date ? Date.parse(profile.subscription_end_date) : 0;
    if (Date.parse(expiry) > current) update.subscription_end_date = expiry;
  }
  return Object.keys(update).length > 0 ? update : null;
}
async function fetchRevenueCatSubscriber(userId) {
  const key = process.env.REVENUECAT_SECRET_API_KEY;
  if (!key) {
    console.warn("[revenuecat] REVENUECAT_SECRET_API_KEY is not configured");
    return null;
  }
  if (!UUID_RE.test(userId)) return null;
  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } }
    );
    if (!res.ok) {
      console.warn("[revenuecat] subscriber lookup failed", res.status);
      return null;
    }
    const body = await res.json();
    return body.subscriber ?? null;
  } catch (err) {
    console.warn("[revenuecat] subscriber lookup error", err);
    return null;
  }
}
function isActiveEntitlement(entitlement) {
  if (!entitlement) return false;
  if (!entitlement.expires_date) return true;
  return Date.parse(entitlement.expires_date) > Date.now();
}
function updateFromSubscriber(subscriber, profile) {
  const entitlements = subscriber.entitlements ?? {};
  const lifetime = entitlements["lifetime"];
  const pro = entitlements["pro"];
  const basic = entitlements["basic"];
  let tier = null;
  let active;
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
  if (tier !== "lifetime" && (!active.expires_date || isLifetimeProduct(productId))) {
    return applyGrant("lifetime", "active", null, profile);
  }
  if (tier === "lifetime") {
    return applyGrant("lifetime", "active", null, profile);
  }
  const subscription = productId ? (subscriber.subscriptions ?? {})[productId] : void 0;
  let status = "active";
  if (subscription?.billing_issues_detected_at) status = "past_due";
  else if (subscription?.unsubscribe_detected_at) status = "canceled";
  const expiry = subscription?.expires_date ?? active.expires_date ?? null;
  const expiryIsoValue = expiry ? new Date(expiry).toISOString() : null;
  return applyGrant(tier, status, expiryIsoValue, profile);
}
export {
  expiryIso,
  fetchRevenueCatSubscriber,
  hasProtectedStripeAccess,
  reconcile,
  resolveTransferTarget,
  resolveUserId,
  tierForEvent,
  tierRank,
  timingSafeEqualStrings,
  updateFromSubscriber
};
