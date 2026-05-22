import { createFileRoute } from "@tanstack/react-router";
import { MoreHero } from "@/components/more/MoreHero";
import { AccountSection } from "@/components/more/AccountSection";
import { ShiftsLinkRow } from "@/components/more/ShiftsLinkRow";
import { CalendarPreferences } from "@/components/settings/CalendarPreferences";
import { ConnectedCalendars } from "@/components/settings/ConnectedCalendars";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { RemindersSettings } from "@/components/settings/RemindersSettings";
import { SoundNotifications } from "@/components/settings/SoundNotifications";
import { ExportSection } from "@/components/settings/ExportSection";
import { AboutSection } from "@/components/settings/AboutSection";
import { DangerZone } from "@/components/settings/DangerZone";

export const Route = createFileRoute("/_authenticated/more")({
  head: () => ({
    meta: [
      { title: "More — Kookaflow" },
      {
        name: "description",
        content:
          "Preferences, calendar settings, notifications, exports and support for Kookaflow.",
      },
      { property: "og:title", content: "More — Kookaflow" },
      {
        property: "og:description",
        content:
          "Preferences, calendar settings, notifications, exports and support for Kookaflow.",
      },
    ],
  }),
  component: MorePage,
});

function MorePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MoreHero />
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <AccountSection />
        <CalendarPreferences />
        <ConnectedCalendars />
        <ShiftsLinkRow />
        <ThemeSettings />
        <RemindersSettings />
        <SoundNotifications />
        <ExportSection />
        <AboutSection />
        <DangerZone />
      </main>
    </div>
  );
}