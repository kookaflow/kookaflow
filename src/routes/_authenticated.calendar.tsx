import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Plus,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MonthView } from "@/components/calendar-page/MonthView";
import { TimeGrid } from "@/components/calendar-page/TimeGrid";
import { TodayPanel } from "@/components/calendar-page/TodayPanel";
import { EventDialog } from "@/components/events/EventDialog";
import { WeekSummaryDialog } from "@/components/calendar-page/WeekSummaryDialog";
import type { MockEvent, IconName } from "@/components/calendar-page/constants";
import type { ShiftType as MockShiftType } from "@/types/event";
import { useEvents } from "@/providers/EventsProvider";
import type { CalendarEvent } from "@/types/event";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  listGoogleEvents,
  triggerGoogleSync,
  getGoogleConnectionStatus,
} from "@/lib/google-calendar.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format as fmt } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { StampProvider, useStamp } from "@/providers/StampProvider";
import { QuickAddFab } from "@/components/calendar/QuickAddFab";
import { QuickAddPanel } from "@/components/calendar/QuickAddPanel";
import { WellnessNudgeBanner } from "@/components/calendar/WellnessNudgeBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { KookaburraOnCalendar } from "@/components/shared/empty-illustrations";
import type { CategoryId } from "@/types/event";

type ViewMode = "month" | "week" | "day";

export const Route = createFileRoute("/_authenticated/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <StampProvider>
      <CalendarPageInner />
    </StampProvider>
  );
}

function CalendarPageInner() {
  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState<Date>(new Date());
  const { events: rawEvents } = useEvents();
  const fetchGoogle = useServerFn(listGoogleEvents);
  const fetchStatus = useServerFn(getGoogleConnectionStatus);
  const runSync = useServerFn(triggerGoogleSync);
  const { data: googleEvents = [] } = useQuery({
    queryKey: ["google-events"],
    queryFn: () => fetchGoogle({ data: {} }),
    staleTime: 60_000,
  });
  const { data: gStatus } = useQuery({
    queryKey: ["google-connection-status"],
    queryFn: () => fetchStatus(),
    staleTime: 60_000,
  });
  const syncedOnceRef = useRef(false);
  useEffect(() => {
    if (!gStatus?.connected || syncedOnceRef.current) return;
    syncedOnceRef.current = true;
    runSync().catch(() => undefined);
  }, [gStatus?.connected, runSync]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogDefault, setDialogDefault] = useState<Date>(new Date());
  const [dialogCategory, setDialogCategory] = useState<CategoryId | undefined>(undefined);
  const [weekSummaryOpen, setWeekSummaryOpen] = useState(false);
  const [googleDetail, setGoogleDetail] = useState<MockEvent | null>(null);
  const { selected: stamp, applyStamp, panelOpen } = useStamp();

  const events = useMemo(() => {
    const local = rawEvents.map(toMockEvent);
    const google: MockEvent[] = googleEvents.map((g) => ({
      id: `google:${g.id}`,
      title: g.summary ?? "(no title)",
      category: "personal" as const,
      start: new Date(g.start),
      end: new Date(g.end),
      location: g.location ?? undefined,
      source: "google" as const,
      externalUrl: g.htmlLink ?? undefined,
    }));
    return [...local, ...google];
  }, [rawEvents, googleEvents]);

  const handleDaySelect = (d: Date) => {
    if (stamp) {
      void applyStamp(d);
      return;
    }
    setDate(d);
  };

  const goPrev = () => {
    if (view === "month") setDate((d) => addMonths(d, -1));
    else if (view === "week") setDate((d) => addDays(d, -7));
    else setDate((d) => addDays(d, -1));
  };

  const openCreate = (d?: Date) => {
    setEditingId(null);
    setDialogDefault(d ?? new Date());
    setDialogCategory(undefined);
    setDialogOpen(true);
  };
  const openCreateWithCategory = (category: CategoryId) => {
    setEditingId(null);
    setDialogDefault(new Date());
    setDialogCategory(category);
    setDialogOpen(true);
  };
  const openEdit = (e: MockEvent) => {
    if (e.source === "google") {
      setGoogleDetail(e);
      return;
    }
    setEditingId(e.id);
    setDialogCategory(undefined);
    setDialogOpen(true);
  };
  const goNext = () => {
    if (view === "month") setDate((d) => addMonths(d, 1));
    else if (view === "week") setDate((d) => addDays(d, 7));
    else setDate((d) => addDays(d, 1));
  };

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      }),
    [date],
  );

  const heading =
    view === "month"
      ? format(date, "MMMM yyyy")
      : view === "week"
        ? `${format(weekDays[0], "MMM d")} – ${format(weekDays[6], "MMM d, yyyy")}`
        : format(date, "EEEE, MMM d, yyyy");

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground overflow-hidden">
      {!panelOpen && (
      <PageHeader
        title={heading}
        subtitle={`${events.length} events this period`}
        right={
          <>
            <ThemeToggle />
            <Button
              size="sm"
              onClick={() => openCreate(date)}
              className="gap-1.5 bg-white/20 text-white hover:bg-white/30"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add event</span>
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all duration-200",
                view === v
                  ? "bg-white/25 text-white shadow"
                  : "text-white/80 hover:text-white",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(new Date())}
          className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          Today
        </Button>
        <div className="flex items-center rounded-md border border-white/30 bg-white/10">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex h-11 w-11 items-center justify-center border-l border-white/30 text-white transition-colors hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <CalendarIcon className="size-4" />
              <span className="hidden sm:inline">{heading}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </PageHeader>
      )}

      {/* Sub header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
        <h1 className="text-base font-semibold">{heading}</h1>
        <div className="flex items-center gap-3">
          {view === "week" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekSummaryOpen(true)}
              className="gap-1.5"
            >
              <CalendarDays className="size-3.5" />
              Week summary
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {events.length} events this period
          </span>
        </div>
      </div>

      <WellnessNudgeBanner
        events={events}
        anchor={date}
        onAction={openCreateWithCategory}
      />

      {/* Body */}
      <div
        className="flex flex-1 overflow-hidden transition-[padding] duration-200"
        style={{ paddingBottom: panelOpen ? "28vh" : 0 }}
      >
        <main className="flex-1 overflow-hidden">
          {events.length === 0 ? (
            <EmptyState
              illustration={<KookaburraOnCalendar className="w-full h-auto" />}
              title="Your calendar is empty"
              subtitle="Add your first shift to get started 🦅"
              actionLabel="Add Event"
              onAction={() => openCreate(date)}
            />
          ) : view === "month" ? (
            <MonthView
              cursor={date}
              selected={date}
              events={events}
              onSelect={handleDaySelect}
              onCreate={openCreate}
              onEventClick={openEdit}
            />
          ) : view === "week" ? (
            <TimeGrid
              days={weekDays}
              events={events}
              selected={date}
              onSelectDay={handleDaySelect}
              onCreate={openCreate}
              onEventClick={openEdit}
            />
          ) : (
            <TimeGrid
              days={[date]}
              events={events}
              selected={date}
              onSelectDay={handleDaySelect}
              onCreate={openCreate}
              onEventClick={openEdit}
            />
          )}
        </main>
        <TodayPanel date={date} events={events} onEventClick={openEdit} />
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={editingId}
        defaultStart={dialogDefault}
        defaultCategory={dialogCategory}
      />

      <WeekSummaryDialog
        open={weekSummaryOpen}
        onOpenChange={setWeekSummaryOpen}
        weekAnchor={date}
        events={events}
      />

      <Dialog
        open={!!googleDetail}
        onOpenChange={(o) => !o && setGoogleDetail(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-4 text-muted-foreground" fill="currentColor" aria-hidden="true">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V8h14v13z" />
              </svg>
              {googleDetail?.title || "(no title)"}
            </DialogTitle>
            <DialogDescription>From Google Calendar · read-only</DialogDescription>
          </DialogHeader>
          {googleDetail && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Date:</span>{" "}
                {fmt(googleDetail.start, "EEEE, MMM d, yyyy")}
              </p>
              <p>
                <span className="text-muted-foreground">Time:</span>{" "}
                {fmt(googleDetail.start, "h:mm a")} – {fmt(googleDetail.end, "h:mm a")}
              </p>
              {googleDetail.location && (
                <p>
                  <span className="text-muted-foreground">Location:</span>{" "}
                  {googleDetail.location}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            {googleDetail?.externalUrl && (
              <a
                href={googleDetail.externalUrl}
                target="_blank"
                rel="noopener"
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Open in Google Calendar ↗
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuickAddFab />
      <QuickAddPanel
        onOpenDetailedEvent={() => {
          openCreate(date);
        }}
      />
    </div>
  );
}

function toMockEvent(e: CalendarEvent): MockEvent {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    start: new Date(e.start),
    end: new Date(e.end),
    shiftType: e.shift?.shiftType as MockShiftType | undefined,
    location: e.shift?.location,
    notes: e.notes,
    iconName: e.iconName as IconName | undefined,
    recurrence: e.recurrencePattern
      ? e.recurrencePattern === "custom"
        ? { kind: "custom", days: (e.recurrenceDays ?? []).map(weekdayKeyToIndex).filter((n): n is number => n != null) }
        : { kind: e.recurrencePattern }
      : { kind: "none" },
  };
}

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};
function weekdayKeyToIndex(k: string): number | null {
  return WEEKDAY_INDEX[k] ?? null;
}