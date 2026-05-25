import { useMemo } from "react";
import { type LucideIcon, Sparkles } from "lucide-react";
import { SHIFT_CONFIG, type ShiftKey } from "@/lib/shiftConfig";
import { useShiftTemplates } from "@/providers/ShiftTemplatesProvider";
import { getIcon } from "@/components/events/IconPicker";
import type { CategoryId } from "@/types/event";

export interface ShiftOption {
  id: string;
  /** "system" maps to SHIFT_CONFIG; "custom" is a user shift_templates row. */
  kind: "system" | "custom";
  /** Original system key, when kind === "system". */
  systemKey?: ShiftKey;
  /** Original shift_templates row id, when kind === "custom". */
  templateId?: string;
  label: string;
  shortLabel: string;
  colour: string;
  Icon: LucideIcon;
  iconName?: string;
  category: CategoryId;
  defaultStart: string | null;
  defaultEnd: string | null;
  isAllDay: boolean;
  overnight?: boolean;
  isPayday?: boolean;
}

/**
 * Single source of truth for the shift list shown in both the Quick-Add
 * stamp panel and the Add-Event modal. Returns system shifts (from
 * SHIFT_CONFIG) plus the current user's custom shift_templates.
 */
export function useAllShiftTypes(): { system: ShiftOption[]; custom: ShiftOption[]; all: ShiftOption[] } {
  const { templates } = useShiftTemplates();

  return useMemo(() => {
    const system: ShiftOption[] = (Object.keys(SHIFT_CONFIG) as ShiftKey[]).map((key) => {
      const c = SHIFT_CONFIG[key];
      return {
        id: `sys_${key}`,
        kind: "system",
        systemKey: key,
        label: c.label,
        shortLabel: c.shortLabel,
        colour: c.colour,
        Icon: c.Icon,
        iconName: c.icon,
        category: c.category,
        defaultStart: c.defaultStart,
        defaultEnd: c.defaultEnd,
        isAllDay: c.isAllDay,
        overnight: c.overnight,
        isPayday: c.isPayday,
      };
    });

    const custom: ShiftOption[] = templates.map((t) => ({
      id: `tpl_${t.id}`,
      kind: "custom",
      templateId: t.id,
      label: t.name,
      shortLabel: t.name.slice(0, 8),
      colour: t.colour,
      Icon: getIcon(t.iconName) ?? Sparkles,
      iconName: t.iconName ?? undefined,
      category:
        t.category === "leave"
          ? "work"
          : t.category === "non_working"
            ? "rest"
            : "work",
      defaultStart: t.defaultStart,
      defaultEnd: t.defaultEnd,
      isAllDay: !t.defaultStart || !t.defaultEnd,
    }));

    return { system, custom, all: [...system, ...custom] };
  }, [templates]);
}