import { Capacitor } from "@capacitor/core";
function isNativeApp() {
  return Capacitor.isNativePlatform();
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}
async function shareFileNatively(blob, filename) {
  const [fsMod, shareMod] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share")
  ]);
  const data = await blobToBase64(blob);
  const { uri } = await fsMod.Filesystem.writeFile({
    path: filename,
    data,
    directory: fsMod.Directory.Cache
  });
  try {
    await shareMod.Share.share({ title: filename, files: [uri], dialogTitle: filename });
    return "shared";
  } catch (e) {
    const msg = String(e?.message ?? e).toLowerCase();
    if (msg.includes("cancel")) return "cancelled";
    throw e;
  }
}
const SITE_ORIGIN = "https://kookaflow.com";
const APPLE_APP_ID = "6791698037";
const ANDROID_PACKAGE = "com.kookaflow.app";
const WEB_ONLY_PATHS = ["/privacy", "/terms", "/support", "/eula", "/delete-account", "/pricing-web"];
function isWebOnlyPath(pathname) {
  return WEB_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
async function openExternal(url) {
  if (!isNativeApp()) {
    window.open(url, "_blank", "noopener");
    return;
  }
  if (/^(mailto|tel|sms):/i.test(url)) {
    window.open(url, "_system");
    return;
  }
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url, presentationStyle: "popover" });
  } catch (err) {
    console.error("[openExternal] failed", err);
  }
}
function openSitePage(path) {
  return openExternal(withAppMarker(SITE_ORIGIN + path));
}
function withAppMarker(href) {
  const url = new URL(href, SITE_ORIGIN);
  url.searchParams.set("from", "app");
  return url.toString();
}
function storeReviewUrl() {
  return Capacitor.getPlatform() === "android" ? `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}` : `https://apps.apple.com/app/id${APPLE_APP_ID}?action=write-review`;
}
function openStoreReview() {
  const url = storeReviewUrl();
  if (isNativeApp()) {
    window.open(url, "_system");
  } else {
    window.open(`https://apps.apple.com/app/id${APPLE_APP_ID}`, "_blank", "noopener");
  }
}
function installNativeLinkGuard() {
  if (typeof document === "undefined" || !isNativeApp()) return () => {
  };
  const onClick = (e) => {
    if (e.defaultPrevented) return;
    const a = e.target?.closest?.("a[href]");
    if (!a) return;
    const raw = a.getAttribute("href") ?? "";
    if (!raw || raw.startsWith("#")) return;
    let url;
    try {
      url = new URL(raw, window.location.href);
    } catch {
      return;
    }
    const sameOrigin = url.origin === window.location.origin;
    if (/^(mailto|tel|sms):$/i.test(url.protocol)) {
      e.preventDefault();
      e.stopPropagation();
      void openExternal(url.href);
      return;
    }
    if (sameOrigin && isWebOnlyPath(url.pathname)) {
      e.preventDefault();
      e.stopPropagation();
      void openSitePage(url.pathname + url.search + url.hash);
      return;
    }
    if (!sameOrigin || a.target === "_blank") {
      e.preventDefault();
      e.stopPropagation();
      void openExternal(url.href);
    }
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
const externalLinks = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ANDROID_PACKAGE,
  APPLE_APP_ID,
  SITE_ORIGIN,
  installNativeLinkGuard,
  isWebOnlyPath,
  openExternal,
  openSitePage,
  openStoreReview,
  storeReviewUrl,
  withAppMarker
}, Symbol.toStringTag, { value: "Module" }));
export {
  openSitePage as a,
  externalLinks as e,
  isNativeApp as i,
  openStoreReview as o,
  shareFileNatively as s
};
