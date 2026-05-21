import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  ICON_OPTIONS,
  SHIFT_STYLES,
  type CategoryId,
  type IconName,
  type MockEvent,
  type Recurrence,
  type ShiftType,
} from "./constants";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: MockEvent | null;
  defaultDate: Date;
  onSave: (e: MockEvent) => void;
  onDelete?: (id: string) => void;
}

const SHIFT_TYPES: ShiftType[] = ["morning", "afternoon", "night", "oncall"];
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toTimeStr(d: Date) {
  return format(d, "HH:mm");
}
function mergeTime(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(h || 0, m || 0, 0, 0);
  return next;
}

export function EventDialog({
  open,
  onOpenChange,
  editing,
  defaultDate,
  onSave,
  onDelete,
}: Props) {
  const initial = useMemo<MockEvent>(() => {
    if (editing) return editing;
    const start = new Date(defaultDate);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    return {
      id: "",
      title: "",
      category: "personal",
      start,
      end,
      recurrence: { kind: "none" },
    };
  }, [editing, defaultDate, open]);

  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState<CategoryId>(initial.category);
  const [date, setDate] = useState<Date>(initial.start);
  const [startTime, setStartTime] = useState<string>(toTimeStr(initial.start));
  const [endTime, setEndTime] = useState<string>(toTimeStr(initial.end));
  const [shiftType, setShiftType] = useState<ShiftType>(
    initial.shiftType ?? "morning",
  );
  const [location, setLocation] = useState(initial.location ?? "");
  const [iconName, setIconName] = useState<IconName | undefined>(
    initial.iconName,
  );
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [recurrence, setRecurrence] = useState<Recurrence>(
    initial.recurrence ?? { kind: "none" },
  );

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setCategory(initial.category);
    setDate(initial.start);
    setStartTime(toTimeStr(initial.start));
    setEndTime(toTimeStr(initial.end));
    setShiftType(initial.shiftType ?? "morning");
    setLocation(initial.location ?? "");
    setIconName(initial.iconName);
    setNotes(initial.notes ?? "");
    setRecurrence(initial.recurrence ?? { kind: "none" });
  }, [open, initial]);

  const isRecurring = recurrence.kind !== "none";

  const handleSave = () => {
    if (!title.trim()) return;
    const start = mergeTime(date, startTime);
    const end = mergeTime(date, endTime);
    const ev: MockEvent = {
      id: editing?.id || `evt-${Date.now()}`,
      title: title.trim(),
      category,
      start,
      end: end > start ? end : new Date(start.getTime() + 60 * 60 * 1000),
      iconName,
      notes: notes.trim() || undefined,
      recurrence,
      ...(category === "work"
        ? { shiftType, location: location.trim() || undefined }
        : {}),
    };
    onSave(ev);
    onOpenChange(false);
  };

  const toggleCustomDay = (i: number) => {
    if (recurrence.kind !== "custom") return;
    const has = recurrence.days.includes(i);
    const days = has
      ? recurrence.days.filter((d) => d !== i)
      : [...recurrence.days, i].sort();
    setRecurrence({ kind: "custom", days });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-hidden p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit event" : "Add event"}
              </DialogTitle>
              <DialogDescription>
                Plan your time across work, rest, and the rest of life.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning shift"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                          active
                            ? "border-transparent text-white shadow-sm scale-105"
                            : "border-border bg-card hover:border-foreground/30",
                        )}
                        style={
                          active
                            ? { backgroundColor: c.color }
                            : { color: c.color }
                        }
                      >
                        <Icon className="size-3.5" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shift fields */}
              {category === "work" && (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-2">
                    <Label>Shift type</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {SHIFT_TYPES.map((st) => {
                        const style = SHIFT_STYLES[st];
                        const Icon = style.icon;
                        const active = shiftType === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setShiftType(st)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                              active
                                ? "border-transparent text-white shadow-sm"
                                : "border-border bg-card hover:border-foreground/30",
                            )}
                            style={
                              active
                                ? { backgroundColor: style.color }
                                : { color: style.color }
                            }
                          >
                            <Icon className="size-3.5" />
                            {style.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="location">Location / Role</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. RN — Ward 4B"
                    />
                  </div>
                </div>
              )}

              {/* Date + Times */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start gap-2 font-normal"
                      >
                        <CalendarIcon className="size-4" />
                        {format(date, "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="start">Start</Label>
                  <Input
                    id="start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="end">End</Label>
                  <Input
                    id="end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Icon */}
              <div className="flex flex-col gap-2">
                <Label>Icon label</Label>
                <div className="grid grid-cols-10 gap-1.5">
                  {ICON_OPTIONS.map((o) => {
                    const Icon = o.icon;
                    const active = iconName === o.name;
                    return (
                      <button
                        key={o.name}
                        type="button"
                        onClick={() =>
                          setIconName(active ? undefined : o.name)
                        }
                        title={o.name}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-md border transition-all",
                          active
                            ? "border-primary bg-primary/10 text-primary scale-110"
                            : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything to remember…"
                  rows={3}
                />
              </div>

              {/* Recurrence */}
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recurring" className="text-sm">
                      Recurring?
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Repeat this event on a schedule.
                    </p>
                  </div>
                  <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={(v) =>
                      setRecurrence(v ? { kind: "weekly" } : { kind: "none" })
                    }
                  />
                </div>
                {isRecurring && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-wrap gap-1.5">
                      {(["daily", "weekly", "fortnightly", "custom"] as const).map(
                        (k) => {
                          const active = recurrence.kind === k;
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() =>
                                setRecurrence(
                                  k === "custom"
                                    ? { kind: "custom", days: [] }
                                    : { kind: k },
                                )
                              }
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
                    {recurrence.kind === "custom" && (
                      <div className="flex gap-1">
                        {WEEK_DAYS.map((d, i) => {
                          const active = recurrence.days.includes(i);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleCustomDay(i)}
                              className={cn(
                                "flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card hover:border-foreground/30",
                              )}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:justify-between">
              <div>
                {editing && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onDelete(editing.id);
                      onOpenChange(false);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 size-4" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={!title.trim()}>
                  {editing ? "Save changes" : "Save event"}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}