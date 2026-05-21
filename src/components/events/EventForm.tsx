import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { toInputDateTime, fromInputDateTime } from "@/lib/date";
import { ShiftFieldsGroup } from "./ShiftFieldsGroup";
import { QuickAddPresets } from "./QuickAddPresets";
import { IconPicker } from "./IconPicker";
import type { PresetDef } from "./presets";
import type {
  CalendarEvent,
  EventDraft,
  CategoryId,
  ShiftMeta,
  GradientId,
  RecurrencePattern,
} from "@/types/event";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  initial?: CalendarEvent;
  defaultStart?: Date;
  onSubmit: (draft: EventDraft) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function blankShift(): ShiftMeta {
  return { shiftType: "morning", role: "", location: "" };
}

function setTimeOnDate(base: Date, hhmm: string, addDays = 0): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setDate(d.getDate() + addDays);
  d.setHours(h, m, 0, 0);
  return d;
}

export function EventForm({ initial, defaultStart, onSubmit, onDelete, onCancel }: Props) {
  const start0 = initial?.start ?? (defaultStart ?? new Date()).toISOString();
  const end0 = initial?.end ?? new Date(new Date(start0).getTime() + 60 * 60 * 1000).toISOString();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? "personal");
  const [start, setStart] = useState(toInputDateTime(start0));
  const [end, setEnd] = useState(toInputDateTime(end0));
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [iconName, setIconName] = useState<string | undefined>(initial?.iconName);
  const [iconGradient, setIconGradient] = useState<GradientId | undefined>(initial?.iconGradient);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [shift, setShift] = useState<ShiftMeta>(initial?.shift ?? blankShift());
  const [isPayday, setIsPayday] = useState(initial?.isPayday ?? false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(
    (initial?.recurrencePattern as RecurrencePattern | null) ?? null,
  );
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>(
    initial?.recurrenceDays ?? [],
  );

  useEffect(() => {
    if (new Date(end) < new Date(start)) setEnd(start);
  }, [start, end]);

  const cat = getCategory(category);

  const applyPreset = (p: PresetDef) => {
    if (!title.trim()) setTitle(p.defaultTitle);
    setCategory(p.category);
    setAllDay(!!p.allDay);
    if (p.iconName) {
      setIconName(p.iconName);
      if (!iconGradient) setIconGradient("ocean");
    }
    setIsPayday(!!p.isPayday);
    if (p.category === "work") {
      setShift((s) => ({ ...s, shiftType: p.shiftType ?? s.shiftType }));
    }
    if (!p.allDay && p.startTime && p.endTime) {
      const base = new Date(start);
      const ns = setTimeOnDate(base, p.startTime);
      const ne = setTimeOnDate(base, p.endTime, p.overnight ? 1 : 0);
      setStart(toInputDateTime(ns.toISOString()));
      setEnd(toInputDateTime(ne.toISOString()));
    }
  };

  const submit = () => {
    if (!title.trim()) return;
    const draft: EventDraft = {
      title: title.trim(),
      category,
      start: fromInputDateTime(start),
      end: fromInputDateTime(end),
      allDay,
      iconName: iconName || undefined,
      iconGradient: iconName ? (iconGradient ?? "ocean") : undefined,
      notes: notes || undefined,
      shift: category === "work" ? shift : undefined,
      isPayday: category === "work" ? isPayday : false,
      recurrencePattern,
      recurrenceDays: recurrencePattern === "custom" ? recurrenceDays : null,
      recurrenceEndDate: null,
    };
    onSubmit(draft);
  };

  return (
    <div className="space-y-4">
      <QuickAddPresets onPick={applyPreset} />

      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's happening?" autoFocus />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
          <SelectTrigger>
            <SelectValue>
              <span className="flex items-center gap-2">
                <span className={`size-3 rounded-full ${cat.dotClass}`} />
                {cat.label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span className={`size-3 rounded-full ${c.dotClass}`} />
                  {c.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-2.5">
        <Label htmlFor="allday" className="cursor-pointer text-sm font-normal">All-day event</Label>
        <Switch id="allday" checked={allDay} onCheckedChange={setAllDay} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Starts</Label>
          <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Ends</Label>
          <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <IconPicker
        value={iconName}
        gradient={iconGradient}
        onChange={(name, g) => {
          setIconName(name);
          setIconGradient(g);
        }}
      />

      {category === "work" && (
        <>
          <ShiftFieldsGroup value={shift} onChange={setShift} />
          <div className="flex items-center justify-between rounded-md border border-border p-2.5">
            <Label htmlFor="payday" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
              <span>💰</span> Payday
            </Label>
            <Switch id="payday" checked={isPayday} onCheckedChange={setIsPayday} />
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes" />
      </div>

      <RecurrenceBlock
        pattern={recurrencePattern}
        days={recurrenceDays}
        onPatternChange={setRecurrencePattern}
        onDaysChange={setRecurrenceDays}
      />

      <div className="flex items-center justify-between gap-2 pt-2">
        <div>
          {onDelete && (
            <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="gap-1.5 text-destructive">
              <Trash2 className="size-4" /> Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={submit}>{initial ? "Save" : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function RecurrenceBlock({
  pattern,
  days,
  onPatternChange,
  onDaysChange,
}: {
  pattern: RecurrencePattern | null;
  days: string[];
  onPatternChange: (p: RecurrencePattern | null) => void;
  onDaysChange: (d: string[]) => void;
}) {
  const isOn = pattern !== null;
  const toggleDay = (key: string) => {
    if (days.includes(key)) {
      onDaysChange(days.filter((d) => d !== key));
    } else {
      onDaysChange([...days, key]);
    }
  };
  return (
    <div className="space-y-3 rounded-md border border-border p-2.5">
      <div className="flex items-center justify-between">
        <Label className="cursor-pointer text-sm font-normal">Recurring</Label>
        <Switch
          checked={isOn}
          onCheckedChange={(v) => onPatternChange(v ? "weekly" : null)}
        />
      </div>
      {isOn && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {(["daily", "weekly", "fortnightly", "custom"] as RecurrencePattern[]).map(
              (k) => {
                const active = pattern === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onPatternChange(k)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-foreground/30",
                    )}
                  >
                    {k}
                  </button>
                );
              },
            )}
          </div>
          {pattern === "custom" && (
            <div className="flex gap-1">
              {WEEKDAY_LABELS.map((label, i) => {
                const key = WEEKDAY_KEYS[i];
                const active = days.includes(key);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-foreground/30",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
