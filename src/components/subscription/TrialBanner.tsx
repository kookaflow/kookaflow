import { useState } from "react";
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
        className={`flex items-center justify-between gap-2 border-b px-3 py-2 ${
          expired
            ? "border-red-700 bg-[#DC2626] text-white font-semibold"
            : "border-border bg-primary/10 text-foreground text-sm"
        }`}
        style={expired ? { fontSize: 13 } : undefined}
        role="status"
      >
        <div className="flex min-w-0 items-center gap-2">
          {expired ? <Clock className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0 text-primary" />}
          {expired ? (
            <div className="min-w-0 leading-tight">
              <div className="truncate">Your free trial has ended</div>
              <div className="truncate text-[11px] font-normal opacity-90">
                Upgrade to keep access
              </div>
            </div>
          ) : (
            <span className="truncate">
              {sub.trialDaysRemaining <= 1
                ? "Last day of your free trial."
                : `${sub.trialDaysRemaining} days left in your free trial.`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={expired ? "outline" : "default"}
            className={
              expired
                ? "border-white bg-white font-bold text-[#DC2626] hover:bg-white/90 hover:text-[#DC2626] rounded-full px-4 py-1.5 h-auto"
                : ""
            }
            onClick={() => setPaywallOpen(true)}
          >
            Upgrade
          </Button>
          {!expired && (
            <Button asChild size="sm" variant="ghost">
              <a href="/pricing">Compare plans</a>
            </Button>
          )}
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