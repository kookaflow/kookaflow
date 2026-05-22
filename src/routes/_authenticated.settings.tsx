import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Layers, LayoutDashboard, Settings } from "lucide-react";
import { RemindersSettings } from "@/components/settings/RemindersSettings";
import { SoundNotifications } from "@/components/settings/SoundNotifications";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { ConnectedCalendars } from "@/components/settings/ConnectedCalendars";
import { DangerZone } from "@/components/settings/DangerZone";
import { PageHeader } from "@/components/layout/PageHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kookaflow" },
      { name: "description", content: "Manage your Kookaflow preferences and reminder settings." },
      { property: "og:title", content: "Settings — Kookaflow" },
      { property: "og:description", content: "Manage your Kookaflow preferences and reminder settings." },
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
        <section className="mb-6">
          <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Shifts
          </h2>
          <Card className="overflow-hidden p-0">
            <Link
              to="/shifts"
              className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Manage Shift Templates</p>
                <p className="text-xs text-muted-foreground">
                  Create and edit your custom shift types
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </Card>
        </section>
        <ThemeSettings />
        <RemindersSettings />
        <ConnectedCalendars />
        <SoundNotifications />
        <DangerZone />
      </main>
    </div>
  );
}
