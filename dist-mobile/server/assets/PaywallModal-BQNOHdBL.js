import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { u as useServerFn, B as Button } from "./router-BMYXcJPh.js";
import { Sparkles, Loader2, RotateCcw, X } from "lucide-react";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CTN_U-Xf.js";
import { toast } from "sonner";
import { c as createCheckoutSession } from "./stripe.functions-Br2uQGca.js";
import { g as getRevenueCatPlans, p as purchaseRevenueCatPlan, r as restoreRevenueCatPurchases } from "./revenuecat-DysiFGY1.js";
const NATIVE_COPY = {
  pro_yearly: {
    name: "Pro Yearly",
    highlight: "Best value — save 50%",
    description: "All features. Cancel anytime."
  },
  lifetime: {
    name: "Lifetime Pro",
    highlight: "Pay once, own it",
    description: "All features forever. No recurring charge."
  },
  pro_monthly: { name: "Pro Monthly", description: "All features. Cancel anytime." },
  basic_monthly: {
    name: "Basic",
    description: "Core calendar + shift tracking only. Cancel anytime."
  }
};
function PaywallModal({ open, onOpenChange, feature, reason }) {
  useNavigate();
  useServerFn(createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [nativePlans, setNativePlans] = useState(null);
  const [nativeLoading, setNativeLoading] = useState(false);
  const [nativeBusy, setNativeBusy] = useState(null);
  const [restoring, setRestoring] = useState(false);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setNativeLoading(true);
    void (async () => {
      const plans = await getRevenueCatPlans();
      if (cancelled) return;
      setNativePlans(plans);
      setNativeLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);
  const headline = reason === "trial-expired" ? "Your 14-day trial has ended" : reason === "basic-locked" ? "This feature is part of Pro" : feature ? `Unlock ${feature}` : "Upgrade to keep going";
  const subhead = reason === "trial-expired" ? "Pick a plan to keep your calendar, shifts, and dashboard intact." : "Your data is safe — upgrade to unlock everything Kookaflow can do.";
  async function handleNativePick(plan) {
    console.log("[paywall] native pick", {
      identifier: plan.identifier,
      productId: plan.productId,
      priceString: plan.priceString
    });
    const busyKey = plan.productId || plan.identifier;
    setNativeBusy(busyKey);
    const res = await purchaseRevenueCatPlan(plan);
    setNativeBusy(null);
    if (res.status === "purchased") {
      toast.success("You're all set — thanks for upgrading!");
      onOpenChange(false);
      return;
    }
    if (res.status === "cancelled") return;
    toast.error(res.message);
  }
  async function handleRestore() {
    setRestoring(true);
    const res = await restoreRevenueCatPurchases();
    setRestoring(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    if (res.entitlements.pro || res.entitlements.basic) {
      toast.success("Purchases restored.");
      onOpenChange(false);
    } else {
      toast.info("No previous purchases found for this Apple ID.");
    }
  }
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2 text-2xl", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6 text-primary" }),
        headline
      ] }),
      /* @__PURE__ */ jsx(DialogDescription, { children: subhead })
    ] }),
    nativeLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
      " Loading plans…"
    ] }) : nativePlans && nativePlans.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: nativePlans.map((p) => {
      const copy = NATIVE_COPY[p.identifier];
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          disabled: nativeBusy !== null || restoring,
          onClick: () => void handleNativePick(p),
          className: "group relative flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-accent/40 disabled:opacity-60",
          children: [
            copy?.highlight && /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-3 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary", children: copy.highlight }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: copy?.name ?? p.title }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl font-semibold text-foreground", children: p.priceString }),
              p.periodLabel && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: p.periodLabel })
            ] }),
            copy?.description && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: copy.description }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary", children: nativeBusy === (p.productId || p.identifier) ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
              " Processing…"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Choose ",
              copy?.name ?? p.title,
              " →"
            ] }) })
          ]
        },
        p.productId || p.identifier
      );
    }) }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-6 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Purchases are unavailable right now" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "The App Store didn’t return any plans. Check your connection and try again, or restore a purchase you’ve already made." }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "mt-4",
          disabled: restoring,
          onClick: () => void handleRestore(),
          children: restoring ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-1 h-4 w-4 animate-spin" }),
            " Restoring…"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "mr-1 h-4 w-4" }),
            " Restore purchases"
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "flex-row items-center justify-between gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", disabled: restoring, onClick: () => void handleRestore(), children: restoring ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-1 h-4 w-4 animate-spin" }),
        " Restoring…"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(RotateCcw, { className: "mr-1 h-4 w-4" }),
        " Restore purchases"
      ] }) }),
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onOpenChange(false), children: [
        /* @__PURE__ */ jsx(X, { className: "mr-1 h-4 w-4" }),
        " Not now"
      ] })
    ] })
  ] }) });
}
export {
  PaywallModal as P
};
