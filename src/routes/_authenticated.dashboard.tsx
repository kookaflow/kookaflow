import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Settings } from "lucide-react";
import { format } from "date-fns";
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
import { BalanceScoreCard } from "@/components/dashboard/BalanceScoreCard";
import { WellnessNudgePanel } from "@/components/dashboard/WellnessNudgePanel";
import { WeeklyStackedBarChart } from "@/components/dashboard/WeeklyStackedBarChart";
import { MonthlyDonutChart } from "@/components/dashboard/MonthlyDonutChart";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const Route = createFileRoute("/_authenticated/dashboard")({
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

  const hour = now.getHours();
  const tod = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const greeting = `Good ${tod}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={greeting}
        subtitle={format(now, "EEEE, MMMM d")}
        right={<ThemeToggle />}
      >
        <nav className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
          <Link
            to="/calendar"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white/80 transition-all hover:text-white",
            )}
          >
            <CalendarDays className="size-3.5" />
            <span className="hidden sm:inline">Calendar</span>
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow">
            <LayoutDashboard className="size-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </span>
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white/80 transition-all hover:text-white",
            )}
          >
            <Settings className="size-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </nav>
      </PageHeader>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BalanceScoreCard data={score} />
          </div>
          <div className="lg:col-span-2">
            <WellnessNudgePanel />
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

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {cards.map((c) => (
            <CategoryCard key={c.category} data={c} />
          ))}
        </div>
      </main>
    </div>
  );
}