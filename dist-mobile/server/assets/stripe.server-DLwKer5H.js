import Stripe from "stripe";
function getStripe() {
  const key = process.env.STRIPE_LIVE_API_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_LIVE_API_KEY is not configured");
  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    httpClient: Stripe.createFetchHttpClient()
  });
}
function getPlanConfig(plan) {
  switch (plan) {
    case "basic":
      return { priceId: requireEnv("STRIPE_BASIC_MONTHLY_PRICE_ID"), mode: "subscription", tier: "basic" };
    case "pro_monthly":
      return { priceId: requireEnv("STRIPE_PRO_MONTHLY_PRICE_ID"), mode: "subscription", tier: "pro" };
    case "pro_yearly":
      return { priceId: requireEnv("STRIPE_PRO_YEARLY_PRICE_ID"), mode: "subscription", tier: "pro" };
    case "lifetime":
      return { priceId: requireEnv("STRIPE_PRO_LIFETIME_PRICE_ID"), mode: "payment", tier: "lifetime" };
  }
}
function planForPriceId(priceId) {
  const map = [
    [process.env.STRIPE_BASIC_MONTHLY_PRICE_ID, "basic"],
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, "pro_monthly"],
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID, "pro_yearly"],
    [process.env.STRIPE_PRO_LIFETIME_PRICE_ID, "lifetime"]
  ];
  for (const [id, key] of map) {
    if (id && id === priceId) return getPlanConfig(key);
  }
  return null;
}
function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}
export {
  getStripe as a,
  getPlanConfig as g,
  planForPriceId as p
};
