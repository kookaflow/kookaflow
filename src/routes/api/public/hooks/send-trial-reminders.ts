import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, sendResendEmail } from "@/lib/reminders/email.server";

/**
 * Cron-driven trial-status emails.
 * - 4 days left  → gentle heads-up
 * - 1 day left   → final reminder
 * - on/after end → trial-expired
 *
 * Deduplicated via reminder_sends (kind ∈ trial_4_days|trial_1_day|trial_expired,
 * sent_for_date = the user's trial_ends_at date).
 */
export const Route = createFileRoute("/api/public/hooks/send-trial-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabase = getAdminClient();
        const now = new Date();

        // Only users still on the trial tier; paid/lifetime are excluded.
        // Window: trial_ends_at within [now - 1d, now + 5d] covers all three reminders.
        const lowerIso = new Date(now.getTime() - 24 * 3600_000).toISOString();
        const upperIso = new Date(now.getTime() + 5 * 24 * 3600_000).toISOString();

        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, trial_ends_at, subscription_tier")
          .eq("subscription_tier", "trial")
          .gte("trial_ends_at", lowerIso)
          .lte("trial_ends_at", upperIso);

        if (error) {
          return new Response(`profiles error: ${error.message}`, { status: 500 });
        }

        const results: Array<{ user_id: string; status: string }> = [];

        for (const p of profiles ?? []) {
          if (!p.trial_ends_at) continue;
          const trialEnds = new Date(p.trial_ends_at);
          const msLeft = trialEnds.getTime() - now.getTime();
          const daysLeft = Math.ceil(msLeft / 86_400_000);

          let kind: "trial_4_days" | "trial_1_day" | "trial_expired" | null = null;
          if (msLeft <= 0) kind = "trial_expired";
          else if (daysLeft === 1) kind = "trial_1_day";
          else if (daysLeft === 4) kind = "trial_4_days";
          if (!kind) {
            results.push({ user_id: p.id, status: "no_match" });
            continue;
          }

          // Look up email from auth.users via admin API.
          const { data: userResp } = await supabase.auth.admin.getUserById(p.id);
          const email = userResp?.user?.email;
          if (!email) {
            results.push({ user_id: p.id, status: "no_email" });
            continue;
          }

          // Dedup key: the trial end date.
          const sentFor = trialEnds.toISOString().slice(0, 10);

          const { error: insErr } = await supabase
            .from("reminder_sends")
            .insert({ user_id: p.id, kind, sent_for_date: sentFor });
          if (insErr) {
            results.push({ user_id: p.id, status: "already_sent" });
            continue;
          }

          const { subject, html } = buildTrialEmail({
            name: p.full_name ?? null,
            kind,
            daysLeft: Math.max(0, daysLeft),
          });

          try {
            await sendResendEmail({ to: email, subject, html });
            results.push({ user_id: p.id, status: `sent:${kind}` });
          } catch (e) {
            await supabase
              .from("reminder_sends")
              .delete()
              .eq("user_id", p.id)
              .eq("kind", kind)
              .eq("sent_for_date", sentFor);
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ user_id: p.id, status: `error:${msg}` });
          }
        }

        return Response.json({ ok: true, results });
      },
    },
  },
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F5FB;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1E2A6E;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1E2A6E 0%,#F59E0B 100%);color:#fff;padding:24px;border-radius:16px 16px 0 0;">
      <div style="font-size:14px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Kookaflow</div>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">${title}</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;">
      ${inner}
      <p style="margin:32px 0 0;font-size:12px;color:#8a8fb0;">You're receiving this because your Kookaflow trial is ending soon.</p>
    </div>
  </div></body></html>`;
}

function ctaButton(label: string) {
  return `<a href="https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app/pricing"
    style="display:inline-block;background:#F59E0B;color:#1E2A6E;text-decoration:none;font-weight:700;
    padding:12px 20px;border-radius:10px;margin:16px 0 8px;">${label}</a>`;
}

function buildTrialEmail(args: {
  name: string | null;
  kind: "trial_4_days" | "trial_1_day" | "trial_expired";
  daysLeft: number;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name)},` : "Hi there,";

  if (args.kind === "trial_4_days") {
    return {
      subject: "4 days left in your Kookaflow trial 🌿",
      html: shell(
        "4 days to go",
        `<p style="margin:0 0 12px;font-size:16px;">${greeting}</p>
         <p style="margin:0 0 12px;">You've got <strong>4 days</strong> left in your free trial of Kookaflow Pro.</p>
         <p style="margin:0 0 12px;">Keep your wellness streak, your life-balance dashboard and Google Calendar sync running — pick a plan whenever you're ready.</p>
         ${ctaButton("Choose your plan")}
         <p style="margin:16px 0 0;color:#5b6088;font-size:13px;">No pressure — your data is safe either way.</p>`,
      ),
    };
  }

  if (args.kind === "trial_1_day") {
    return {
      subject: "Last day of your Kookaflow trial ⏳",
      html: shell(
        "One day left",
        `<p style="margin:0 0 12px;font-size:16px;">${greeting}</p>
         <p style="margin:0 0 12px;">Tomorrow your free trial ends. After that, Pro features (life-balance dashboard, Google Calendar sync, SMS &amp; push reminders) will be paused.</p>
         <p style="margin:0 0 12px;">Lock in Pro now — Pro Yearly is <strong>$29.99 AUD</strong>, or grab <strong>Lifetime Pro</strong> for a one-time $59.99.</p>
         ${ctaButton("Upgrade now")}`,
      ),
    };
  }

  return {
    subject: "Your Kookaflow trial has ended",
    html: shell(
      "Trial ended",
      `<p style="margin:0 0 12px;font-size:16px;">${greeting}</p>
       <p style="margin:0 0 12px;">Your 14-day Kookaflow Pro trial has ended. Your calendar and shifts are still here — but Pro features are paused for now.</p>
       <p style="margin:0 0 12px;">Reactivate anytime:</p>
       <ul style="margin:0 0 12px 18px;color:#1E2A6E;">
         <li>Basic — $2.99 / month (core calendar &amp; shifts)</li>
         <li>Pro Monthly — $4.99 / month</li>
         <li>Pro Yearly — $29.99 / year (save 50%)</li>
         <li>Lifetime Pro — $59.99 one-time</li>
       </ul>
       ${ctaButton("Reactivate Kookaflow")}`,
    ),
  };
}