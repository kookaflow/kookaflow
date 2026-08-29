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

/** Active RevenueCat entitlements, mapped to the app's tier names. */
export interface RevenueCatEntitlements {
  basic: boolean;
  pro: boolean;
}

export const NO_ENTITLEMENTS: RevenueCatEntitlements = { basic: false, pro: false };

function mapEntitlements(customerInfo: {
  entitlements?: { active?: Record<string, unknown> };
}): RevenueCatEntitlements {
  const active = customerInfo?.entitlements?.active ?? {};
  return { basic: !!active["basic"], pro: !!active["pro"] };
}

/**
 * Read the current entitlements. Returns NO_ENTITLEMENTS on web or on any
 * failure — RevenueCat must never remove access, only add it.
 */
export async function getRevenueCatEntitlements(): Promise<RevenueCatEntitlements> {
  if (!enabled()) return NO_ENTITLEMENTS;
  try {
    if (!(await configureRevenueCat())) return NO_ENTITLEMENTS;
    const { Purchases } = await loadSdk();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return mapEntitlements(customerInfo);
  } catch (err) {
    console.warn("[revenuecat] getCustomerInfo failed", err);
    return NO_ENTITLEMENTS;
  }
}

/**
 * Listen for CustomerInfo changes (e.g. right after a purchase) so gates react
 * without an app restart. Returns an unsubscribe function; no-op on web.
 */
export function onRevenueCatEntitlementsChange(
  callback: (entitlements: RevenueCatEntitlements) => void,
): () => void {
  if (!enabled()) return () => {};

  let detached = false;
  let listenerId: string | null = null;

  void (async () => {
    try {
      if (!(await configureRevenueCat())) return;
      const { Purchases } = await loadSdk();
      const id = await Purchases.addCustomerInfoUpdateListener((info) => {
        if (detached) return;
        try {
          callback(mapEntitlements(info));
        } catch {
          /* a listener error must never break the SDK callback */
        }
      });
      if (detached) {
        void Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: id });
        return;
      }
      listenerId = id;
    } catch (err) {
      console.warn("[revenuecat] listener setup failed", err);
    }
  })();

  return () => {
    detached = true;
    if (!listenerId) return;
    const id = listenerId;
    listenerId = null;
    void (async () => {
      try {
        const { Purchases } = await loadSdk();
        await Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: id });
      } catch {
        /* teardown failures are harmless — `detached` already gates the callback */
      }
    })();
  };
}
