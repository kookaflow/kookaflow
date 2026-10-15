import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarDays, Link2, Palette, Bell, Download, Info, ShieldAlert, UserRound } from "lucide-react";
import { MoreHero } from "@/components/more/MoreHero";
import { AccountSection } from "@/components/more/AccountSection";
import { ShiftsLinkRow } from "@/components/more/ShiftsLinkRow";
import { SignOutSection } from "@/components/more/SignOutSection";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [nativeIos, setNativeIos] = useState(false);
  useEffect(() => {
    if (import.meta.env.VITE_IS_MOBILE_BUILD !== true) return;
    let disposed = false;
    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!disposed) setNativeIos(Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios");
    });
    return () => { disposed = true; };
  }, []);

  const sections = [
    { id: "account", label: "Account & Subscription", icon: UserRound, content: <AccountSection /> },
    { id: "calendar", label: "Calendar Preferences", icon: CalendarDays, content: <CalendarPreferences /> },
    { id: "connections", label: "Connected Calendars", icon: Link2, content: <ConnectedCalendars /> },
    { id: "appearance", label: "Appearance", icon: Palette, content: <ThemeSettings /> },
    { id: "notifications", label: "Reminders & Notifications", icon: Bell, content: <><RemindersSettings /><SoundNotifications /></> },
    { id: "export", label: "Export", icon: Download, content: <ExportSection /> },
    { id: "about", label: "About & Support", icon: Info, content: <AboutSection /> },
    { id: "danger", label: "Danger Zone", icon: ShieldAlert, content: <DangerZone /> },
  ];
  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-background text-foreground">
      <MoreHero />
      <main className="mx-auto w-full min-w-0 max-w-3xl overflow-x-hidden p-4 sm:p-6">
        {nativeIos ? (
          <>
            <ShiftsLinkRow />
            <Accordion type="single" collapsible className="w-full min-w-0">
              {sections.map(({ id, label, icon: Icon, content }) => (
                <AccordionItem key={id} value={id} className="min-w-0">
                  <AccordionTrigger className="min-w-0 gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 break-words">{label}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="min-w-0 [&>div]:mb-0">{content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <SignOutSection />
          </>
        ) : (
          <>
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
        <SignOutSection />
          </>
        )}
      </main>
    </div>
  );
}