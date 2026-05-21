import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SplitShiftMeta } from "@/types/event";

const BREAKS = [
  { v: 30, label: "30 min" },
  { v: 45, label: "45 min" },
  { v: 60, label: "1 hr" },
  { v: 90, label: "1.5 hr" },
  { v: 120, label: "2 hr" },
];

export const DEFAULT_SPLIT: SplitShiftMeta = {
  firstStart: "06:00",
  firstEnd: "10:00",
  breakMinutes: 60,
  secondStart: "16:00",
  secondEnd: "20:00",
};

interface Props {
  value: SplitShiftMeta;
  onChange: (next: SplitShiftMeta) => void;
}

export function SplitShiftFields({ value, onChange }: Props) {
  const set = (patch: Partial<SplitShiftMeta>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3 rounded-lg border border-cat-work/40 bg-cat-work/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-cat-work">
        Split shift
      </p>
      <div className="space-y-1.5">
        <Label className="text-xs">First shift</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="time" value={value.firstStart} onChange={(e) => set({ firstStart: e.target.value })} />
          <Input type="time" value={value.firstEnd} onChange={(e) => set({ firstEnd: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Break</Label>
        <Select value={String(value.breakMinutes)} onValueChange={(v) => set({ breakMinutes: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {BREAKS.map((b) => (
              <SelectItem key={b.v} value={String(b.v)}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Second shift</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="time" value={value.secondStart} onChange={(e) => set({ secondStart: e.target.value })} />
          <Input type="time" value={value.secondEnd} onChange={(e) => set({ secondEnd: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
