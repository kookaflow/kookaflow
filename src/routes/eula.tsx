import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/eula")({
  head: () => ({
    meta: [
      { title: "End User Licence Agreement — Kookaflow" },
      { name: "description", content: "End User Licence Agreement for the Kookaflow mobile and web app." },
    ],
  }),
  component: EulaPage,
});

function EulaPage() {
  return (
    <LegalPage title="End User Licence Agreement" subtitle="Last updated: May 2026">
      <p>
        This End User Licence Agreement ("Agreement") is a legal agreement between you
        ("User") and Kookaflow ("we", "us", "our") for use of the Kookaflow mobile
        and web application ("App"). By installing, accessing or using the App you
        agree to be bound by the terms of this Agreement.
      </p>

      <h2>1. Licence grant</h2>
      <p>
        We grant you a non-exclusive, non-transferable, revocable licence to install
        and use the App on devices that you own or control, solely for your personal,
        non-commercial use, in accordance with this Agreement and the usage rules of
        any applicable app store.
      </p>

      <h2>2. Restrictions</h2>
      <ul>
        <li>You must not copy, modify, reverse engineer, decompile or disassemble the App.</li>
        <li>You must not rent, lease, sublicense, sell or otherwise commercially exploit the App.</li>
        <li>You must not use the App for any unlawful purpose or in any way that may damage the App or impair anyone else's use of it.</li>
      </ul>

      <h2>3. Your account & content</h2>
      <p>
        You are responsible for safeguarding your account credentials and for any
        activity that occurs under your account. You retain ownership of any content
        you create in the App and grant us a limited licence to store and process
        that content for the purpose of providing the service.
      </p>

      <h2>4. Updates</h2>
      <p>
        We may release updates, patches and new versions of the App from time to
        time. Such updates may be installed automatically and this Agreement will
        continue to apply to those updated versions.
      </p>

      <h2>5. Third-party services</h2>
      <p>
        The App may integrate with third-party services (for example Google Calendar).
        Your use of those services is governed by their own terms and privacy
        policies, and we are not responsible for those services.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        The App is provided "as is" and "as available" without warranties of any
        kind, whether express or implied, to the maximum extent permitted by law.
        We do not warrant that the App will be uninterrupted, error-free or free
        of harmful components.
      </p>

      <h2>7. Australian Consumer Law</h2>
      <p>
        Nothing in this Agreement excludes, restricts or modifies any consumer
        guarantees, rights or remedies that you may have under the Australian
        Consumer Law or other applicable laws that cannot be lawfully excluded.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total aggregate liability to you
        arising out of or in connection with the App or this Agreement is limited to
        the amount you have paid us (if any) for the App in the 12 months preceding
        the claim. We are not liable for indirect, incidental, special, consequential
        or punitive damages.
      </p>

      <h2>9. Termination</h2>
      <p>
        This Agreement remains in effect until terminated by you or us. You may
        terminate it at any time by uninstalling the App and ceasing to use it. We
        may terminate or suspend your access if you breach this Agreement.
      </p>

      <h2>10. Governing law</h2>
      <p>
        This Agreement is governed by the laws of New South Wales, Australia. You
        and we submit to the non-exclusive jurisdiction of the courts of New South
        Wales for any dispute arising out of or in connection with this Agreement.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this Agreement can be sent via the in-app Support page.
      </p>
    </LegalPage>
  );
}