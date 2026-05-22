import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { BalanceScale } from "@/components/shared/empty-illustrations";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kookaflow" },
      { name: "description", content: "Your life-balance dashboard: weekly hours, monthly distribution, and research-backed wellness nudges." },
      { property: "og:title", content: "Dashboard — Kookaflow" },
      { property: "og:description", content: "See how your time spreads across work, rest, wellness, exercise, and relationships." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const events = useEventsStore();
  const navigate = useNavigate();

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

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader
          title={greeting}
          subtitle={format(now, "EEEE, MMMM d")}
          right={<ThemeToggle />}
        />
        <main className="mx-auto flex max-w-7xl items-center justify-center p-4 sm:p-6 min-h-[60vh]">
          <EmptyState
            illustration={<BalanceScale className="w-full h-auto" />}
            title="No data yet"
            subtitle="Add some events to see your life balance score"
            actionLabel="Go to Calendar"
            onAction={() => navigate({ to: "/calendar" })}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={greeting}
        subtitle={format(now, "EEEE, MMMM d")}
        right={<ThemeToggle />}
      />

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