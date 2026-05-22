import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Kookaflow" },
      { name: "description", content: "The terms that govern your use of Kookaflow." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" subtitle="Last updated: May 2026">
      <h2>1. Acceptance of terms</h2>
      <p>
        By creating an account or using Kookaflow you agree to these Terms of Service. If you do
        not agree, please do not use the service.
      </p>

      <h2>2. Description of service</h2>
      <p>
        Kookaflow is a life-balance calendar app for shift workers, providing scheduling,
        reminders, wellness insights, and optional calendar sync.
      </p>

      <h2>3. User responsibilities</h2>
      <p>
        You are responsible for keeping your login credentials secure, for the accuracy of the
        information you enter, and for complying with applicable laws.
      </p>

      <h2>4. Prohibited uses</h2>
      <ul>
        <li>Using the service for unlawful or harmful purposes.</li>
        <li>Attempting to access other users' data.</li>
        <li>Reverse engineering, scraping, or disrupting the service.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        Kookaflow, its branding, and the software are owned by us. Content you create remains
        yours; you grant us only the rights needed to operate the service for you.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        The service is provided "as is" without warranties of any kind. Kookaflow is not a medical
        or mental health service and should not be relied upon as such.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Kookaflow is not liable for indirect, incidental,
        or consequential damages arising from your use of the service.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may delete your account at any time from Settings. We may suspend or terminate
        accounts that violate these terms.
      </p>

      <h2>9. Changes to terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the service after changes
        means you accept the updated terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of New South Wales, Australia.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:support@kookaflow.com">support@kookaflow.com</a>.
      </p>
    </LegalPage>
  );
}