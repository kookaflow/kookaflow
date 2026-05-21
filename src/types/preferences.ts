import type { ThemeMode as TM, ThemeName } from "@/lib/themes";

export type ViewMode = "month" | "week" | "day";
export type ThemeMode = TM;
export type { ThemeName };

export interface UserPreferences {
  themeName: ThemeName;
  mode: ThemeMode;
  defaultView: ViewMode;
  weekStartsOn: 0 | 1;
}
