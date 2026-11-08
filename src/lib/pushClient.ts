/**
 * Single push adapter. Native (iOS/Android) uses OneSignal's Capacitor
 * plugin; the website keeps the web SDK (react-onesignal). Every call is
 * fail-safe and never throws into the UI.
 *
 * Plugin modules are imported dynamically and we always call through the
 * imported module — never return a plugin object from an async function.
 */
import { Capacitor } from "@capacitor/core";

export type PushPermission = "granted" | "denied" | "default" | "unsupported";
export type PushSubscriptionInfo = { id: string | null; optedIn: boolean };

export function isNativePush(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

const log = (...a: unknown[]) => console.log("[push]", ...a);
const warn = (...a: unknown[]) => console.warn("[push]", ...a);

const nativeMod = () => import("@onesignal/capacitor-plugin");
const webMod = () => import("react-onesignal");

let initPromise: Promise<boolean> | null = null;
let resolveReady: (ok: boolean) => void = () => {};
const readyPromise = new Promise<boolean>((r) => (resolveReady = r));

const subListeners = new Set<() => void>();
const emitSub = () => subListeners.forEach((cb) => { try { cb(); } catch { /* ignore */ } });

/** Resolves once init has finished (true = ok). */
export function whenPushReady(): Promise<boolean> {
  return readyPromise;
}

/** Token is never logged in full: first 6 characters at most. */
export function maskToken(t: string | null | undefined): string {
  return t ? `present (${t.slice(0, 6)}…)` : "missing";
}

export async function logPushState(label: string): Promise<void> {
  try {
    if (!isNativePush()) return;
    const mod = await nativeMod();
    const os = mod.default;
    const [granted, canRequest, id, token, optedIn] = await Promise.all([
      os.Notifications.hasPermission().catch(() => null),
      os.Notifications.canRequestPermission().catch(() => null),
      os.User.pushSubscription.getIdAsync().catch(() => null),
      os.User.pushSubscription.getTokenAsync().catch(() => null),
      os.User.pushSubscription.getOptedInAsync().catch(() => null),
    ]);
    log(`state (${label})`, `permission=${granted}`, `canRequest=${canRequest}`,
      `subscriptionId=${id ? "present" : "missing"}`, `token=${maskToken(token)}`, `optedIn=${optedIn}`);
  } catch (e) {
    warn("state read failed", e);
  }
}

export function initPush(appId: string): Promise<boolean> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      if (isNativePush()) {
        const mod = await nativeMod();
        const os = mod.default;
        await os.initialize(appId);
        log("native init ok");
        // Register listeners right after init so the plugin always has them.
        os.User.pushSubscription.addEventListener("change", () => {
          log("subscription change");
          void logPushState("subscription change");
          emitSub();
        });
        os.Notifications.addEventListener("permissionChange", (granted: boolean) => {
          log("permission change", granted);
          void logPushState("permission change");
          emitSub();
        });
        void logPushState("after init");
      } else {
        const mod = await webMod();
        await mod.default.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
        });
        log("web init ok");
        mod.default.User.PushSubscription.addEventListener("change", () => emitSub());
      }
      resolveReady(true);
      return true;
    } catch (e) {
      warn("init failed", e);
      resolveReady(false);
      return false;
    }
  })();
  return initPromise;
}

export async function loginPush(userId: string): Promise<void> {
  if (!(await whenPushReady())) {
    warn("login skipped: init failed");
    return;
  }
  try {
    log("login start", userId);
    if (isNativePush()) await (await nativeMod()).default.login(userId);
    else await (await webMod()).default.login(userId);
    log("login ok", userId);
    void logPushState("after login");
    setTimeout(() => void logPushState("3s after login"), 3000);
    setTimeout(() => void logPushState("10s after login"), 10000);
  } catch (e) {
    warn("login failed", e);
  }
}

export async function logoutPush(): Promise<void> {
  try {
    if (isNativePush()) await (await nativeMod()).default.logout();
    else await (await webMod()).default.logout();
    log("logout");
  } catch (e) {
    warn("logout failed", e);
  }
}

export async function requestPushPermission(): Promise<boolean> {
  try {
    if (isNativePush()) {
      await whenPushReady();
      log("permission request");
      const ok = await (await nativeMod()).default.Notifications.requestPermission(true);
      log("permission result", ok);
      void logPushState("after permission request");
      return ok;
    }
    await (await webMod()).default.Notifications.requestPermission();
    return typeof Notification !== "undefined" && Notification.permission === "granted";
  } catch (e) {
    warn("permission request failed", e);
    return false;
  }
}

/** Map native granted/canRequest into a permission state. Exported for tests. */
export function nativePermissionState(granted: boolean, canRequest: boolean): PushPermission {
  if (granted) return "granted";
  return canRequest ? "default" : "denied";
}

export async function getPushPermission(): Promise<PushPermission> {
  try {
    if (isNativePush()) {
      await whenPushReady();
      const os = (await nativeMod()).default;
      const granted = await os.Notifications.hasPermission();
      const canRequest = await os.Notifications.canRequestPermission();
      return nativePermissionState(!!granted, !!canRequest);
    }
    if (typeof Notification === "undefined") return "unsupported";
    return Notification.permission;
  } catch (e) {
    warn("permission read failed", e);
    return "unsupported";
  }
}

export async function getPushSubscription(): Promise<PushSubscriptionInfo> {
  try {
    if (isNativePush()) {
      const sub = (await nativeMod()).default.User.pushSubscription;
      const id = await sub.getIdAsync();
      const optedIn = await sub.getOptedInAsync();
      return { id: id ?? null, optedIn: !!optedIn };
    }
    const sub = (await webMod()).default.User.PushSubscription;
    return { id: sub.id ?? null, optedIn: !!sub.optedIn };
  } catch (e) {
    warn("subscription read failed", e);
    return { id: null, optedIn: false };
  }
}

/** Subscribe to push-subscription/permission changes. Returns an unsubscribe function. */
export function onPushSubscriptionChange(cb: () => void): () => void {
  subListeners.add(cb);
  return () => {
    subListeners.delete(cb);
  };
}

/** Native only: called with an in-app path when a notification is tapped. */
export function onPushClick(cb: (path: string) => void): () => void {
  if (!isNativePush()) return () => {};
  let off = () => {};
  let cancelled = false;
  (async () => {
    try {
      const mod = await nativeMod();
      const h = (event: { notification: { additionalData?: object; launchURL?: string }; result: { url?: string } }) => {
        const path = pathFromClick(event);
        if (path) setTimeout(() => cb(path), 0);
      };
      if (cancelled) return;
      mod.default.Notifications.addEventListener("click", h as never);
      off = () => mod.default.Notifications.removeEventListener("click", h as never);
    } catch (e) {
      warn("click listener failed", e);
    }
  })();
  return () => {
    cancelled = true;
    off();
  };
}

/** Extract a same-app path from a notification tap. Exported for tests. */
export function pathFromClick(event: {
  notification?: { additionalData?: object; launchURL?: string };
  result?: { url?: string };
}): string | null {
  const data = (event.notification?.additionalData ?? {}) as Record<string, unknown>;
  if (typeof data.path === "string" && data.path.startsWith("/")) return data.path;
  const raw = event.result?.url ?? event.notification?.launchURL;
  if (!raw) return null;
  try {
    const u = new URL(raw, "https://kookaflow.com");
    if (!/(^|\.)kookaflow\.com$/.test(u.hostname)) return null;
    return u.pathname + u.search;
  } catch {
    return null;
  }
}
