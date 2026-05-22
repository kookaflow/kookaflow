import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Kookaflow" },
      { name: "description", content: "How Kookaflow collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" subtitle="Last updated: May 2026">
      <p>
        Kookaflow ("we", "us", "our") is committed to protecting your privacy. This Privacy
        Policy explains what information we collect, how we use it, and the choices you have.
      </p>

      <h2>What data we collect</h2>
      <ul>
        <li>Account details: your name and email address.</li>
        <li>Profile information: job role and shift pattern.</li>
        <li>Calendar content: life events, activities, and shift schedule.</li>
        <li>Financial preferences: hourly rate, used to calculate earnings.</li>
        <li>Device push notification token, if you enable notifications.</li>
        <li>Google Calendar events, only if you choose to connect your Google account.</li>
      </ul>

      <h2>How we use your data</h2>
      <ul>
        <li>To provide the calendar, shift management, and life-balance features.</li>
        <li>To send daily and weekly reminders you have opted into.</li>
        <li>To calculate wellness and balance scores based on your activity.</li>
        <li>To keep the service secure and to fix bugs.</li>
      </ul>

      <h2>Third-party services</h2>
      <p>We rely on a small set of trusted providers to deliver Kookaflow:</p>
      <ul>
        <li><strong>Supabase</strong> — database and authentication.</li>
        <li><strong>Resend</strong> — email delivery for reminders and account emails.</li>
        <li><strong>OneSignal</strong> — push notifications.</li>
        <li><strong>Google Calendar API</strong> — only if you connect your Google account.</li>
      </ul>

      <h2>Data storage</h2>
      <p>
        Your data is stored securely on Supabase servers and protected by row-level security so
        that only you can access your information.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, correct, export, or delete your data at any time. You may delete your
        account from Settings, or contact us for a copy of your data.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:support@kookaflow.com">support@kookaflow.com</a>.
      </p>
    </LegalPage>
  );
}