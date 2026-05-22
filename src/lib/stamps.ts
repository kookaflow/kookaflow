import {
  Sun, Sunset, Moon, Radio, GitBranch, Zap, Thermometer, Umbrella, Car,
  DollarSign, BedDouble, Ban, CalendarOff, Clock4, Flag,
  Dumbbell, Heart, Users, Home, Star, Coffee, Music, Book, Plane, Baby, Dog,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId, ShiftType } from "@/types/event";

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
  template?: {
    id: string;
    isSplitShift: boolean;
    splitStart2: string | null;
    splitEnd2: string | null;
    unpaidBreakMinutes: number;
    paidBreakMinutes: number;
  };
}

export const SHIFT_STAMPS: StampDef[] = [
  { id: "morning", kind: "shift", label: "Morning", shortLabel: "Morning", colour: "#F59E0B", Icon: Sun, shiftType: "morning", category: "work", startTime: "06:00", endTime: "14:00", iconName: "Sun" },
  { id: "afternoon", kind: "shift", label: "Afternoon", shortLabel: "PM", colour: "#F97316", Icon: Sunset, shiftType: "afternoon", category: "work", startTime: "14:00", endTime: "22:00", iconName: "Sunset" },
  { id: "night", kind: "shift", label: "Night", shortLabel: "Night", colour: "#6366F1", Icon: Moon, shiftType: "night", category: "work", startTime: "22:00", endTime: "06:00", overnight: true, iconName: "Moon" },
  { id: "oncall", kind: "shift", label: "On-Call", shortLabel: "On-Call", colour: "#14B8A6", Icon: Radio, shiftType: "oncall", category: "work", allDay: true, iconName: "Radio" },
  { id: "split", kind: "shift", label: "Split", shortLabel: "Split", colour: "#A855F7", Icon: GitBranch, shiftType: "split", category: "work", startTime: "06:00", endTime: "20:00", iconName: "GitBranch" },
  { id: "side_hustle", kind: "shift", label: "Side Hustle", shortLabel: "Hustle", colour: "#D4A017", Icon: Zap, shiftType: "side_hustle", category: "work", startTime: "18:00", endTime: "21:00", iconName: "Zap" },
  { id: "travel", kind: "shift", label: "Travel", shortLabel: "Travel", colour: "#64748B", Icon: Car, category: "travel", startTime: "08:00", endTime: "09:00", iconName: "Car" },
  { id: "payday", kind: "shift", label: "Payday", shortLabel: "Payday", colour: "#10B981", Icon: DollarSign, category: "work", allDay: true, iconName: "DollarSign", isPayday: true },
];

export const LEAVE_STAMPS: StampDef[] = [
  { id: "annual_leave", kind: "shift", label: "Annual Leave", shortLabel: "Leave", colour: "#0EA5E9", Icon: Umbrella, shiftType: "annual_leave", category: "work", allDay: true, iconName: "Umbrella" },
  { id: "sick_leave", kind: "shift", label: "Sick Leave", shortLabel: "Sick", colour: "#EF4444", Icon: Thermometer, shiftType: "sick_leave", category: "work", allDay: true, iconName: "Thermometer" },
  { id: "public_holiday", kind: "shift", label: "Public Holiday", shortLabel: "Holiday", colour: "#22C55E", Icon: Flag, category: "personal", allDay: true, iconName: "Star" },
  { id: "half_day", kind: "shift", label: "Half Day", shortLabel: "Half", colour: "#8B5CF6", Icon: Clock4, shiftType: "morning", category: "work", startTime: "09:00", endTime: "13:00", iconName: "Clock" },
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