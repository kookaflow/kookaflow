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

/* -------------------------------------------------------------------------
 * Stage 4 — native offerings + purchase flow.
 * Native-only (VITE_IS_MOBILE_BUILD), dynamic import, never throws.
 * ---------------------------------------------------------------------- */

/** App-shaped view of a RevenueCat package for the paywall UI. */
export interface RevenueCatPlan {
  /** RevenueCat package identifier, e.g. "basic_monthly" | "pro_yearly". */
  identifier: string;
  /** Store product id. */
  productId: string;
  /** Store-provided localized price string, e.g. "$4.99". */
  priceString: string;
  /** Store product title (fallback label). */
  title: string;
  /** Human cadence label derived from the package type. */
  periodLabel: string;
  /** Opaque SDK package, passed straight back to purchasePackage. */
  raw: unknown;
}

function periodLabelFor(pkg: { packageType?: string }): string {
  switch (pkg.packageType) {
    case "ANNUAL":
      return "per year";
    case "MONTHLY":
      return "per month";
    case "WEEKLY":
      return "per week";
    case "SIX_MONTH":
      return "per 6 months";
    case "THREE_MONTH":
      return "per 3 months";
    case "TWO_MONTH":
      return "per 2 months";
    case "LIFETIME":
      return "one-time";
    default:
      return "";
  }
}

/**
 * Packages of the current RevenueCat offering, ordered for display.
 * Returns [] on web or on any failure — the paywall then shows its
 * "purchases unavailable" state (never a Stripe fallback on native).
 */
export async function getRevenueCatPlans(): Promise<RevenueCatPlan[]> {
  if (!enabled()) return [];
  try {
    if (!(await configureRevenueCat())) return [];
    const { Purchases } = await loadSdk();
    const offerings = await Purchases.getOfferings();
    const packages = offerings?.current?.availablePackages ?? [];
    const plans: RevenueCatPlan[] = packages.map((pkg) => ({
      identifier: pkg.identifier,
      productId: pkg.product?.identifier ?? "",
      priceString: pkg.product?.priceString ?? "",
      title: pkg.product?.title ?? pkg.identifier,
      periodLabel: periodLabelFor(pkg as { packageType?: string }),
      raw: pkg,
    }));

    const order = ["pro_yearly", "lifetime", "pro_monthly", "basic_monthly"];
    return plans.sort((a, b) => {
      const ai = order.indexOf(a.identifier);
      const bi = order.indexOf(b.identifier);
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
    });
  } catch (err) {
    console.warn("[revenuecat] getOfferings failed", err);
    return [];
  }
}

export type RevenueCatPurchaseResult =
  | { status: "purchased"; entitlements: RevenueCatEntitlements }
  | { status: "cancelled" }
  | { status: "error"; message: string };

function isUserCancelled(err: unknown): boolean {
  const e = err as { code?: unknown; userCancelled?: unknown; message?: unknown } | null;
  if (!e) return false;
  if (e.userCancelled === true) return true;
  if (e.code === "1" || e.code === 1) return true; // PURCHASE_CANCELLED_ERROR
  const code = typeof e.code === "string" ? e.code : "";
  if (code.toUpperCase().includes("CANCEL")) return true;
  return typeof e.message === "string" && /cancel/i.test(e.message);
}

/** Run the native purchase flow for a package returned by getRevenueCatPlans. */
export async function purchaseRevenueCatPlan(
  plan: RevenueCatPlan,
): Promise<RevenueCatPurchaseResult> {
  if (!enabled()) return { status: "error", message: "Purchases are unavailable." };
  try {
    if (!(await configureRevenueCat())) {
      return { status: "error", message: "Purchases are unavailable." };
    }
    const { Purchases } = await loadSdk();
    const res = await Purchases.purchasePackage({
      aPackage: plan.raw as Parameters<typeof Purchases.purchasePackage>[0]["aPackage"],
    });
    return { status: "purchased", entitlements: mapEntitlements(res.customerInfo) };
  } catch (err) {
    if (isUserCancelled(err)) return { status: "cancelled" };
    console.warn("[revenuecat] purchasePackage failed", err);
    const message =
      (err as { message?: string } | null)?.message ??
      "Purchase could not be completed. Please try again.";
    return { status: "error", message };
  }
}

/** Restore previous purchases (Apple requires a visible restore action). */
export async function restoreRevenueCatPurchases(): Promise<
  { ok: true; entitlements: RevenueCatEntitlements } | { ok: false; message: string }
> {
  if (!enabled()) return { ok: false, message: "Purchases are unavailable." };
  try {
    if (!(await configureRevenueCat())) {
      return { ok: false, message: "Purchases are unavailable." };
    }
    const { Purchases } = await loadSdk();
    const { customerInfo } = await Purchases.restorePurchases();
    return { ok: true, entitlements: mapEntitlements(customerInfo) };
  } catch (err) {
    console.warn("[revenuecat] restorePurchases failed", err);
    return {
      ok: false,
      message:
        (err as { message?: string } | null)?.message ??
        "Could not restore purchases. Please try again.",
    };
  }
}
