/**
 * Single source of truth for category + shift visual/behavioural config.
 * All chips, badges, stamps, dashboards, and presets read from here.
 */
import {
  Briefcase, Moon, Heart, Dumbbell, Users, Home, Star, Car,
  Sun, Sunset, Radio, GitBranch, Zap, Thermometer, Umbrella, DollarSign,
  type LucideIcon,
} from "lucide-react";
import type { CalendarEvent, CategoryId, ShiftType } from "@/types/event";
import { ICON_MAP } from "@/components/events/IconPicker";

export interface CategoryConfig {
  label: string;
  colour: string;
  icon: string;
  Icon: LucideIcon;
}

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  work:     { label: "Work / Shifts", colour: "#3B82F6", icon: "Briefcase", Icon: Briefcase },
  business: { label: "Business",      colour: "#0EA5E9", icon: "Briefcase", Icon: Briefcase },
  rest:     { label: "Rest / Sleep",  colour: "#8B5CF6", icon: "Moon",      Icon: Moon },
  wellness: { label: "Wellness",      colour: "#EC4899", icon: "Heart",     Icon: Heart },
  exercise: { label: "Exercise",      colour: "#10B981", icon: "Dumbbell",  Icon: Dumbbell },
  social:   { label: "Social",        colour: "#F59E0B", icon: "Users",     Icon: Users },
  family:   { label: "Family",        colour: "#EF4444", icon: "Home",      Icon: Home },
  personal: { label: "Personal",      colour: "#6366F1", icon: "Star",      Icon: Star },
  travel:   { label: "Travel",        colour: "#06B6D4", icon: "Car",       Icon: Car },
};

export interface ShiftConfig {
  label: string;
  shortLabel: string;
  colour: string;
  icon: string;
  Icon: LucideIcon;
  category: CategoryId;
  defaultStart: string | null;
  defaultEnd: string | null;
  isAllDay: boolean;
  overnight?: boolean;
  travelDurationMinutes?: number;
  isPayday?: boolean;
}

export type ShiftKey =
  | "morning" | "afternoon" | "night" | "oncall" | "split"
  | "side_hustle" | "sick_leave" | "annual_leave" | "travel" | "payday";

export const SHIFT_CONFIG: Record<ShiftKey, ShiftConfig> = {
  morning:      { label: "Morning",      shortLabel: "AM",     colour: "#F59E0B", icon: "Sun",        Icon: Sun,        category: "work",   defaultStart: "06:00", defaultEnd: "14:00", isAllDay: false },
  afternoon:    { label: "Afternoon",    shortLabel: "PM",     colour: "#F97316", icon: "Sunset",     Icon: Sunset,     category: "work",   defaultStart: "14:00", defaultEnd: "22:00", isAllDay: false },
  night:        { label: "Night",        shortLabel: "Night",  colour: "#6366F1", icon: "Moon",       Icon: Moon,       category: "work",   defaultStart: "22:00", defaultEnd: "06:00", isAllDay: false, overnight: true },
  oncall:       { label: "On-Call",      shortLabel: "Call",   colour: "#14B8A6", icon: "Radio",      Icon: Radio,      category: "work",   defaultStart: null,    defaultEnd: null,    isAllDay: true },
  split:        { label: "Split Shift",  shortLabel: "Split",  colour: "#8B5CF6", icon: "GitBranch",  Icon: GitBranch,  category: "work",   defaultStart: "08:00", defaultEnd: "20:00", isAllDay: false },
  side_hustle:  { label: "Side Hustle",  shortLabel: "Hustle", colour: "#D4A017", icon: "Zap",        Icon: Zap,        category: "work",   defaultStart: "09:00", defaultEnd: "17:00", isAllDay: false },
  sick_leave:   { label: "Sick Leave",   shortLabel: "Sick",   colour: "#EF4444", icon: "Thermometer",Icon: Thermometer,category: "work",   defaultStart: null,    defaultEnd: null,    isAllDay: true },
  annual_leave: { label: "Annual Leave", shortLabel: "Leave",  colour: "#0EA5E9", icon: "Umbrella",   Icon: Umbrella,   category: "work",   defaultStart: null,    defaultEnd: null,    isAllDay: true },
  travel:       { label: "Travel",       shortLabel: "Travel", colour: "#64748B", icon: "Car",        Icon: Car,        category: "travel", defaultStart: null,    defaultEnd: null,    isAllDay: true, travelDurationMinutes: 60 },
  payday:       { label: "Payday",       shortLabel: "Pay",    colour: "#10B981", icon: "DollarSign", Icon: DollarSign, category: "work",   defaultStart: null,    defaultEnd: null,    isAllDay: true, isPayday: true },
};

export function getCategoryConfig(id: CategoryId): CategoryConfig {
  return CATEGORY_CONFIG[id] ?? CATEGORY_CONFIG.personal;
}

/**
 * Ensure a badge background is dark enough to meet ~3:1 contrast vs white text.
 * If the colour is too light (or unparseable), fall back to the supplied default.
 */
export function ensureReadableBadgeColour(
  colour: string | null | undefined,
  fallback: string,
): string {
  if (!colour) return fallback;
  const hex = colour.trim().replace(/^#/, "");
  const norm =
    hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex.length === 6
        ? hex
        : null;
  if (!norm || !/^[0-9a-fA-F]{6}$/.test(norm)) return fallback;
  const r = parseInt(norm.slice(0, 2), 16) / 255;
  const g = parseInt(norm.slice(2, 4), 16) / 255;
  const b = parseInt(norm.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  // Contrast vs white = 1.05 / (L + 0.05). 3:1 requires L <= 0.3.
  return L > 0.3 ? fallback : `#${norm}`;
}

export function getShiftConfig(type: string | null | undefined): ShiftConfig | null {
  if (!type) return null;
  return (SHIFT_CONFIG as Record<string, ShiftConfig>)[type] ?? null;
}

/** Returns the canonical colour for an event: shift colour if any, else category. */
export function getEventColour(event: Pick<CalendarEvent, "category" | "shift" | "isPayday">): string {
  const sc = getShiftConfig(event.shift?.shiftType);
  if (sc) return sc.colour;
  if (event.isPayday) return SHIFT_CONFIG.payday.colour;
  return getCategoryConfig(event.category).colour;
}

export function getEventIconComponent(event: Pick<CalendarEvent, "category" | "shift" | "iconName" | "isPayday">): LucideIcon {
  if (event.iconName && ICON_MAP[event.iconName]) return ICON_MAP[event.iconName];
  const sc = getShiftConfig(event.shift?.shiftType);
  if (sc) return sc.Icon;
  if (event.isPayday) return SHIFT_CONFIG.payday.Icon;
  return getCategoryConfig(event.category).Icon;
}

export const CATEGORY_LIST: { id: CategoryId; label: string; colour: string; Icon: LucideIcon }[] =
  (Object.keys(CATEGORY_CONFIG) as CategoryId[]).map((id) => ({
    id,
    label: CATEGORY_CONFIG[id].label,
    colour: CATEGORY_CONFIG[id].colour,
    Icon: CATEGORY_CONFIG[id].Icon,
  }));

export const SHIFT_KEYS = Object.keys(SHIFT_CONFIG) as ShiftKey[];

/** All ShiftType values that map cleanly to a shift_type column. */
export function isPersistedShiftType(t: ShiftType | null | undefined): t is ShiftKey {
  return !!t && t in SHIFT_CONFIG;
}