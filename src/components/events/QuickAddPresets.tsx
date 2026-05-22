import { SHIFT_CONFIG, type ShiftKey } from "@/lib/shiftConfig";
import type { LucideIcon } from "lucide-react";
import type { CategoryId, ShiftType } from "@/types/event";

export interface PresetDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  category: CategoryId;
  shiftType?: ShiftType;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  overnight?: boolean;
  iconName?: string;
  isPayday?: boolean;
  defaultTitle: string;
}

export const PRESETS: PresetDef[] = (Object.keys(SHIFT_CONFIG) as ShiftKey[]).map((key) => {
  const c = SHIFT_CONFIG[key];
  return {
    id: key,
    label: c.label,
    Icon: c.Icon,
    color: c.colour,
    category: c.category,
    shiftType: (key === "payday" ? undefined : (key as ShiftType)),
    allDay: c.isAllDay,
    startTime: c.defaultStart ?? undefined,
    endTime: c.defaultEnd ?? undefined,
    overnight: c.overnight,
    iconName: c.icon,
    isPayday: c.isPayday,
    defaultTitle: c.label,
  };
});

interface Props {
  onPick: (p: PresetDef) => void;
}

export function QuickAddPresets({ onPick }: Props) {
  return (
    <div className="-mx-1">
      <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick add
      </p>
      <div className="flex flex-wrap gap-2 px-1 pb-1">
        {PRESETS.map((p) => {
          const Icon = p.Icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p)}
              className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95"
              style={{
                backgroundColor: `${p.color}26`,
                color: p.color,
              }}
            >
              <Icon className="size-4" strokeWidth={2.5} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
