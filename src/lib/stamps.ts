import {
  BedDouble, Ban, CalendarOff, Clock3, Flag,
  Dumbbell, Heart, Users, Home, Star, Coffee, Music, Book, Plane, Baby, Dog,
  DollarSign, Car,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId, ShiftType } from "@/types/event";
import { SHIFT_CONFIG, type ShiftKey } from "@/lib/shiftConfig";

export type StampKind = "shift" | "icon" | "clear" | "rest";

export interface StampDef {
  id: string;
  kind: StampKind;
  label: string;
  shortLabel: string;
  colour: string;
  Icon: LucideIcon;
  shiftType?: ShiftType | null;
  category?: CategoryId;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  overnight?: boolean;
  iconName?: string;
  isPayday?: boolean;
}

/** Build a shift stamp from a canonical SHIFT_CONFIG key. */
function fromShiftConfig(key: ShiftKey, idOverride?: string): StampDef {
  const c = SHIFT_CONFIG[key];
  return {
    id: idOverride ?? key,
    kind: "shift",
    label: c.label,
    shortLabel: c.shortLabel,
    colour: c.colour,
    Icon: c.Icon,
    shiftType: (key === "travel" || key === "payday" ? null : key) as ShiftType | null,
    category: c.category,
    allDay: c.isAllDay,
    startTime: c.defaultStart ?? undefined,
    endTime: c.defaultEnd ?? undefined,
    overnight: c.overnight,
    iconName: c.icon,
    isPayday: c.isPayday,
  };
}

export const SHIFT_STAMPS: StampDef[] = [
  fromShiftConfig("morning"),
  fromShiftConfig("afternoon"),
  fromShiftConfig("night"),
  fromShiftConfig("oncall"),
  fromShiftConfig("split"),
  fromShiftConfig("side_hustle"),
  fromShiftConfig("travel"),
  fromShiftConfig("payday"),
];

export const LEAVE_STAMPS: StampDef[] = [
  fromShiftConfig("annual_leave"),
  fromShiftConfig("sick_leave"),
  { id: "public_holiday", kind: "shift", label: "Public Holiday", shortLabel: "Holiday", colour: "#22C55E", Icon: Flag, category: "personal", allDay: true, iconName: "Flag" },
  { id: "half_day", kind: "shift", label: "Half Day", shortLabel: "Half", colour: "#8B5CF6", Icon: Clock3, shiftType: "morning", category: "work", startTime: "09:00", endTime: "13:00", iconName: "Clock3" },
  { id: "no_shift", kind: "clear", label: "No Shift", shortLabel: "Clear", colour: "#94A3B8", Icon: Ban },
  { id: "rest_day", kind: "rest", label: "Rest Day", shortLabel: "Rest", colour: "#A78BFA", Icon: BedDouble, category: "rest", allDay: true, iconName: "Moon" },
];

export const ICON_STAMPS: StampDef[] = [
  { id: "icon_payday", kind: "icon", label: "Payday", shortLabel: "Payday", colour: "#10B981", Icon: DollarSign, iconName: "DollarSign" },
  { id: "icon_travel", kind: "icon", label: "Travel", shortLabel: "Travel", colour: "#64748B", Icon: Car, iconName: "Car" },
  { id: "icon_gym", kind: "icon", label: "Gym", shortLabel: "Gym", colour: "#F59E0B", Icon: Dumbbell, iconName: "Dumbbell" },
  { id: "icon_wellness", kind: "icon", label: "Wellness", shortLabel: "Wellness", colour: "#EC4899", Icon: Heart, iconName: "Heart" },
  { id: "icon_social", kind: "icon", label: "Social", shortLabel: "Social", colour: "#10B981", Icon: Users, iconName: "Users" },
  { id: "icon_family", kind: "icon", label: "Family", shortLabel: "Family", colour: "#EF4444", Icon: Home, iconName: "Home" },
  { id: "icon_star", kind: "icon", label: "Special", shortLabel: "Special", colour: "#FACC15", Icon: Star, iconName: "Star" },
  { id: "icon_coffee", kind: "icon", label: "Rest", shortLabel: "Coffee", colour: "#92400E", Icon: Coffee, iconName: "Coffee" },
  { id: "icon_music", kind: "icon", label: "Music", shortLabel: "Music", colour: "#A855F7", Icon: Music, iconName: "Music" },
  { id: "icon_book", kind: "icon", label: "Read", shortLabel: "Book", colour: "#0EA5E9", Icon: Book, iconName: "Book" },
  { id: "icon_plane", kind: "icon", label: "Travel", shortLabel: "Plane", colour: "#3B82F6", Icon: Plane, iconName: "Plane" },
  { id: "icon_baby", kind: "icon", label: "Kids", shortLabel: "Kids", colour: "#F472B6", Icon: Baby, iconName: "Baby" },
  { id: "icon_dog", kind: "icon", label: "Pet", shortLabel: "Pet", colour: "#A16207", Icon: Dog, iconName: "Dog" },
];

export const CalendarOffIcon = CalendarOff;