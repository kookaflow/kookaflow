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

async function restoreFromPreferences(): Promise<boolean> {
  try {
    const { value } = await (await prefsModule()).Preferences.get({ key: KEY });
    console.log(`[native-auth] preferences copy: ${value ? "present" : "missing"}`);
    if (!value) return false;
    const saved = JSON.parse(value) as Saved;
    if (!saved?.refresh_token) return false;
    const { data, error } = await supabase.auth.setSession(saved);
    if (error) {
      if (isDeadRefreshToken(error)) {
        await removeCopy();
        console.log("[native-auth] cleared (saved sign-in rejected by server)");
      }
      console.warn("[native-auth] restore failed:", error.message);
      return false;
    }
    console.log(`[native-auth] restore ${data.session ? "ok" : "failed: no session returned"}`);
    // setSession may have rotated the refresh token — keep the durable copy current.
    if (data.session) {
      await save(
        { access_token: data.session.access_token, refresh_token: data.session.refresh_token },
        "restore",
      );
    }
    return !!data.session;
  } catch (e) {
    console.warn("[native-auth] restore error", e);
    return false;
  }
}

/**
 * The launch check: read the WebView session, restore it from Preferences if
 * missing, refresh the durable copy, and report whether a session exists.
 * Concurrent callers share one in-flight check; later calls re-check (cheap,
 * local) so a deliberate sign-out is never masked by a stale result.
 * This is the ungated core; callers use resolveNativeSession(). Exported for tests.
 */
export async function checkNativeSession(): Promise<boolean> {
  console.log("[native-auth] launch check start");
  try {
    const { data } = await supabase.auth.getSession();
    console.log(`[native-auth] webview session: ${data.session ? "present" : "missing"}`);
    if (data.session) {
      await save(
        { access_token: data.session.access_token, refresh_token: data.session.refresh_token },
        "launch-check",
      );
      return true;
    }
    return await restoreFromPreferences();
  } catch (e) {
    console.warn("[native-auth] launch check error", e);
    return false;
  }
}

let inFlight: Promise<boolean> | null = null;
export function resolveNativeSession(): Promise<boolean> {
  if (!isNativeAuthPlatform()) return Promise.resolve(false);
  if (!inFlight) {
    const timeout = new Promise<boolean>((resolve) =>
      setTimeout(() => {
        console.warn("[native-auth] launch check timed out -> /login");
        resolve(false);
      }, 8000),
    );
    const safe = checkNativeSession().catch((e) => {
      console.warn("[native-auth] launch check failed -> /login", e);
      return false;
    });
    inFlight = Promise.race([safe, timeout]).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
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

  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION")) {
      void save({ access_token: session.access_token, refresh_token: session.refresh_token }, event);
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
  void supabase.auth.startAutoRefresh();

  return () => {
    sub.subscription.unsubscribe();
    void handle?.remove();
  };
}
