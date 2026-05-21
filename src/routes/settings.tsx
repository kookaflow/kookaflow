import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, CalendarDays, LayoutDashboard, Settings } from "lucide-react";
import { RemindersSettings } from "@/components/settings/RemindersSettings";
import { SoundNotifications } from "@/components/settings/SoundNotifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
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
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground",
            )}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow">
            <Settings className="size-4" />
            Settings
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Manage preferences
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure reminders, notifications, and app preferences.</p>
        </div>

        <RemindersSettings />
        <SoundNotifications />
      </main>
    </div>
  );
}
