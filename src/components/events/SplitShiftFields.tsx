import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SplitShiftMeta } from "@/types/event";

const BREAKS = [
  { v: 30, label: "30 min" },
  { v: 45, label: "45 min" },
  { v: 60, label: "1 hour" },
  { v: 90, label: "1.5 hours" },
  { v: 120, label: "2 hours" },
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

function gt(a: string, b: string) {
  return a > b; // "HH:mm" lexicographic compare works
}

export function SplitShiftFields({ value, onChange }: Props) {
  const set = (patch: Partial<SplitShiftMeta>) => onChange({ ...value, ...patch });

  const firstEndError =
    value.firstStart && value.firstEnd && !gt(value.firstEnd, value.firstStart)
      ? "First shift end must be after first shift start"
      : null;
  const secondStartError =
    value.firstEnd && value.secondStart && !gt(value.secondStart, value.firstEnd)
      ? "Second shift start must be after first shift end"
      : null;
  const secondEndError =
    value.secondStart && value.secondEnd && !gt(value.secondEnd, value.secondStart)
      ? "Second shift end must be after second shift start"
      : null;

  return (
    <div className="mt-3 space-y-4 rounded-lg border border-cat-work/40 bg-cat-work/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-cat-work">
        Split shift details
      </p>

      <div className="space-y-2 mx-0 my-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">First shift</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">First shift start</Label>
            <Input type="time" value={value.firstStart} onChange={(e) => set({ firstStart: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">First shift end</Label>
            <Input type="time" value={value.firstEnd} onChange={(e) => set({ firstEnd: e.target.value })} />
            {firstEndError && <p className="text-[11px] text-destructive">{firstEndError}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Break duration</Label>
        <Select value={String(value.breakMinutes)} onValueChange={(v) => set({ breakMinutes: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {BREAKS.map((b) => (
              <SelectItem key={b.v} value={String(b.v)}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 mx-0 my-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Second shift</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Second shift start</Label>
            <Input type="time" value={value.secondStart} onChange={(e) => set({ secondStart: e.target.value })} />
            {secondStartError && <p className="text-[11px] text-destructive">{secondStartError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Second shift end</Label>
            <Input type="time" value={value.secondEnd} onChange={(e) => set({ secondEnd: e.target.value })} />
            {secondEndError && <p className="text-[11px] text-destructive">{secondEndError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
