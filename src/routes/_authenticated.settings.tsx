import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { ShiftPatternSection } from "@/components/settings/ShiftPatternSection";
import { SecuritySection } from "@/components/settings/SecuritySection";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Kookaflow" },
      { name: "description", content: "Manage your profile, shift pattern and security." },
      { property: "og:title", content: "Account Settings — Kookaflow" },
      { property: "og:description", content: "Manage your profile, shift pattern and security." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Account"
        subtitle="Your profile, shift pattern and security."
        right={<ThemeToggle />}
      />
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <ProfileSection />
        <ShiftPatternSection />
        <SecuritySection />
      </main>
    </div>
  );
}
