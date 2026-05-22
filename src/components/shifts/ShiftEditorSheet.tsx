import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconPicker, getIcon } from "@/components/events/IconPicker";
import { useShiftTemplates } from "@/providers/ShiftTemplatesProvider";
import type { ShiftTemplateDTO } from "@/lib/shift-templates.functions";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryId } from "@/types/event";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLOURS = [
  "#F59E0B", "#F97316", "#EF4444", "#EC4899", "#A855F7", "#6366F1",
  "#3B82F6", "#0EA5E9", "#14B8A6", "#10B981", "#22C55E", "#84CC16",
  "#FACC15", "#D4A017", "#64748B", "#94A3B8",
];

function diffMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let m = eh * 60 + em - (sh * 60 + sm);
  if (m <= 0) m += 24 * 60;
  return m;
}

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  template: ShiftTemplateDTO | null;
}

export function ShiftEditorSheet({ open, onOpenChange, template }: Props) {
  const { create, update } = useShiftTemplates();
  const [name, setName] = useState("");
  const [showAs, setShowAs] = useState("");
  const [colour, setColour] = useState(COLOURS[0]);
  const [iconName, setIconName] = useState<string | undefined>(undefined);
  const [lifeCategory, setLifeCategory] = useState<CategoryId>("work");
  const [isAllDay, setIsAllDay] = useState(false);
  const [is24Hour, setIs24Hour] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [splitStart2, setSplitStart2] = useState("18:00");
  const [splitEnd2, setSplitEnd2] = useState("21:00");
  const [unpaidBreak, setUnpaidBreak] = useState(0);
  const [paidBreak, setPaidBreak] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (template) {
      setName(template.name);
      setShowAs(template.showAs ?? "");
      setColour(template.colour);
      setIconName(template.iconName ?? undefined);
      setLifeCategory(template.lifeCategory);
      setIsAllDay(template.isAllDay);
      setIs24Hour(template.is24Hour);
      setIsSplit(template.isSplitShift);
      setStart(template.defaultStart?.slice(0, 5) ?? "09:00");
      setEnd(template.defaultEnd?.slice(0, 5) ?? "17:00");
      setSplitStart2(template.splitStart2?.slice(0, 5) ?? "18:00");
      setSplitEnd2(template.splitEnd2?.slice(0, 5) ?? "21:00");
      setUnpaidBreak(template.unpaidBreakMinutes);
      setPaidBreak(template.paidBreakMinutes);
    } else {
      setName(""); setShowAs(""); setColour(COLOURS[0]); setIconName(undefined);
      setLifeCategory("work"); setIsAllDay(false); setIs24Hour(false); setIsSplit(false);
      setStart("09:00"); setEnd("17:00"); setSplitStart2("18:00"); setSplitEnd2("21:00");
      setUnpaidBreak(0); setPaidBreak(0);
    }
  }, [open, template]);

  const summary = useMemo(() => {
    let total = 0;
    if (is24Hour || isAllDay) {
      total = 24 * 60;
    } else {
      total += diffMinutes(start, end);
      if (isSplit) total += diffMinutes(splitStart2, splitEnd2);
    }
    const paid = Math.max(0, total - unpaidBreak);
    return { total, paid, unpaid: unpaidBreak };
  }, [is24Hour, isAllDay, isSplit, start, end, splitStart2, splitEnd2, unpaidBreak]);

  const Icon = getIcon(iconName) ?? Sparkles;

  // Map life category → grouping bucket on /shifts screen
  const grouping: ShiftTemplateDTO["category"] = useMemo(() => {
    if (lifeCategory === "rest") return "non_working";
    return "working";
  }, [lifeCategory]);

  const onSave = async () => {
    if (!name.trim()) { toast("Shift name is required"); return; }
    setSaving(true);
    try {
      const payload: Omit<ShiftTemplateDTO, "id" | "sortOrder" | "totalHours"> & { sortOrder?: number } = {
        name: name.trim(),
        showAs: showAs.trim() || null,
        colour,
        iconName: iconName ?? null,
        defaultStart: is24Hour || isAllDay ? null : start,
        defaultEnd: is24Hour || isAllDay ? null : end,
        category: grouping,
        lifeCategory,
        isAllDay,
        isSplitShift: isSplit,
        is24Hour,
        unpaidBreakMinutes: unpaidBreak,
        paidBreakMinutes: paidBreak,
        splitStart2: isSplit ? splitStart2 : null,
        splitEnd2: isSplit ? splitEnd2 : null,
        isActive: true,
        baseType: null,
      };
      if (template) {
        await update(template.id, payload);
      } else {
        await create(payload as unknown as Omit<ShiftTemplateDTO, "id" | "sortOrder"> & { sortOrder?: number });
      }
      onOpenChange(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{template ? "Edit shift template" : "New shift template"}</SheetTitle>
        </SheetHeader>

        {/* Live preview pill */}
        <div className="my-3 flex items-center justify-center">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white shadow-sm"
            style={{ backgroundColor: colour }}
          >
            <Icon className="size-3.5" />
            <span className="text-xs font-semibold">{showAs.trim() || name.trim() || "Preview"}</span>
          </div>
        </div>

        <div className="space-y-4 pb-2">
          {/* 1. Shift name */}
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label>Shift name</Label><span className="text-[10px] text-muted-foreground">{name.length}/20</span></div>
            <Input value={name} maxLength={20} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="e.g. Long Day, Night Float, Ward Round" />
          </div>

          {/* 2. Show as */}
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label>Show as</Label><span className="text-[10px] text-muted-foreground">{showAs.length}/6</span></div>
            <Input value={showAs} maxLength={6} onChange={(e) => setShowAs(e.target.value.slice(0, 6))} placeholder="e.g. LD, NF, AM" />
            <p className="text-[11px] text-muted-foreground">This short label appears on your calendar.</p>
          </div>

          {/* 3. Colour */}
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <div className="grid grid-cols-8 gap-2">
              {COLOURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(c)}
                  aria-label={c}
                  className={cn(
                    "h-9 rounded-lg transition-transform",
                    colour === c && "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 4. Icon */}
          <IconPicker value={iconName} gradient="ocean" onChange={(n) => setIconName(n)} />

          {/* 5. Type / category */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={lifeCategory} onValueChange={(v) => setLifeCategory(v as CategoryId)}>
              <SelectTrigger>
                <SelectValue>
                  {(() => {
                    const cat = CATEGORIES.find((c) => c.id === lifeCategory)!;
                    return (
                      <span className="flex items-center gap-2">
                        <cat.icon size={16} className={cat.textClass} /> {cat.label}
                      </span>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <c.icon size={16} className={c.textClass} /> {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 6. All-day */}
          <ToggleRow id="allday" label="All day" checked={isAllDay} onChange={(v) => { setIsAllDay(v); if (v) setIs24Hour(false); }} />

          {/* 7. Start / End times */}
          {!isAllDay && !is24Hour && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">Total: {fmt(diffMinutes(start, end))}</p>
            </div>
          )}

          {/* 8. Is split shift */}
          {!isAllDay && !is24Hour && (
            <ToggleRow id="split" label="Is split shift" checked={isSplit} onChange={setIsSplit} />
          )}
          {isSplit && !isAllDay && !is24Hour && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              <div className="space-y-1.5">
                <Label>2nd start</Label>
                <Input type="time" value={splitStart2} onChange={(e) => setSplitStart2(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>2nd end</Label>
                <Input type="time" value={splitEnd2} onChange={(e) => setSplitEnd2(e.target.value)} />
              </div>
            </div>
          )}

          {/* 9. 24-hour */}
          <ToggleRow id="h24" label="Is 24-hour shift" checked={is24Hour} onChange={(v) => { setIs24Hour(v); if (v) setIsAllDay(false); }} />

          {/* 10. Unpaid break */}
          <div className="space-y-1.5">
            <Label>Unpaid break (minutes)</Label>
            <Input type="number" min={0} value={unpaidBreak} onChange={(e) => setUnpaidBreak(Math.max(0, Number(e.target.value) || 0))} />
            <p className="text-[11px] text-muted-foreground">Unpaid breaks are deducted from total hours.</p>
          </div>

          {/* 11. Paid break */}
          <div className="space-y-1.5">
            <Label>Paid break (minutes)</Label>
            <Input type="number" min={0} value={paidBreak} onChange={(e) => setPaidBreak(Math.max(0, Number(e.target.value) || 0))} />
            <p className="text-[11px] text-muted-foreground">Paid breaks are included in total hours.</p>
          </div>

          {/* 12. Live summary */}
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Shift duration</span><span className="font-semibold">{fmt(summary.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid time</span><span className="font-semibold">{fmt(summary.paid)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Unpaid break</span><span className="font-semibold">{summary.unpaid}m</span></div>
          </div>

          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary to-primary/70 text-primary-foreground"
          >
            {saving ? "Saving…" : "Save Shift Template"}
          </Button>
          <button type="button" onClick={() => onOpenChange(false)} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-2.5">
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}