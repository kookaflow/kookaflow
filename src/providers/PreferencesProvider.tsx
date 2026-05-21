import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  isThemeMode,
  isThemeName,
  type ThemeMode,
  type ThemeName,
} from "@/lib/themes";
import type { UserPreferences, ViewMode } from "@/types/preferences";

const KEY = "shiftsync.prefs.v1";

const DEFAULT: UserPreferences = {
  themeName: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  defaultView: "month",
  weekStartsOn: 1,
};

interface Ctx {
  prefs: UserPreferences;
  setThemeName: (name: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  /** @deprecated use toggleMode */
  toggleTheme: () => void;
  setDefaultView: (v: ViewMode) => void;
}

const PreferencesContext = createContext<Ctx | null>(null);

function migrateLegacy(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT;
  const r = raw as Record<string, unknown>;
  const themeName = isThemeName(r.themeName) ? r.themeName : DEFAULT.themeName;
  let mode: ThemeMode = DEFAULT.mode;
  if (isThemeMode(r.mode)) mode = r.mode;
  else if (r.theme === "light" || r.theme === "dark") mode = r.theme;
  const defaultView = (r.defaultView === "month" || r.defaultView === "week" || r.defaultView === "day")
    ? (r.defaultView as ViewMode)
    : DEFAULT.defaultView;
  const weekStartsOn = r.weekStartsOn === 0 ? 0 : 1;
  return { themeName, mode, defaultView, weekStartsOn };
}

function resolveDarkClass(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT);
  const hydratedRef = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = loadJSON<unknown>(KEY, null);
    setPrefs(migrateLegacy(stored));
    hydratedRef.current = true;
  }, []);

  // Apply theme + persist locally.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = prefs.themeName;
    document.documentElement.classList.toggle("dark", resolveDarkClass(prefs.mode));
    if (hydratedRef.current) saveJSON(KEY, prefs);
  }, [prefs]);

  // Track OS scheme changes while in 'system' mode.
  useEffect(() => {
    if (prefs.mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => document.documentElement.classList.toggle("dark", mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs.mode]);

  // Sync with Supabase: pull on sign-in, push (debounced) on change while signed-in.
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const { data: row } = await supabase
        .from("user_preferences")
        .select("theme, theme_mode")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (cancelled || !row) return;
      setPrefs((p) => ({
        ...p,
        themeName: isThemeName(row.theme) ? row.theme : p.themeName,
        mode: isThemeMode(row.theme_mode) ? (row.theme_mode as ThemeMode) : p.mode,
      }));
    }
    pull();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") pull();
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  // Debounced push to Supabase.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      // Persist 'system' as the OS-resolved value so it round-trips.
      const persistMode: "light" | "dark" =
        prefs.mode === "system" ? (resolveDarkClass("system") ? "dark" : "light") : prefs.mode;
      await supabase
        .from("user_preferences")
        .update({ theme: prefs.themeName, theme_mode: persistMode })
        .eq("user_id", data.user.id);
    }, 400);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [prefs.themeName, prefs.mode]);

  const value = useMemo<Ctx>(() => ({
    prefs,
    setThemeName: (themeName) => setPrefs((p) => ({ ...p, themeName })),
    setMode: (mode) => setPrefs((p) => ({ ...p, mode })),
    toggleMode: () => setPrefs((p) => ({ ...p, mode: resolveDarkClass(p.mode) ? "light" : "dark" })),
    toggleTheme: () => setPrefs((p) => ({ ...p, mode: resolveDarkClass(p.mode) ? "light" : "dark" })),
    setDefaultView: (defaultView) => setPrefs((p) => ({ ...p, defaultView })),
  }), [prefs]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
