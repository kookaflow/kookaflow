export type ViewMode = "month" | "week" | "day";
export type ThemeMode = "dark" | "light";

export interface UserPreferences {
  theme: ThemeMode;
  defaultView: ViewMode;
  weekStartsOn: 0 | 1;
}