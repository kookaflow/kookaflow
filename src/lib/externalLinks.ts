import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "@/lib/nativeFileShare";

export const SITE_ORIGIN = "https://kookaflow.com";
export const APPLE_APP_ID = "6791698037";
export const ANDROID_PACKAGE = "com.kookaflow.app";

/** Website pages that must open in the in-app browser on native, never in the app's own view. */
const WEB_ONLY_PATHS = ["/privacy", "/terms", "/support", "/eula", "/delete-account", "/pricing-web"];

export function isWebOnlyPath(pathname: string): boolean {
  return WEB_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Open a URL outside the app's view on native; normal browser behaviour on web. */
export async function openExternal(url: string): Promise<void> {
  if (!isNativeApp()) {
    window.open(url, "_blank", "noopener");
    return;
  }
  if (/^(mailto|tel|sms):/i.test(url)) {
    // Hand to the OS (Mail / Phone); the app view does not navigate.
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

/** Open the website version of an in-app legal/support page. */
export function openSitePage(path: string): Promise<void> {
  return openExternal(withAppMarker(SITE_ORIGIN + path));
}

/** Add ?from=app so the website page hides links back into the site's sign-in/home. */
export function withAppMarker(href: string): string {
  const url = new URL(href, SITE_ORIGIN);
  url.searchParams.set("from", "app");
  return url.toString();
}

export function storeReviewUrl(): string {
  return Capacitor.getPlatform() === "android"
    ? `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
    : `https://apps.apple.com/app/id${APPLE_APP_ID}?action=write-review`;
}

/** Open the store listing so the App Store / Play Store app takes over. */
export function openStoreReview(): void {
  const url = storeReviewUrl();
  if (isNativeApp()) {
    // _system hands https store links to the store app via universal/app links.
    window.open(url, "_system");
  } else {
    window.open(`https://apps.apple.com/app/id${APPLE_APP_ID}`, "_blank", "noopener");
  }
}

/**
 * Native only: intercept any link click that would navigate the app's view away
 * (other origins, target=_blank, mailto/tel, website-only pages) and open it externally.
 */
export function installNativeLinkGuard(): () => void {
  if (typeof document === "undefined" || !isNativeApp()) return () => {};
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented) return;
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a) return;
    const raw = a.getAttribute("href") ?? "";
    if (!raw || raw.startsWith("#")) return;
    let url: URL;
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
  // Capture phase so it runs before the router's own Link handler.
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
