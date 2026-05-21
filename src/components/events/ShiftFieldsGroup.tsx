import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Sun, Sunset, Moon, Radio, GitBranch, Thermometer, Umbrella, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { ShiftMeta, ShiftType } from "@/types/event";
import { SplitShiftFields, DEFAULT_SPLIT } from "./SplitShiftFields";

interface Props {
  value: ShiftMeta;
  onChange: (next: ShiftMeta) => void;
}

const TYPES: { value: ShiftType; label: string; Icon: LucideIcon; color: string }[] = [
  { value: "morning", label: "Morning (AM)", Icon: Sun, color: "#F59E0B" },
  { value: "afternoon", label: "Afternoon (PM)", Icon: Sunset, color: "#F97316" },
  { value: "night", label: "Night", Icon: Moon, color: "#6366F1" },
  { value: "oncall", label: "On-Call", Icon: Radio, color: "#14B8A6" },
  { value: "split", label: "Split Shift", Icon: GitBranch, color: "#A855F7" },
  { value: "sick_leave", label: "Sick Leave", Icon: Thermometer, color: "#EF4444" },
  { value: "annual_leave", label: "Annual Leave", Icon: Umbrella, color: "#0EA5E9" },
  { value: "custom", label: "Other", Icon: MoreHorizontal, color: "#64748B" },
];

export function ShiftFieldsGroup({ value, onChange }: Props) {
  const isSplit = value.shiftType === "split";
  const isCustom = value.shiftType === "custom";
  return (
    <div className="space-y-3 rounded-lg border border-cat-work/40 bg-cat-work/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-cat-work">Shift details</p>

      <div className="space-y-1.5">
        <Label>Shift type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPES.map((t) => {
            const selected = value.shiftType === t.value;
            const Icon = t.Icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ ...value, shiftType: t.value })}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-all",
                  "hover:border-foreground/30 active:scale-[0.98]",
                  selected
                    ? "border-transparent bg-background shadow-sm ring-2"
                    : "border-border bg-background/50",
                )}
                style={selected ? { boxShadow: `0 0 0 2px ${t.color}` } : undefined}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: t.color }}
                >
                  <Icon className="size-4" strokeWidth={2.25} />
                </span>
                <span className="truncate text-xs font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isSplit ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {isSplit && (
            <SplitShiftFields
              value={value.split ?? DEFAULT_SPLIT}
              onChange={(split) => onChange({ ...value, split })}
            />
          )}
        </div>
      </div>

      {isCustom && (
        <div className="space-y-1.5">
          <Label>Custom shift name</Label>
          <Input
            value={value.customLabel ?? ""}
            onChange={(e) => onChange({ ...value, customLabel: e.target.value })}
            placeholder="e.g. Twilight, Weekend cover"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })} placeholder="e.g. RN" />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} placeholder="e.g. Ward 4B" />
        </div>
      </div>
    </div>
  );
}