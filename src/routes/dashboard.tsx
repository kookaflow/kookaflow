import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, Moon, Sun, LayoutDashboard, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/lib/events-store";
import {
  balanceScore,
  categoryCard,
  currentMonthRange,
  currentWeekRange,
  DASHBOARD_CARD_CATEGORIES,
  monthlyTotals,
  previousWeekRange,
  wakingHoursPerWeek,
  weeklyByDay,
} from "@/components/dashboard/lib/metrics";
import { buildNudges } from "@/components/dashboard/lib/nudges";
import { BalanceScoreCard } from "@/components/dashboard/BalanceScoreCard";
import { WellnessNudgePanel } from "@/components/dashboard/WellnessNudgePanel";
import { WeeklyStackedBarChart } from "@/components/dashboard/WeeklyStackedBarChart";
import { MonthlyDonutChart } from "@/components/dashboard/MonthlyDonutChart";
import { CategoryCard } from "@/components/dashboard/CategoryCard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ShiftSync" },
      { name: "description", content: "Your life-balance dashboard: weekly hours, monthly distribution, and research-backed wellness nudges." },
      { property: "og:title", content: "Dashboard — ShiftSync" },
      { property: "og:description", content: "See how your time spreads across work, rest, wellness, exercise, and relationships." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const events = useEventsStore();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.classList.contains("dark");
    root.classList.toggle("dark", theme === "dark");
    return () => {
      root.classList.toggle("dark", prev);
    };
  }, [theme]);

  const now = new Date();
  const week = useMemo(() => currentWeekRange(now), [events]);
  const lastWeek = useMemo(() => previousWeekRange(now), [events]);
  const month = useMemo(() => currentMonthRange(now), [events]);

  const weekly = useMemo(() => weeklyByDay(events, week), [events, week]);
  const monthly = useMemo(() => monthlyTotals(events, month), [events, month]);
  const waking = useMemo(() => wakingHoursPerWeek(events, week), [events, week]);
  const cards = useMemo(
    () =>
      DASHBOARD_CARD_CATEGORIES.map((c) =>
        categoryCard(c, events, week, lastWeek, waking),
      ),
    [events, week, lastWeek, waking],
  );
  const score = useMemo(() => balanceScore(events, week), [events, week]);
  const nudges = useMemo(() => buildNudges(events, now), [events]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
            <CalendarHeart className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ShiftSync</span>
        </div>

        <nav className="mx-auto flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <Link
            to="/calendar"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground",
            )}
          >
            <CalendarDays className="size-4" />
            Calendar
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow">
            <LayoutDashboard className="size-4" />
            Dashboard
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Week of {format(week.start, "MMM d")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BalanceScoreCard data={score} />
          </div>
          <div className="lg:col-span-2">
            <WellnessNudgePanel nudges={nudges} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyStackedBarChart data={weekly} />
          </div>
          <div className="lg:col-span-1">
            <MonthlyDonutChart totals={monthly.totals} totalHours={monthly.totalHours} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <CategoryCard key={c.category} data={c} />
          ))}
        </div>
      </main>
    </div>
  );
}