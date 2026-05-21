import type { LucideIcon } from "lucide-react";
import type { CalendarEvent, GradientId } from "@/types/event";
import { getCategory } from "@/lib/categories";
import { getIcon } from "@/components/events/IconPicker";
import { getGradient, type GradientDef } from "@/lib/gradients";

export interface EventIcon {
  Icon: LucideIcon;
  gradient: GradientDef;
  custom: boolean;
}

export function getEventIcon(event: CalendarEvent): EventIcon {
  const custom = getIcon(event.iconName);
  if (custom) {
    return { Icon: custom, gradient: getGradient(event.iconGradient), custom: true };
  }
  const cat = getCategory(event.category);
  return { Icon: cat.icon, gradient: getGradient(defaultGradientForCategory(event.category)), custom: false };
}

function defaultGradientForCategory(id: string): GradientId {
  switch (id) {
    case "work": return "ocean";
    case "rest": return "lavender";
    case "wellness": return "coral";
    case "exercise": return "sunrise";
    case "social": return "forest";
    case "family": return "coral";
    case "travel": return "slate";
    default: return "slate";
  }
}
