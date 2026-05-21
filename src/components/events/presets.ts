import {
  Sun, Sunset, Moon, Radio, GitBranch, Thermometer, Umbrella, Car, DollarSign,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId, ShiftType } from "@/types/event";

export interface PresetDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  /** Hex used for tinted chip background + text */
  color: string;
  category: CategoryId;
  shiftType?: ShiftType;
  allDay?: boolean;
  /** Default times when allDay is false. HH:mm. */
  startTime?: string;
  endTime?: string;
  /** Whether `endTime` wraps to the next day */
  overnight?: boolean;
  iconName?: string;
  isPayday?: boolean;
  defaultTitle: string;
}

export const PRESETS: PresetDef[] = [
  {
    id: "morning",
    label: "Morning",
    Icon: Sun,
    color: "#F59E0B",
    category: "work",
    shiftType: "morning",
    startTime: "06:00",
    endTime: "14:00",
    iconName: "Sun",
    defaultTitle: "Morning shift",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    Icon: Sunset,
    color: "#F97316",
    category: "work",
    shiftType: "afternoon",
    startTime: "14:00",
    endTime: "22:00",
    iconName: "Sunset",
    defaultTitle: "Afternoon shift",
  },
  {
    id: "night",
    label: "Night",
    Icon: Moon,
    color: "#6366F1",
    category: "work",
    shiftType: "night",
    startTime: "22:00",
    endTime: "06:00",
    overnight: true,
    iconName: "Moon",
    defaultTitle: "Night shift",
  },
  {
    id: "oncall",
    label: "On-Call",
    Icon: Radio,
    color: "#14B8A6",
    category: "work",
    shiftType: "oncall",
    allDay: true,
    iconName: "Radio",
    defaultTitle: "On-call",
  },
  {
    id: "split",
    label: "Split Shift",
    Icon: GitBranch,
    color: "#A855F7",
    category: "work",
    shiftType: "split",
    startTime: "06:00",
    endTime: "20:00",
    iconName: "GitBranch",
    defaultTitle: "Split shift",
  },
  {
    id: "sick",
    label: "Sick Leave",
    Icon: Thermometer,
    color: "#EF4444",
    category: "work",
    allDay: true,
    iconName: "Thermometer",
    defaultTitle: "Sick leave",
  },
  {
    id: "annual",
    label: "Annual Leave",
    Icon: Umbrella,
    color: "#0EA5E9",
    category: "work",
    allDay: true,
    iconName: "Umbrella",
    defaultTitle: "Annual leave",
  },
  {
    id: "travel",
    label: "Travel",
    Icon: Car,
    color: "#64748B",
    category: "travel",
    startTime: "08:00",
    endTime: "09:00",
    iconName: "Car",
    defaultTitle: "Travel",
  },
  {
    id: "payday",
    label: "Payday",
    Icon: DollarSign,
    color: "#D4A017",
    category: "work",
    allDay: true,
    iconName: "DollarSign",
    isPayday: true,
    defaultTitle: "Payday",
  },
];
