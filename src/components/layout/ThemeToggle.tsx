import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/providers/PreferencesProvider";

export function ThemeToggle() {
  const { prefs, toggleMode } = usePreferences();
  const isDark =
    prefs.mode === "dark" ||
    (prefs.mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <Button variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
