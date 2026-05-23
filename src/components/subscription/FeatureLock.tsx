import { useState, type ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PaywallModal } from "./PaywallModal";

export interface FeatureLockProps {
  /** Feature name shown in the paywall, e.g. "Life-balance dashboard". */
  feature: string;
  /** Short description of what's behind the gate. */
  description?: string;
  /** Set to "pro" (default) to require pro/lifetime/trial. "full" allows basic too. */
  requires?: "pro" | "full";
  /** Optional preview blurred behind the lock card. */
  preview?: ReactNode;
  children: ReactNode;
}

/**
 * Wrap any feature that should be unavailable to Basic / expired users.
 * During the 14-day trial, `hasProAccess` is true → children render as-is.
 */
export function FeatureLock({ feature, description, requires = "pro", preview, children }: FeatureLockProps) {
  const sub = useSubscription();
  const [open, setOpen] = useState(false);

  if (sub.loading || !sub.signedIn) return <>{children}</>;

  const allowed = requires === "pro" ? sub.hasProAccess : sub.hasFullAccess;
  if (allowed) return <>{children}</>;

  const expired = sub.tier === "expired" || (!sub.isTrialing && sub.tier === "trial");
  const reason = expired ? "trial-expired" : "basic-locked";

  return (
    <>
      <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
        {preview ? (
          <div className="pointer-events-none select-none opacity-40 blur-[2px]" aria-hidden>
            {preview}
          </div>
        ) : null}
        <div className={`${preview ? "absolute inset-0" : ""} flex flex-col items-center justify-center gap-3 bg-background/70 p-8 text-center backdrop-blur-sm`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{feature} is a Pro feature</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {description ?? (expired
                ? "Your free trial has ended. Upgrade to Pro to unlock this and more."
                : "Upgrade to Pro to unlock the full Kookaflow experience.")}
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="mt-1">
            <Sparkles className="mr-2 h-4 w-4" /> Upgrade to Pro
          </Button>
        </div>
      </div>
      <PaywallModal open={open} onOpenChange={setOpen} feature={feature} reason={reason} />
    </>
  );
}