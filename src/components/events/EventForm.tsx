import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LIST, getCategoryConfig } from "@/lib/shiftConfig";
import { toInputDateTime, fromInputDateTime } from "@/lib/date";
import { ShiftFieldsGroup } from "./ShiftFieldsGroup";
import { QuickAddPresets, type PresetDef } from "./QuickAddPresets";
import { IconPicker } from "./IconPicker";
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
import type { ShiftOption } from "@/hooks/useAllShiftTypes";

interface Props {
  initial?: CalendarEvent;
  defaultStart?: Date;
  defaultCategory?: CategoryId;
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

function defaultStartFor(base: Date | undefined): Date {
  const now = new Date();
  const d = new Date(base ?? now);
  d.setHours(now.getHours() + 1, 0, 0, 0);
  return d;
}

export function EventForm({ initial, defaultStart, defaultCategory, onSubmit, onDelete, onCancel }: Props) {
  const start0 = initial?.start ?? defaultStartFor(defaultStart).toISOString();
  const end0 =
    initial?.end ??
    new Date(new Date(start0).getTime() + 8 * 60 * 60 * 1000).toISOString();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? defaultCategory ?? "work");
  const [start, setStart] = useState(toInputDateTime(start0));
  const [end, setEnd] = useState(toInputDateTime(end0));
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [iconName, setIconName] = useState<string | undefined>(initial?.iconName);
  const [iconGradient, setIconGradient] = useState<GradientId | undefined>(initial?.iconGradient);
  const [iconColor, setIconColor] = useState<string | undefined>(initial?.iconColor);
  const [customTemplateId, setCustomTemplateId] = useState<string | null>(null);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [shift, setShift] = useState<ShiftMeta>(initial?.shift ?? blankShift());
  const [isPayday, setIsPayday] = useState(initial?.isPayday ?? false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(
    (initial?.recurrencePattern as RecurrencePattern | null) ?? null,
  );
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>(
    initial?.recurrenceDays ?? [],
  );

  const cat = getCategoryConfig(category);
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  // Only block when start === end. end < start is treated as an overnight
  // shift and the end date is bumped to the next day on submit.
  const invalidRange = endMs === startMs;
  const isOvernight = endMs < startMs;

  const startDate = start.slice(0, 10);
  const startTime = start.slice(11, 16);
  const endDate = end.slice(0, 10);
  const endTime = end.slice(11, 16);
  const dtInputCls =
    "h-12 w-full rounded-[12px] bg-[#F1F5F9] px-3 text-base text-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-[#1A2456] dark:text-[#F0F4FF] dark:border dark:border-[#3D3DA0] [&::-webkit-calendar-picker-indicator]:dark:invert";

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
      const overnight = p.overnight || p.endTime <= p.startTime;
      const ne = setTimeOnDate(base, p.endTime, overnight ? 1 : 0);
      setStart(toInputDateTime(ns.toISOString()));
      setEnd(toInputDateTime(ne.toISOString()));
    }
  };

  const submit = () => {
    if (!title.trim()) return;
    if (invalidRange) return;
    // Auto-promote overnight shifts: if end < start, push end to next day.
    let endISO = fromInputDateTime(end);
    if (isOvernight) {
      const d = new Date(end);
      d.setDate(d.getDate() + 1);
      endISO = d.toISOString();
    }
    const draft: EventDraft = {
      title: title.trim(),
      category,
      start: fromInputDateTime(start),
      end: endISO,
      allDay,
      iconName: iconName || undefined,
      iconGradient: iconName && !iconColor ? (iconGradient ?? "ocean") : undefined,
      iconColor: iconColor || undefined,
      notes: notes || undefined,
      shift: category === "work" ? shift : undefined,
      isPayday: category === "work" ? isPayday : false,
      recurrencePattern,
      recurrenceDays: recurrencePattern === "custom" ? recurrenceDays : null,
      recurrenceEndDate: null,
    };
    onSubmit(draft);
  };

  const applyCustomTemplate = (t: ShiftOption) => {
    if (!title.trim()) setTitle(t.label);
    setCategory(t.category);
    setAllDay(t.isAllDay);
    setIconName(t.iconName);
    setIconColor(t.colour);
    setCustomTemplateId(t.templateId ?? null);
    // Custom template → no system shiftType; keep shiftRole = template label
    setShift({ shiftType: "custom", role: "", location: "", customLabel: t.label });
    if (!t.isAllDay && t.defaultStart && t.defaultEnd) {
      const base = new Date(start);
      const ns = setTimeOnDate(base, t.defaultStart);
      const overnight = t.defaultEnd <= t.defaultStart;
      const ne = setTimeOnDate(base, t.defaultEnd, overnight ? 1 : 0);
      setStart(toInputDateTime(ns.toISOString()));
      setEnd(toInputDateTime(ne.toISOString()));
    }
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
                <span className="size-3 rounded-full" style={{ backgroundColor: cat.colour }} />
                {cat.label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_LIST.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: c.colour }} />
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

      <div className="space-y-1.5">
        <Label>Starts</Label>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStart(`${e.target.value}T${startTime}`)}
            className={cn(dtInputCls, "basis-3/5")}
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStart(`${startDate}T${e.target.value}`)}
            className={cn(dtInputCls, "basis-2/5")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Ends</Label>
        <div className="flex gap-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEnd(`${e.target.value}T${endTime}`)}
            className={cn(dtInputCls, "basis-3/5")}
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEnd(`${endDate}T${e.target.value}`)}
            className={cn(dtInputCls, "basis-2/5")}
          />
        </div>
        {invalidRange && (
          <p className="text-xs text-destructive">Start and end time cannot be the same</p>
        )}
        {!invalidRange && isOvernight && (
          <p className="text-xs text-muted-foreground">🌙 Ends next day</p>
        )}
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
          <ShiftFieldsGroup
            value={shift}
            onChange={(s) => {
              setShift(s);
              // Picking any system shift type clears the custom template marker.
              if (s.shiftType !== "custom") {
                setCustomTemplateId(null);
                setIconColor(undefined);
              }
            }}
            onPickTemplate={applyCustomTemplate}
            selectedTemplateId={customTemplateId}
          />
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
          <Button type="button" onClick={submit} disabled={invalidRange}>
            {initial ? "Save" : "Create"}
          </Button>
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
