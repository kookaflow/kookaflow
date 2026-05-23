import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PaywallModal } from "./PaywallModal";

/**
 * Slim countdown banner shown while a user is in the 14-day trial.
 * - Hidden for paid/lifetime users.
 * - Shows a sterner "expired" variant once the trial has ended.
 */
export function TrialBanner() {
  const sub = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (sub.loading || !sub.signedIn) return null;

  // Paid users: nothing to show.
  if (sub.tier === "pro" || sub.tier === "lifetime" || sub.tier === "basic") return null;

  const expired = sub.tier === "expired" || (!sub.isTrialing && sub.tier === "trial");

  // Allow dismissal only while still trialling. Expired stays sticky.
  if (dismissed && !expired) return null;

  return (
    <>
      <div
      className={`flex items-center justify-between gap-3 border-b px-4 py-2 text-sm ${
        expired
          ? "border-red-700 bg-[#DC2626] text-white"
          : "border-border bg-primary/10 text-foreground"
      }`}
      role="status"
    >
        <div className="flex min-w-0 items-center gap-2">
          {expired ? <Clock className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0 text-primary" />}
          <span className="truncate">
            {expired
              ? "Your free trial has ended — upgrade to keep using Kookaflow."
              : sub.trialDaysRemaining <= 1
                ? "Last day of your free trial."
                : `${sub.trialDaysRemaining} days left in your free trial.`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={expired ? "outline" : "default"}
            className={expired ? "border-white bg-white text-[#DC2626] hover:bg-white/90 hover:text-[#DC2626]" : ""}
            onClick={() => setPaywallOpen(true)}
          >
            Upgrade
          </Button>
          <Button asChild size="sm" variant="ghost" className={expired ? "text-white underline hover:bg-white/10 hover:text-white" : ""}>
            <Link to="/pricing">Compare plans</Link>
          </Button>
          {!expired && (
            <Button size="icon" variant="ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        reason={expired ? "trial-expired" : undefined}
      />
    </>
  );
}