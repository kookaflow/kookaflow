import { Briefcase, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { CalendarEvent } from "@/types/event";
import { Card } from "@/components/ui/card";

export function ShiftCard({ events }: { events: CalendarEvent[] }) {
  const shifts = events.filter((e) => e.category === "work" && e.shift);
  if (shifts.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30 p-3 text-center">
        <p className="text-xs text-muted-foreground">No shift scheduled</p>
      </Card>
    );
  }
  const shift = shifts[0];
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-cat-work px-3 py-2 text-cat-work-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase">
            <Briefcase className="size-3" />
            {shift.shift?.shiftType} shift
          </div>
          <span className="text-xs opacity-90">
            {format(new Date(shift.start), "HH:mm")} – {format(new Date(shift.end), "HH:mm")}
          </span>
        </div>
      </div>
      <div className="space-y-1 p-3 text-sm">
        <p className="font-medium">{shift.title}</p>
        {shift.shift?.role && (
          <p className="text-xs text-muted-foreground">{shift.shift.role}</p>
        )}
        {shift.shift?.location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {shift.shift.location}
          </p>
        )}
      </div>
    </Card>
  );
}