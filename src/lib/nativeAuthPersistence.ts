import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

/**
 * Native-only durable copy of the sign-in session in Capacitor Preferences
 * (UserDefaults / SharedPreferences), which survives WebView storage purges.
 * Web never runs any of this.
 */
const KEY = "kookaflow.auth.session";

export function isNativeAuthPlatform(): boolean {
  return import.meta.env.VITE_IS_MOBILE_BUILD === true && Capacitor.isNativePlatform();
}

// Never return/await the plugin proxy itself: Capacitor proxies throw on
// ".then()". Return the module and call mod.Preferences.* instead.
async function prefsModule() {
  const mod = await import("@capacitor/preferences");
  return mod;
}

type Saved = { access_token: string; refresh_token: string };

async function save(s: Saved, reason = "unknown") {
  try {
    await (await prefsModule()).Preferences.set({ key: KEY, value: JSON.stringify(s) });
    console.log(`[native-auth] saved (event=${reason})`);
  } catch (e) {
    console.warn("[native-auth] save failed", e);
  }
}

async function removeCopy() {
  await (await prefsModule()).Preferences.remove({ key: KEY });
}

/** Call before a deliberate sign-out or account deletion. */
export async function clearNativeSession(): Promise<void> {
  if (!isNativeAuthPlatform()) return;
  try {
    await removeCopy();
    console.log("[native-auth] cleared (deliberate sign-out)");
  } catch (e) {
    console.warn("[native-auth] clear failed", e);
  }
}

function isDeadRefreshToken(error: { message?: string } | null | undefined) {
  const m = (error?.message ?? "").toLowerCase();
  return (
    m.includes("refresh token not found") ||
    m.includes("invalid refresh token") ||
    m.includes("refresh token revoked") ||
    m.includes("already used") ||
    m.includes("session_not_found") ||
    m.includes("user not found")
  );
}

/**
 * When the WebView lost its session, restore it from Preferences.
 * Returns true if a session is now present.
 */
export async function restoreNativeSession(): Promise<boolean> {
  if (!isNativeAuthPlatform()) return false;
  return restoreFromPreferences();
}

const t0Ref = { t: 0 };
function step(msg: string) {
  console.log(`[native-auth] +${Date.now() - t0Ref.t}ms ${msg}`);
}

/** Resolve with the promise, or reject after ms. Exported for tests. */
export function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(id); resolve(v); },
      (e) => { clearTimeout(id); reject(e); },
    );
  });
}

function saveLater(s: Saved, reason: string) {
  step(`save scheduled (${reason})`);
  setTimeout(() => void save(s, reason), 0);
}

async function restoreFromPreferences(): Promise<boolean> {
  try {
    step("preferences get begin");
    const mod = await prefsModule();
    const { value } = await withTimeout(mod.Preferences.get({ key: KEY }), 2000, "Preferences.get");
    step(`preferences get end: ${value ? "present" : "missing"}`);
    if (!value) return false;
    const saved = JSON.parse(value) as Saved;
    if (!saved?.refresh_token) return false;
    step("setSession begin");
    const { data, error } = await withTimeout(supabase.auth.setSession(saved), 5000, "setSession");
    step(`setSession end: ${error ? "error" : data.session ? "ok" : "no session"}`);
    if (error) {
      if (isDeadRefreshToken(error)) {
        setTimeout(() => void removeCopy().catch(() => {}), 0);
        console.log("[native-auth] cleared (saved sign-in rejected by server)");
      }
      console.warn("[native-auth] restore failed:", error.message);
      return false;
    }
    if (data.session) {
      saveLater({ access_token: data.session.access_token, refresh_token: data.session.refresh_token }, "restore");
    }
    return !!data.session;
  } catch (e) {
    console.warn("[native-auth] restore error", e);
    return false;
  }
}

/**
 * The launch check: read the WebView session, restore it from Preferences if
 * missing, and report whether a session exists. Never waits on Preferences
 * writes; every step is individually time-boxed and logged with timing.
 * Ungated core; callers use resolveNativeSession(). Exported for tests.
 */
export async function checkNativeSession(): Promise<boolean> {
  t0Ref.t = Date.now();
  step("launch check start");
  try {
    step("getSession begin");
    const { data } = await withTimeout(supabase.auth.getSession(), 3000, "getSession");
    step(`getSession end: webview session ${data.session ? "present" : "missing"}`);
    if (data.session) {
      saveLater({ access_token: data.session.access_token, refresh_token: data.session.refresh_token }, "launch-check");
      return true;
    }
    return await restoreFromPreferences();
  } catch (e) {
    console.warn("[native-auth] launch check error", e);
    return false;
  }
}

let inFlight: Promise<boolean> | null = null;
let settled: { value: boolean; at: number } | null = null;
export function resolveNativeSession(): Promise<boolean> {
  if (!isNativeAuthPlatform()) return Promise.resolve(false);
  if (settled && Date.now() - settled.at < 2000) return Promise.resolve(settled.value);
  if (!inFlight) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => {
        console.warn("[native-auth] launch check timed out -> /login");
        resolve(false);
      }, 8000);
    });
    const safe = checkNativeSession().catch((e) => {
      console.warn("[native-auth] launch check failed -> /login", e);
      return false;
    });
    inFlight = Promise.race([safe, timeout]).then((v) => {
      clearTimeout(timer);
      step(`launch check result: ${v ? "signed in" : "signed out"} (total)`);
      settled = { value: v, at: Date.now() };
      return v;
    }).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/** Forget the cached launch result (after sign-in/sign-out). */
export function resetNativeSessionCache() {
  settled = null;
}

/**
 * Make sure the stored session has a usable access token (refresh once if it
 * expired while the app slept). Returns "ok", "offline" (keep the user in), or
 * "signed_out" only when the refresh token is genuinely dead.
 */
export async function ensureFreshNativeSession(): Promise<"ok" | "offline" | "signed_out"> {
  const { data } = await supabase.auth.getSession();
  const s = data.session;
  if (!s) return "signed_out";
  const expiresAtMs = (s.expires_at ?? 0) * 1000;
  if (expiresAtMs - Date.now() > 60_000) return "ok";
  const { error } = await supabase.auth.refreshSession();
  if (!error) return "ok";
  return isDeadRefreshToken(error) ? "signed_out" : "offline";
}

/** Start mirroring + app foreground/background auto-refresh. Returns cleanup. */
export async function startNativeAuthPersistence(): Promise<() => void> {
  if (!isNativeAuthPlatform()) return () => {};

  // Migration + restore: the shared launch check copies the WebView session
  // into Preferences (or restores from it) before anything else runs here.
  try {
    await resolveNativeSession();
  } catch (e) {
    console.warn("[native-auth] launch check failed", e);
  }

  // Never touch auth or the native bridge inside the callback: supabase-js
  // holds its lock while notifying. Defer one tick.
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") resetNativeSessionCache();
    if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION")) {
      const copy = { access_token: session.access_token, refresh_token: session.refresh_token };
      setTimeout(() => void save(copy, event), 0);
    }
    // SIGNED_OUT deliberately does not clear the copy: deliberate sign-outs call
    // clearNativeSession(); anything else is recoverable via restore.
  });

  let handle: { remove: () => Promise<void> } | null = null;
  try {
    const appMod = await import("@capacitor/app");
    handle = await appMod.App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void supabase.auth.startAutoRefresh();
      else void supabase.auth.stopAutoRefresh();
    });
  } catch (e) {
    console.warn("[native-auth] appStateChange listener failed", e);
  }
  setTimeout(() => void supabase.auth.startAutoRefresh(), 0);

  return () => {
    sub.subscription.unsubscribe();
    void handle?.remove();
  };
}
