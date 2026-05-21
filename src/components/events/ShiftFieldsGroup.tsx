import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ShiftMeta, ShiftType } from "@/types/event";

interface Props {
  value: ShiftMeta;
  onChange: (next: ShiftMeta) => void;
}

const TYPES: { value: ShiftType; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
  { value: "rotating", label: "Rotating" },
];

export function ShiftFieldsGroup({ value, onChange }: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-cat-work/40 bg-cat-work/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-cat-work">Shift details</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Shift type</Label>
          <Select value={value.shiftType} onValueChange={(v) => onChange({ ...value, shiftType: v as ShiftType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })} placeholder="e.g. RN" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Location</Label>
          <Input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} placeholder="e.g. Ward 4B" />
        </div>
      </div>
    </div>
  );
}