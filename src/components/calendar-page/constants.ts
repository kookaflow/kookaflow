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
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "work"
  | "rest"
  | "wellness"
  | "exercise"
  | "social"
  | "family"
  | "personal";

export type ShiftType = "morning" | "afternoon" | "night" | "rotating";

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
  rotating: { label: "Rotating", color: "#8B5CF6", icon: Sparkles },
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
}