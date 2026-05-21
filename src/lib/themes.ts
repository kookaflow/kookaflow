export type ThemeName = "slate" | "midnight" | "lavender" | "forest";
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  description: string;
  preview: {
    bgLight: string;
    bgDark: string;
    surface: string;
    accent: string;
    highlight: string;
  };
}

export const THEMES: ThemeMeta[] = [
  {
    name: "slate",
    label: "Slate",
    description: "Calm, broad-appeal blue.",
    preview: { bgLight: "#F8FAFC", bgDark: "#0F172A", surface: "#E2E8F0", accent: "#3B82F6", highlight: "#F97316" },
  },
  {
    name: "midnight",
    label: "Midnight",
    description: "Deep navy with teal & amber.",
    preview: { bgLight: "#F8FAFC", bgDark: "#0F172A", surface: "#1E293B", accent: "#14B8A6", highlight: "#F59E0B" },
  },
  {
    name: "lavender",
    label: "Lavender",
    description: "Soft purple with violet & coral.",
    preview: { bgLight: "#F5F3FF", bgDark: "#1E1B2E", surface: "#EDE9FE", accent: "#7C3AED", highlight: "#F43F5E" },
  },
  {
    name: "forest",
    label: "Forest",
    description: "Emerald with sunny yellow.",
    preview: { bgLight: "#F0FDF4", bgDark: "#1C1C2E", surface: "#DCFCE7", accent: "#10B981", highlight: "#FCD34D" },
  },
];

export const DEFAULT_THEME: ThemeName = "slate";
export const DEFAULT_MODE: ThemeMode = "system";

export function isThemeName(v: unknown): v is ThemeName {
  return v === "slate" || v === "midnight" || v === "lavender" || v === "forest";
}
export function isThemeMode(v: unknown): v is ThemeMode {
  return v === "light" || v === "dark" || v === "system";
}
