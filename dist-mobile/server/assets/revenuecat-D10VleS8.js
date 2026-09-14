const REVENUECAT_IOS_API_KEY = "appl_OjTSyFGFbiuQIDXhHRjHdajszLN";
function enabled() {
  return typeof window !== "undefined";
}
let configured = false;
let configuring = null;
async function loadSdk() {
  return await import("@revenuecat/purchases-capacitor");
}
async function configureRevenueCat() {
  if (!enabled()) return false;
  if (configured) return true;
  if (configuring) return configuring;
  configuring = (async () => {
    try {
      const { Purchases, LOG_LEVEL } = await loadSdk();
      await Purchases.setLogLevel({
        level: false ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR
      });
      await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      configured = true;
      return true;
    } catch (err) {
      console.warn("[revenuecat] configure failed", err);
      return false;
    } finally {
      configuring = null;
    }
  })();
  return configuring;
}
let identifying = null;
let identifiedUserId = null;
async function identifyRevenueCatUser(userId) {
  if (!enabled() || !userId) return;
  if (identifiedUserId === userId) return;
  identifying = (async () => {
    try {
      if (!await configureRevenueCat()) return;
      const { Purchases } = await loadSdk();
      await Purchases.logIn({ appUserID: userId });
      identifiedUserId = userId;
    } catch (err) {
      console.warn("[revenuecat] logIn failed", err);
    }
  })();
  await identifying;
}
async function awaitRevenueCatIdentity() {
  if (!enabled()) return;
  try {
    if (identifying) await identifying;
  } catch {
  }
}
async function logOutRevenueCatUser() {
  if (!enabled() || !configured) return;
  identifiedUserId = null;
  identifying = null;
  try {
    const { Purchases } = await loadSdk();
    await Purchases.logOut();
  } catch (err) {
    console.warn("[revenuecat] logOut failed", err);
  }
}
const NO_ENTITLEMENTS = { basic: false, pro: false };
function mapEntitlements(customerInfo) {
  const active = customerInfo?.entitlements?.active ?? {};
  return { basic: !!active["basic"], pro: !!active["pro"] };
}
async function getRevenueCatEntitlements() {
  if (!enabled()) return NO_ENTITLEMENTS;
  try {
    if (!await configureRevenueCat()) return NO_ENTITLEMENTS;
    const { Purchases } = await loadSdk();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return mapEntitlements(customerInfo);
  } catch (err) {
    console.warn("[revenuecat] getCustomerInfo failed", err);
    return NO_ENTITLEMENTS;
  }
}
function onRevenueCatEntitlementsChange(callback) {
  if (!enabled()) return () => {
  };
  let detached = false;
  let listenerId = null;
  void (async () => {
    try {
      if (!await configureRevenueCat()) return;
      const { Purchases } = await loadSdk();
      const id = await Purchases.addCustomerInfoUpdateListener((info) => {
        if (detached) return;
        try {
          callback(mapEntitlements(info));
        } catch {
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
      }
    })();
  };
}
function periodLabelFor(pkg) {
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
async function getRevenueCatPlans() {
  if (!enabled()) return [];
  try {
    if (!await configureRevenueCat()) return [];
    const { Purchases } = await loadSdk();
    const offerings = await Purchases.getOfferings();
    const packages = offerings?.current?.availablePackages ?? [];
    const plans = packages.map((pkg) => ({
      identifier: pkg.identifier,
      productId: pkg.product?.identifier ?? "",
      priceString: pkg.product?.priceString ?? "",
      title: pkg.product?.title ?? pkg.identifier,
      periodLabel: periodLabelFor(pkg),
      raw: pkg
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
function isUserCancelled(err) {
  const e = err;
  if (!e) return false;
  if (e.userCancelled === true) return true;
  if (e.code === "1" || e.code === 1) return true;
  const code = typeof e.code === "string" ? e.code : "";
  if (code.toUpperCase().includes("CANCEL")) return true;
  return typeof e.message === "string" && /cancel/i.test(e.message);
}
async function purchaseRevenueCatPlan(plan) {
  if (!enabled()) return { status: "error", message: "Purchases are unavailable." };
  try {
    if (!await configureRevenueCat()) {
      return { status: "error", message: "Purchases are unavailable." };
    }
    await awaitRevenueCatIdentity();
    const { Purchases } = await loadSdk();
    const res = await Purchases.purchasePackage({
      aPackage: plan.raw
    });
    return { status: "purchased", entitlements: mapEntitlements(res.customerInfo) };
  } catch (err) {
    if (isUserCancelled(err)) return { status: "cancelled" };
    console.warn("[revenuecat] purchasePackage failed", err);
    const message = err?.message ?? "Purchase could not be completed. Please try again.";
    return { status: "error", message };
  }
}
const NATIVE_PACKAGE_MAP = {
  basic: {
    packageIdentifier: "basic_monthly",
    productId: "com.kookaflow.app.basic.monthly",
    entitlement: "basic"
  },
  pro_monthly: {
    packageIdentifier: "pro_monthly",
    productId: "com.kookaflow.app.pro.monthly",
    entitlement: "pro"
  },
  pro_yearly: {
    packageIdentifier: "pro_yearly",
    productId: "com.kookaflow.app.pro.yearly",
    entitlement: "pro"
  },
  lifetime: {
    packageIdentifier: "lifetime",
    productId: "com.kookaflow.app.lifetime",
    entitlement: "pro"
  }
};
async function findRevenueCatPlan(tierKey) {
  if (!enabled()) return null;
  const mapping = NATIVE_PACKAGE_MAP[tierKey];
  if (!mapping) return null;
  const plans = await getRevenueCatPlans();
  if (plans.length === 0) return null;
  const byIdentifier = plans.find((p) => p.identifier === mapping.packageIdentifier);
  if (byIdentifier) return byIdentifier;
  const byProduct = plans.find((p) => p.productId === mapping.productId);
  return byProduct ?? null;
}
async function refreshRevenueCatEntitlements() {
  if (!enabled()) return NO_ENTITLEMENTS;
  try {
    if (!await configureRevenueCat()) return NO_ENTITLEMENTS;
    const { Purchases } = await loadSdk();
    if (typeof Purchases.invalidateCustomerInfoCache === "function") {
      await Purchases.invalidateCustomerInfoCache();
    }
  } catch (err) {
    console.warn("[revenuecat] invalidateCustomerInfoCache failed", err);
  }
  return getRevenueCatEntitlements();
}
async function restoreRevenueCatPurchases() {
  if (!enabled()) return { ok: false, message: "Purchases are unavailable." };
  try {
    if (!await configureRevenueCat()) {
      return { ok: false, message: "Purchases are unavailable." };
    }
    const { Purchases } = await loadSdk();
    const { customerInfo } = await Purchases.restorePurchases();
    return { ok: true, entitlements: mapEntitlements(customerInfo) };
  } catch (err) {
    console.warn("[revenuecat] restorePurchases failed", err);
    return {
      ok: false,
      message: err?.message ?? "Could not restore purchases. Please try again."
    };
  }
}
const APPLE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";
const ITMS_SUBSCRIPTIONS_URL = "itms-apps://apps.apple.com/account/subscriptions";
function cadenceFor(productId) {
  const map = NATIVE_PACKAGE_MAP;
  if (productId === map.lifetime.productId) return "lifetime";
  if (productId === map.pro_yearly.productId) return "yearly";
  if (productId === map.pro_monthly.productId || productId === map.basic.productId) {
    return "monthly";
  }
  if (/year|annual/i.test(productId)) return "yearly";
  if (/month/i.test(productId)) return "monthly";
  if (/lifetime/i.test(productId)) return "lifetime";
  return "";
}
async function getRevenueCatSubscriptionInfo() {
  if (!enabled()) return null;
  try {
    if (!await configureRevenueCat()) return null;
    const { Purchases } = await loadSdk();
    const { customerInfo } = await Purchases.getCustomerInfo();
    const active = customerInfo?.entitlements?.active ?? {};
    const key = active["pro"] ? "pro" : active["basic"] ? "basic" : null;
    if (!key) return null;
    const ent = active[key];
    const productId = ent.productIdentifier ?? "";
    const periodLabel = cadenceFor(productId);
    const expirationDate = ent.expirationDateMillis ? new Date(ent.expirationDateMillis) : null;
    return {
      entitlement: key,
      store: ent.store ?? "UNKNOWN_STORE",
      productId,
      periodLabel,
      expirationDate,
      willRenew: ent.willRenew === true,
      isLifetime: periodLabel === "lifetime" || expirationDate === null,
      managementURL: customerInfo?.managementURL ?? null
    };
  } catch (err) {
    console.warn("[revenuecat] subscription info failed", err);
    return null;
  }
}
async function openNativeSubscriptionManagement(managementURL) {
  if (enabled()) {
    try {
      const w = window.open(ITMS_SUBSCRIPTIONS_URL, "_system");
      if (w) return true;
      window.location.href = ITMS_SUBSCRIPTIONS_URL;
      return true;
    } catch (err) {
      console.warn("[revenuecat] itms-apps open failed, falling back", err);
    }
  }
  const url = managementURL || APPLE_SUBSCRIPTIONS_URL;
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url });
    return true;
  } catch (err) {
    console.warn("[revenuecat] Browser.open failed, falling back", err);
    try {
      window.open(url, "_blank");
      return true;
    } catch {
      return false;
    }
  }
}
export {
  NATIVE_PACKAGE_MAP as N,
  refreshRevenueCatEntitlements as a,
  NO_ENTITLEMENTS as b,
  getRevenueCatEntitlements as c,
  getRevenueCatSubscriptionInfo as d,
  configureRevenueCat as e,
  findRevenueCatPlan as f,
  getRevenueCatPlans as g,
  openNativeSubscriptionManagement as h,
  identifyRevenueCatUser as i,
  logOutRevenueCatUser as l,
  onRevenueCatEntitlementsChange as o,
  purchaseRevenueCatPlan as p,
  restoreRevenueCatPurchases as r
};
