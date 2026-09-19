import { useCallback, useState, type ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { PaywallModal } from "./PaywallModal";

export interface UpgradePrompt {
  /**
   * Gate a Pro-only action. Returns true when the user has Pro access and the
   * caller should proceed; otherwise opens the upgrade prompt and returns false.
   * Usage: `if (!requirePro("Google Calendar sync")) return;`
   */
  requirePro: (feature: string) => boolean;
  /** Render once near the gated control: `{upgradeModal}` */
  upgradeModal: ReactNode;
}

/**
 * Reusable upgrade prompt for Pro-only features. Works for any current or
 * future tier restriction: call `requirePro("Feature name")` at the click/tap
 * point and render `upgradeModal` once in the component tree.
 *
 * During the trial, `hasProAccess` is true, so nothing is gated. Basic and
 * expired users see the paywall with simple "Upgrade to Pro for …" messaging.
 */
export function useUpgradePrompt(): UpgradePrompt {
  const sub = useSubscription();
  const [prompt, setPrompt] = useState<{
    open: boolean;
    feature?: string;
    reason?: "trial-expired" | "basic-locked";
  }>({ open: false });

  const requirePro = useCallback(
    (feature: string): boolean => {
      // While loading or signed out, never block the action.
      if (sub.loading || !sub.signedIn) return true;
      if (sub.hasProAccess) return true;
      const expired = sub.tier === "expired" || (!sub.isTrialing && sub.tier === "trial");
      setPrompt({ open: true, feature, reason: expired ? "trial-expired" : "basic-locked" });
      return false;
    },
    [sub.loading, sub.signedIn, sub.hasProAccess, sub.tier, sub.isTrialing],
  );

  const upgradeModal = (
    <PaywallModal
      open={prompt.open}
      onOpenChange={(open) => setPrompt((p) => ({ ...p, open }))}
      feature={prompt.feature}
      reason={prompt.reason}
    />
  );

  return { requirePro, upgradeModal };
}
