import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createCheckoutSession } from "@/lib/stripe.functions";
import type { PlanKey } from "@/lib/stripe.server";

export interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Feature name that triggered the paywall, e.g. "Google Calendar sync" */
  feature?: string;
  /** Reason copy: "trial-expired" | "basic-locked" | undefined */
  reason?: "trial-expired" | "basic-locked";
}

const PLANS: Array<{
  key: PlanKey;
  name: string;
  price: string;
  cadence: string;
  highlight?: string;
  description: string;
}> = [
  {
    key: "pro_yearly",
    name: "Pro Yearly",
    price: "$29.99",
    cadence: "AUD / year",
    highlight: "Best value — save 50%",
    description: "All features. Cancel anytime.",
  },
  {
    key: "lifetime",
    name: "Lifetime Pro",
    price: "$59.99",
    cadence: "AUD one-time",
    highlight: "Pay once, own it",
    description: "All features forever. No recurring charge.",
  },
  {
    key: "pro_monthly",
    name: "Pro Monthly",
    price: "$4.99",
    cadence: "AUD / month",
    description: "All features. Cancel anytime.",
  },
  {
    key: "basic",
    name: "Basic",
    price: "$2.99",
    cadence: "AUD / month",
    description: "Core calendar + shift tracking only. Cancel anytime.",
  },
];

export function PaywallModal({ open, onOpenChange, feature, reason }: PaywallModalProps) {
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  const headline =
    reason === "trial-expired"
      ? "Your 14-day trial has ended"
      : reason === "basic-locked"
        ? "This feature is part of Pro"
        : feature
          ? `Unlock ${feature}`
          : "Upgrade to keep going";

  const subhead =
    reason === "trial-expired"
      ? "Pick a plan to keep your calendar, shifts, and dashboard intact."
      : "Your data is safe — upgrade to unlock everything Kookaflow can do.";

  async function handlePick(plan: PlanKey) {
    try {
      setLoadingPlan(plan);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            {headline}
          </DialogTitle>
          <DialogDescription>{subhead}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => (
            <button
              key={p.key}
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handlePick(p.key)}
              className="group relative flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-accent/40 disabled:opacity-60"
            >
              {p.highlight && (
                <span className="absolute right-3 top-3 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {p.highlight}
                </span>
              )}
              <div className="text-sm font-medium text-foreground">{p.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-foreground">{p.price}</span>
                <span className="text-xs text-muted-foreground">{p.cadence}</span>
              </div>
              <div className="text-xs text-muted-foreground">{p.description}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                {loadingPlan === p.key ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Opening checkout…
                  </>
                ) : (
                  <>Choose {p.name} →</>
                )}
              </div>
            </button>
          ))}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              navigate({ to: "/pricing" });
            }}
          >
            See full comparison
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="mr-1 h-4 w-4" /> Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}