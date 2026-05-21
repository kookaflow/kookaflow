import {
  Briefcase,
  Moon,
  Heart,
  Dumbbell,
  Users,
  Home,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/types/event";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
  fgClass: string;
  borderClass: string;
  dotClass: string;
  cssVar: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "work", label: "Work / Shifts", icon: Briefcase, bgClass: "bg-cat-work", textClass: "text-cat-work", fgClass: "text-cat-work-foreground", borderClass: "border-cat-work", dotClass: "bg-cat-work", cssVar: "var(--cat-work)" },
  { id: "rest", label: "Rest / Sleep", icon: Moon, bgClass: "bg-cat-rest", textClass: "text-cat-rest", fgClass: "text-cat-rest-foreground", borderClass: "border-cat-rest", dotClass: "bg-cat-rest", cssVar: "var(--cat-rest)" },
  { id: "wellness", label: "Wellness", icon: Heart, bgClass: "bg-cat-wellness", textClass: "text-cat-wellness", fgClass: "text-cat-wellness-foreground", borderClass: "border-cat-wellness", dotClass: "bg-cat-wellness", cssVar: "var(--cat-wellness)" },
  { id: "exercise", label: "Exercise", icon: Dumbbell, bgClass: "bg-cat-exercise", textClass: "text-cat-exercise", fgClass: "text-cat-exercise-foreground", borderClass: "border-cat-exercise", dotClass: "bg-cat-exercise", cssVar: "var(--cat-exercise)" },
  { id: "social", label: "Social", icon: Users, bgClass: "bg-cat-social", textClass: "text-cat-social", fgClass: "text-cat-social-foreground", borderClass: "border-cat-social", dotClass: "bg-cat-social", cssVar: "var(--cat-social)" },
  { id: "family", label: "Family", icon: Home, bgClass: "bg-cat-family", textClass: "text-cat-family", fgClass: "text-cat-family-foreground", borderClass: "border-cat-family", dotClass: "bg-cat-family", cssVar: "var(--cat-family)" },
  { id: "personal", label: "Personal", icon: Sparkles, bgClass: "bg-cat-personal", textClass: "text-cat-personal", fgClass: "text-cat-personal-foreground", borderClass: "border-cat-personal", dotClass: "bg-cat-personal", cssVar: "var(--cat-personal)" },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryDef>,
);

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORY_MAP[id];
}