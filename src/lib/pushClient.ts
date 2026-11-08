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

let initialised = false;

export async function initPush(appId: string): Promise<boolean> {
  if (initialised) return true;
  try {
    if (isNativePush()) {
      const mod = await nativeMod();
      await mod.default.initialize(appId);
      log("native init ok");
    } else {
      const mod = await webMod();
      await mod.default.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: "/" },
      });
      log("web init ok");
    }
    initialised = true;
    return true;
  } catch (e) {
    warn("init failed", e);
    return false;
  }
}

export async function loginPush(userId: string): Promise<void> {
  try {
    if (isNativePush()) await (await nativeMod()).default.login(userId);
    else await (await webMod()).default.login(userId);
    log("login", userId);
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
      return await (await nativeMod()).default.Notifications.requestPermission(true);
    }
    await (await webMod()).default.Notifications.requestPermission();
    return typeof Notification !== "undefined" && Notification.permission === "granted";
  } catch (e) {
    warn("permission request failed", e);
    return false;
  }
}

export async function getPushPermission(): Promise<PushPermission> {
  try {
    if (isNativePush()) {
      const mod = await nativeMod();
      const p = await mod.default.Notifications.permissionNative();
      if (p === 1) return "denied";
      if (p === 0) return "default";
      return "granted";
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

/** Subscribe to push-subscription changes. Returns an unsubscribe function. */
export function onPushSubscriptionChange(cb: () => void): () => void {
  let off = () => {};
  let cancelled = false;
  (async () => {
    try {
      if (isNativePush()) {
        const mod = await nativeMod();
        const h = () => cb();
        if (cancelled) return;
        mod.default.User.pushSubscription.addEventListener("change", h);
        off = () => mod.default.User.pushSubscription.removeEventListener("change", h);
      } else {
        const mod = await webMod();
        const h = () => cb();
        if (cancelled) return;
        mod.default.User.PushSubscription.addEventListener("change", h);
        off = () => mod.default.User.PushSubscription.removeEventListener("change", h);
      }
    } catch (e) {
      warn("subscription listener failed", e);
    }
  })();
  return () => {
    cancelled = true;
    off();
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
