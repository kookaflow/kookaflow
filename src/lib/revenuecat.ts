/**
 * RevenueCat native IAP — Stage 1: SDK configuration + user identity only.
 *
 * Nothing here runs on the web/SSR target: every entry point returns early
 * unless this is the Capacitor build (VITE_IS_MOBILE_BUILD) running in a
 * browser context, and the SDK is loaded with a dynamic import so it never
 * enters the Cloudflare Worker bundle.
 *
 * No purchases, offerings, or entitlement reads yet — subscription state still
 * comes from Stripe → profiles → useSubscription.
 */

/** iOS public (publishable) API key — safe to ship in the client bundle. */
const REVENUECAT_IOS_API_KEY = "appl_OjTSyFGFbiuQIDXhHRjHdajszLN";

export const IS_NATIVE_IAP =
  (import.meta.env.VITE_IS_MOBILE_BUILD as boolean | undefined) === true;

function enabled(): boolean {
  return IS_NATIVE_IAP && typeof window !== "undefined";
}

let configured = false;
let configuring: Promise<boolean> | null = null;

async function loadSdk() {
  return await import("@revenuecat/purchases-capacitor");
}

/**
 * Configure the RevenueCat SDK. Safe to call repeatedly — the real work runs
 * once per app session. Never throws.
 */
export async function configureRevenueCat(): Promise<boolean> {
  if (!enabled()) return false;
  if (configured) return true;
  if (configuring) return configuring;

  configuring = (async () => {
    try {
      const { Purchases, LOG_LEVEL } = await loadSdk();
      await Purchases.setLogLevel({
        level: import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR,
      });
      await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      configured = true;
      return true;
    } catch (err) {
      // A RevenueCat failure must never block rendering.
      console.warn("[revenuecat] configure failed", err);
      return false;
    } finally {
      configuring = null;
    }
  })();

  return configuring;
}

/**
 * Tie the RevenueCat app user to the Supabase user id, so entitlements land on
 * the same account the rest of the app keys off.
 */
export async function identifyRevenueCatUser(userId: string): Promise<void> {
  if (!enabled() || !userId) return;
  try {
    if (!(await configureRevenueCat())) return;
    const { Purchases } = await loadSdk();
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    console.warn("[revenuecat] logIn failed", err);
  }
}

/** Drop back to an anonymous RevenueCat user on sign-out. */
export async function logOutRevenueCatUser(): Promise<void> {
  if (!enabled() || !configured) return;
  try {
    const { Purchases } = await loadSdk();
    await Purchases.logOut();
  } catch (err) {
    console.warn("[revenuecat] logOut failed", err);
  }
}
