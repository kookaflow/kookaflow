import { format } from "date-fns";
import { Link } from "@tanstack/react-router";
import { Clock3, Plus } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAllShiftTypes, type ShiftOption } from "@/hooks/useAllShiftTypes";
import { useEvents } from "@/providers/EventsProvider";
import { buildDraftFromStamp } from "@/providers/StampProvider";
import { overlapsExisting, shiftInitials, templateRange } from "@/lib/calendarAgenda";
import { badgeTextColour } from "@/lib/shiftConfig";
import type { ShiftType } from "@/types/event";
import type { MockEvent } from "./constants";

interface Props {
  day: Date | null;
  events: MockEvent[];
  onOpenChange: (open: boolean) => void;
  onCustomTimes: (day: Date) => void;
}

export function AddShiftSheet({ day, events, onOpenChange, onCustomTimes }: Props) {
  const { all } = useAllShiftTypes();
  const { createEvent } = useEvents();
  const options = all.filter((o) => !o.isPayday && o.systemKey !== "travel");

  const add = async (o: ShiftOption) => {
    if (!day) return;
    try {
      await createEvent(
        buildDraftFromStamp(
          {
            id: o.id, kind: "shift", label: o.label, shortLabel: o.shortLabel, colour: o.colour, Icon: o.Icon,
            shiftType: (o.systemKey ?? null) as ShiftType | null, category: o.category, allDay: o.isAllDay,
            startTime: o.defaultStart ?? undefined, endTime: o.defaultEnd ?? undefined,
            overnight: o.overnight, iconName: o.iconName,
          },
          day,
        ),
      );
      toast(`${o.label} added to ${format(day, "EEE d MMM")}`);
      onOpenChange(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't add shift");
    }
  };

  return (
    <Sheet open={!!day} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>Add shift</SheetTitle>
          <SheetDescription>{day ? format(day, "EEEE d MMMM") : ""} · tap a template to add it</SheetDescription>
        </SheetHeader>
        <ul className="mt-3 flex flex-col gap-1">
          {options.map((o) => {
            const range = day && o.defaultStart && o.defaultEnd ? templateRange(day, o.defaultStart, o.defaultEnd) : null;
            const overlaps = range ? overlapsExisting(events, range.start, range.end) : false;
            return (
              <li key={o.id}>
                <button type="button" onClick={() => add(o)} className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted">
                  <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-md px-1 text-[11px] font-bold" style={{ backgroundColor: o.colour, color: badgeTextColour(o.colour) }}>
                    {shiftInitials(o.label)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{o.label}</span>
                  {overlaps && <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Overlaps</span>}
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {range ? `${o.defaultStart}–${o.defaultEnd}` : "All day"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
          <button type="button" onClick={() => day && onCustomTimes(day)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-muted">
            <Clock3 className="size-4" /> Custom times for this day
          </button>
          <Link to="/shifts" onClick={() => onOpenChange(false)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-primary hover:bg-muted">
            <Plus className="size-4" /> New shift template
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
