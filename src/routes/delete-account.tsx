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

      <h2 id="delete-some-data">Delete some of your data without deleting your account</h2>
      <ul>
        <li>
          Delete individual shifts, events and shift templates in the app at any time — open the
          item and choose Delete.
        </li>
        <li>
          Disconnect Google Calendar in <strong>More → Connected Calendars → Disconnect</strong>.
          This removes Kookaflow's access to your Google account, deletes the stored connection and
          its tokens, and deletes the Google events Kookaflow had stored. Shifts already copied into
          your Google Calendar stay in Google.
        </li>
        <li>
          For anything else, email{" "}
          <a href="mailto:hello@kookaflow.com?subject=Delete%20some%20of%20my%20data">
            hello@kookaflow.com
          </a>{" "}
          from your account's email address with the subject "Delete some of my data". We will
          handle it within <strong>30 days</strong>.
        </li>
      </ul>

      <h2>What is deleted</h2>
      <ul>
        <li>Your profile and sign-in account (name, email, job role, settings).</li>
        <li>All shifts and calendar events.</li>
        <li>Shift templates and custom categories.</li>
        <li>Preferences, including reminder and notification settings.</li>
        <li>
          Your Google Calendar connection: Kookaflow's access is revoked at Google, and its tokens
          and cached Google events are deleted.
        </li>
        <li>
          Your push notification registration with our notification provider, plus scheduled
          alerts and reminder history.
        </li>
        <li>Any active subscription paid by card on our website (Stripe) is cancelled immediately.</li>
        <li>Dismissed wellness nudges and category display choices.</li>
      </ul>

      <h2>What is kept, and why</h2>
      <p>
        Purchase and transaction records held by Apple, Google Play, RevenueCat or Stripe are
        kept as required for tax and legal purposes. These records are held by those providers
        under their own policies.
      </p>

      <h2>Deleting your account does not cancel an App Store or Google Play subscription</h2>
      <p>If you subscribed through the App Store or Google Play, cancel it in that store:</p>
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
          <strong>Website (card payment):</strong> cancelled automatically when you delete your
          account.
        </li>
      </ul>

      <h2>Questions</h2>
      <p>
        Contact <a href="mailto:hello@kookaflow.com">hello@kookaflow.com</a>.
      </p>
    </LegalPage>
  );
}
