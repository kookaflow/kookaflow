import Stripe from "stripe";

/**
 * Stripe client configured for the Cloudflare Workers / edge runtime.
 * Uses the fetch-based HTTP client and async crypto for webhook verification.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export type PlanKey = "basic" | "pro_monthly" | "pro_yearly" | "lifetime";

export interface PlanConfig {
  priceId: string;
  mode: "payment" | "subscription";
  /** subscription_tier value to write on success */
  tier: "basic" | "pro" | "lifetime";
}

export function getPlanConfig(plan: PlanKey): PlanConfig {
  switch (plan) {
    case "basic":
      return { priceId: requireEnv("STRIPE_BASIC_PRICE_ID"), mode: "subscription", tier: "basic" };
    case "pro_monthly":
      return { priceId: requireEnv("STRIPE_PRO_MONTHLY_PRICE_ID"), mode: "subscription", tier: "pro" };
    case "pro_yearly":
      return { priceId: requireEnv("STRIPE_PRO_YEARLY_PRICE_ID"), mode: "subscription", tier: "pro" };
    case "lifetime":
      return { priceId: requireEnv("STRIPE_LIFETIME_PRICE_ID"), mode: "payment", tier: "lifetime" };
  }
}

/** Resolve which plan a Stripe price_id maps to (used in webhook). */
export function planForPriceId(priceId: string): PlanConfig | null {
  const map: Array<[string | undefined, PlanKey]> = [
    [process.env.STRIPE_BASIC_PRICE_ID, "basic"],
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, "pro_monthly"],
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID, "pro_yearly"],
    [process.env.STRIPE_LIFETIME_PRICE_ID, "lifetime"],
  ];
  for (const [id, key] of map) {
    if (id && id === priceId) return getPlanConfig(key);
  }
  return null;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}