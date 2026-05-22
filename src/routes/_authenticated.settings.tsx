import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Settings } from "lucide-react";
import { RemindersSettings } from "@/components/settings/RemindersSettings";
import { SoundNotifications } from "@/components/settings/SoundNotifications";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { PageHeader } from "@/components/layout/PageHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Briefcase, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ShiftSync" },
      { name: "description", content: "Manage your ShiftSync preferences and reminder settings." },
      { property: "og:title", content: "Settings — ShiftSync" },
      { property: "og:description", content: "Manage your ShiftSync preferences and reminder settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Settings"
        subtitle="Configure reminders, notifications, and app preferences."
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
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white/80 transition-all hover:text-white",
            )}
          >
            <LayoutDashboard className="size-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow">
            <Settings className="size-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </span>
        </nav>
      </PageHeader>

      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <ThemeSettings />
        <section className="my-4">
          <Button asChild variant="outline" className="w-full justify-between">
            <Link to="/shifts">
              <span className="flex items-center gap-2"><Briefcase className="size-4" /> Manage Shift Templates</span>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </section>
        <RemindersSettings />
        <SoundNotifications />
      </main>
    </div>
  );
}
