import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { c as cn, u as useServerFn, B as Button } from "./router-ZWedUCvR.js";
import { X, Sparkles, Loader2, RotateCcw } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { c as createCheckoutSession } from "./stripe.functions-DBiq11q0.js";
import { d as getRevenueCatPlans, p as purchaseRevenueCatPlan, r as restoreRevenueCatPurchases } from "./revenuecat-Da4vgBSD.js";
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, showCloseButton = true, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] min-w-0 max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-x-hidden overflow-y-auto overscroll-contain border bg-background p-6 shadow-lg duration-200 [-webkit-overflow-scrolling:touch] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        showCloseButton && /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
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
  const headline = reason === "trial-expired" ? "Your 14-day trial has ended" : reason === "basic-locked" ? feature ? `Upgrade to Pro for ${feature}` : "This feature is part of Pro" : feature ? `Unlock ${feature}` : "Upgrade to keep going";
  const subhead = reason === "trial-expired" ? "Pick a plan to keep your calendar, shifts, and dashboard intact." : "Your data is safe — upgrade to unlock everything Kookaflow can do.";
  async function handleNativePick(plan) {
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
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { showCloseButton: false, className: "flex max-w-2xl flex-col gap-0 overflow-hidden max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem)] p-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { className: "min-w-0 text-left", children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex min-w-0 items-start gap-2 break-words text-xl sm:text-2xl", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6 shrink-0 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 break-words", children: headline })
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "break-words", children: subhead })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "shrink-0", "aria-label": "Close paywall", title: "Close", onClick: () => onOpenChange(false), children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-6", children: nativeLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
      " Loading plans…"
    ] }) : nativePlans && nativePlans.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid min-w-0 gap-3 sm:grid-cols-2", children: nativePlans.map((p) => {
      const copy = NATIVE_COPY[p.identifier];
      return /* @__PURE__ */ jsxs(
        Button,
        {
          type: "button",
          disabled: nativeBusy !== null || restoring,
          onClick: () => void handleNativePick(p),
          variant: "outline",
          className: "group relative h-auto w-full min-w-0 max-w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-lg border-border bg-card p-4 text-left transition hover:border-primary hover:bg-accent/40 disabled:opacity-60",
          children: [
            copy?.highlight && /* @__PURE__ */ jsx("span", { className: "max-w-full rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary", children: copy.highlight }),
            /* @__PURE__ */ jsx("div", { className: "max-w-full break-words text-sm font-medium text-foreground", children: copy?.name ?? p.title }),
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 max-w-full flex-wrap items-baseline gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "min-w-0 break-words text-2xl font-semibold text-foreground", children: p.priceString }),
              p.periodLabel && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: p.periodLabel })
            ] }),
            copy?.description && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: copy.description }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 inline-flex min-w-0 max-w-full flex-wrap items-center gap-1 text-xs font-medium text-primary", children: nativeBusy === (p.productId || p.identifier) ? /* @__PURE__ */ jsxs(Fragment, { children: [
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
    ] }) }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "z-10 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1 border-t bg-background px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex sm:justify-between sm:px-6", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-auto min-h-9 min-w-0 justify-start whitespace-normal text-left", disabled: restoring, onClick: () => void handleRestore(), children: restoring ? /* @__PURE__ */ jsxs(Fragment, { children: [
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
  Dialog as D,
  PaywallModal as P,
  DialogContent as a,
  DialogHeader as b,
  DialogTitle as c,
  DialogDescription as d,
  DialogFooter as e
};
