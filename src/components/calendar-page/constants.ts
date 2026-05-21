import {
  Briefcase,
  Moon,
  Heart,
  Dumbbell,
  Users,
  Home,
  Sparkles,
  Sunrise,
  Sun,
  Coffee,
  Music,
  Book,
  Plane,
  Utensils,
  Bike,
  Leaf,
  Star,
  Bell,
  Camera,
  Smile,
  Zap,
  Clock,
  PhoneCall,
  Car,
  GitBranch,
  Thermometer,
  Umbrella,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "work"
  | "rest"
  | "wellness"
  | "exercise"
  | "social"
  | "family"
  | "personal"
  | "travel";

export type ShiftType =
  | "morning"
  | "afternoon"
  | "night"
  | "oncall"
  | "split"
  | "side_hustle"
  | "sick_leave"
  | "annual_leave"
  | "custom";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  color: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "work", label: "Work", color: "#3B82F6", icon: Briefcase },
  { id: "rest", label: "Rest", color: "#8B5CF6", icon: Moon },
  { id: "wellness", label: "Wellness", color: "#EC4899", icon: Heart },
  { id: "exercise", label: "Exercise", color: "#F59E0B", icon: Dumbbell },
  { id: "social", label: "Social", color: "#10B981", icon: Users },
  { id: "family", label: "Family", color: "#EF4444", icon: Home },
  { id: "personal", label: "Personal", color: "#6B7280", icon: Sparkles },
  { id: "travel", label: "Travel", color: "#64748B", icon: Car },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryDef>,
);

export interface ShiftStyle {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const SHIFT_STYLES: Record<ShiftType, ShiftStyle> = {
  morning: { label: "Morning", color: "#F59E0B", icon: Sunrise },
  afternoon: { label: "Afternoon", color: "#3B82F6", icon: Sun },
  night: { label: "Night", color: "#6366F1", icon: Moon },
  oncall: { label: "On-Call", color: "#8B5CF6", icon: PhoneCall },
  split: { label: "Split", color: "#A855F7", icon: GitBranch },
  sick_leave: { label: "Sick Leave", color: "#EF4444", icon: Thermometer },
  annual_leave: { label: "Annual Leave", color: "#0EA5E9", icon: Umbrella },
  custom: { label: "Other", color: "#64748B", icon: MoreHorizontal },
};

export interface MockEvent {
  id: string;
  title: string;
  category: CategoryId;
  start: Date;
  end: Date;
  shiftType?: ShiftType;
  location?: string;
  notes?: string;
  iconName?: IconName;
  recurrence?: Recurrence;
}

export type Recurrence =
  | { kind: "none" }
  | { kind: "daily" }
  | { kind: "weekly" }
  | { kind: "fortnightly" }
  | { kind: "custom"; days: number[] }; // 0=Sun..6=Sat

export const ICON_OPTIONS = [
  { name: "Briefcase", icon: Briefcase },
  { name: "Heart", icon: Heart },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Users", icon: Users },
  { name: "Home", icon: Home },
  { name: "Coffee", icon: Coffee },
  { name: "Moon", icon: Moon },
  { name: "Sun", icon: Sun },
  { name: "Music", icon: Music },
  { name: "Book", icon: Book },
  { name: "Plane", icon: Plane },
  { name: "Utensils", icon: Utensils },
  { name: "Bike", icon: Bike },
  { name: "Leaf", icon: Leaf },
  { name: "Star", icon: Star },
  { name: "Bell", icon: Bell },
  { name: "Camera", icon: Camera },
  { name: "Smile", icon: Smile },
  { name: "Zap", icon: Zap },
  { name: "Clock", icon: Clock },
] as const;

export type IconName = (typeof ICON_OPTIONS)[number]["name"];

export const ICON_MAP: Record<IconName, LucideIcon> = ICON_OPTIONS.reduce(
  (acc, o) => {
    acc[o.name] = o.icon;
    return acc;
  },
  {} as Record<IconName, LucideIcon>,
);