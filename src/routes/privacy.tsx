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

      <h2>Google User Data</h2>
      <p>
        Kookaflow integrates with Google Calendar via OAuth 2.0. When you connect your Google
        account, Kookaflow requests read-only access to your Google Calendar data (scope:
        calendar.readonly).
      </p>
      <p>What we access: Calendar event titles, dates, times, and descriptions from your Google Calendar.</p>
      <p>What we do NOT do:</p>
      <ul>
        <li>We do not write to, modify, or delete your Google Calendar events.</li>
        <li>We do not sell your Google Calendar data to third parties.</li>
        <li>We do not share your Google Calendar data with any third parties.</li>
        <li>We do not use your Google Calendar data to train AI or machine learning models.</li>
        <li>We do not transfer your Google Calendar data except as necessary to provide the Kookaflow service.</li>
      </ul>
      <p>
        Data storage: Google Calendar data is accessed in real time to display events in your
        Kookaflow calendar. We store only the minimum data necessary to display your schedule within
        the app.
      </p>
      <p>
        Revoking access: You can disconnect Google Calendar at any time from the More tab in
        Kookaflow, or by visiting your Google Account permissions at{" "}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
          myaccount.google.com/permissions
        </a>
        .
      </p>

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