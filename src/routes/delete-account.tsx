import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

const TITLE = "Delete your Kookaflow account";
const DESCRIPTION =
  "How to delete your Kookaflow account and data, in the app or by email, what is deleted and what is kept.";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  return (
    <LegalPage title="Delete your account" subtitle="Kookaflow · developed by Bluegum Studio">
      <p>
        This page explains how to delete your <strong>Kookaflow</strong> account and the data
        linked to it. Kookaflow is developed by <strong>Bluegum Studio</strong>.
      </p>

      <h2>Delete your account in the app</h2>
      <ol>
        <li>Open Kookaflow and sign in.</li>
        <li>Go to <strong>More → Danger Zone → Delete Account</strong>.</li>
        <li>Confirm. Your account and data are deleted immediately and permanently.</li>
      </ol>

      <h2>Request deletion without the app</h2>
      <p>
        Email <a href="mailto:hello@kookaflow.com?subject=Delete%20my%20account">hello@kookaflow.com</a>{" "}
        from the email address you use for your Kookaflow account, with the subject
        "Delete my account". We will verify the request, delete your account within
        <strong> 30 days</strong>, and confirm by email.
      </p>

      <h2>What is deleted</h2>
      <ul>
        <li>Your profile and sign-in account (name, email, job role, settings).</li>
        <li>All shifts and calendar events.</li>
        <li>Shift templates and custom categories.</li>
        <li>Preferences, including reminder and notification settings.</li>
        <li>Your Google Calendar connection, its access tokens and cached Google events.</li>
        <li>Scheduled push notification alerts and reminder history.</li>
        <li>Dismissed wellness nudges and category display choices.</li>
      </ul>

      <h2>What is kept, and why</h2>
      <p>
        Purchase and transaction records held by Apple, Google Play, RevenueCat or Stripe are
        kept as required for tax and legal purposes. These records are held by those providers
        under their own policies.
      </p>

      <h2>Deleting your account does not cancel a subscription</h2>
      <p>If you subscribed, cancel it in the store you bought it from:</p>
      <ul>
        <li>
          <strong>iPhone / App Store:</strong> Settings → your name → Subscriptions → Kookaflow →
          Cancel Subscription.
        </li>
        <li>
          <strong>Android / Google Play:</strong> open the Google Play Store → your profile icon →
          Payments &amp; subscriptions → Subscriptions → Kookaflow → Cancel subscription.
        </li>
        <li>
          <strong>Website (card payment):</strong> before deleting, go to More → Account → Manage
          subscription, or email us and we will cancel it.
        </li>
      </ul>

      <h2>Questions</h2>
      <p>
        Contact <a href="mailto:hello@kookaflow.com">hello@kookaflow.com</a>.
      </p>
    </LegalPage>
  );
}
