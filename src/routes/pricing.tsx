import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createCheckoutSession } from "@/lib/stripe.functions";
import type { PlanKey } from "@/lib/stripe.server";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Kookaflow" },
      { name: "description", content: "Simple pricing for shift workers. Try Kookaflow free for 14 days, then choose the plan that fits your life." },
      { property: "og:title", content: "Pricing — Kookaflow" },
      { property: "og:description", content: "14-day free trial. Pro from $4.99 AUD/mo, or pay once for Lifetime Pro." },
    ],
  }),
  component: PricingPage,
});

type Tier = {
  key: PlanKey;
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  highlight?: string;
  recommended?: boolean;
};

const TIERS: Tier[] = [
  {
    key: "basic",
    name: "Basic",
    price: "$9.99",
    cadence: "AUD one-time",
    features: [
      "Calendar & shift tracking",
      "Shift templates",
      "Public holidays",
      "Email reminders",
    ],
    cta: "Get Basic",
  },
  {
    key: "pro_monthly",
    name: "Pro Monthly",
    price: "$4.99",
    cadence: "AUD / month",
    features: [
      "Everything in Basic",
      "Life-balance dashboard",
      "Wellness nudges",
      "Google Calendar sync",
      "SMS reminders",
      "Push notifications",
    ],
    cta: "Start Pro Monthly",
  },
  {
    key: "pro_yearly",
    name: "Pro Yearly",
    price: "$29.99",
    cadence: "AUD / year",
    features: [
      "Everything in Pro Monthly",
      "Save 50% vs monthly",
      "Priority support",
    ],
    cta: "Start Pro Yearly",
    highlight: "Save 50%",
    recommended: true,
  },
  {
    key: "lifetime",
    name: "Lifetime Pro",
    price: "$59.99",
    cadence: "AUD one-time",
    features: [
      "Everything in Pro",
      "Pay once, own it forever",
      "All future Pro features",
    ],
    cta: "Get Lifetime",
    highlight: "Best long-term value",
  },
];

function PricingPage() {
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  async function handlePick(plan: PlanKey) {
    try {
      setLoadingPlan(plan);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/login", search: { redirect: "/pricing" } as never });
        return;
      }
      const res = await checkout({ data: { plan } });
      if (res.url) {
        window.location.assign(res.url);
      } else {
        toast.error("Could not start checkout — please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> 14-day free trial — no credit card required
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Simple pricing for shift workers
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Try every Pro feature free for 14 days. After that, pick the plan that fits your life. All prices in AUD.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div
              key={t.key}
              className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
                t.recommended ? "border-primary shadow-lg shadow-primary/10" : "border-border"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {t.highlight}
                </span>
              )}
              <div className="text-sm font-medium text-muted-foreground">{t.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-foreground">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.cadence}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={t.recommended ? "default" : "outline"}
                disabled={loadingPlan !== null}
                onClick={() => handlePick(t.key)}
              >
                {loadingPlan === t.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout…
                  </>
                ) : (
                  t.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Already a customer?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}