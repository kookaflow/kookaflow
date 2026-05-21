import { createContext, useContext, useEffect, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import type { UserPreferences, ThemeMode, ViewMode } from "@/types/preferences";

const KEY = "shiftsync.prefs.v1";
const DEFAULT: UserPreferences = {
  theme: "dark",
  defaultView: "month",
  weekStartsOn: 1,
};

interface Ctx {
  prefs: UserPreferences;
  setTheme: (t: ThemeMode) => void;
  setDefaultView: (v: ViewMode) => void;
  toggleTheme: () => void;
}

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT);

  useEffect(() => {
    setPrefs(loadJSON<UserPreferences>(KEY, DEFAULT));
  }, []);

  useEffect(() => {
    saveJSON(KEY, prefs);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", prefs.theme === "dark");
    }
  }, [prefs]);

  const value: Ctx = {
    prefs,
    setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
    setDefaultView: (defaultView) => setPrefs((p) => ({ ...p, defaultView })),
    toggleTheme: () =>
      setPrefs((p) => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" })),
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}