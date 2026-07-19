import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { u as useServerFn, B as Button } from "./router-CfW6Ca5m.js";
import { Sparkles, Loader2, X } from "lucide-react";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-DkTnvVPY.js";
import { toast } from "sonner";
import { c as createCheckoutSession } from "./stripe.functions-HdK7T6FJ.js";
const PLANS = [
  {
    key: "pro_yearly",
    name: "Pro Yearly",
    price: "$29.99",
    cadence: "AUD / year",
    highlight: "Best value — save 50%",
    description: "All features. Cancel anytime."
  },
  {
    key: "lifetime",
    name: "Lifetime Pro",
    price: "$59.99",
    cadence: "AUD one-time",
    highlight: "Pay once, own it",
    description: "All features forever. No recurring charge."
  },
  {
    key: "pro_monthly",
    name: "Pro Monthly",
    price: "$4.99",
    cadence: "AUD / month",
    description: "All features. Cancel anytime."
  },
  {
    key: "basic",
    name: "Basic",
    price: "$2.99",
    cadence: "AUD / month",
    description: "Core calendar + shift tracking only. Cancel anytime."
  }
];
function PaywallModal({ open, onOpenChange, feature, reason }) {
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const headline = reason === "trial-expired" ? "Your 14-day trial has ended" : reason === "basic-locked" ? "This feature is part of Pro" : feature ? `Unlock ${feature}` : "Upgrade to keep going";
  const subhead = reason === "trial-expired" ? "Pick a plan to keep your calendar, shifts, and dashboard intact." : "Your data is safe — upgrade to unlock everything Kookaflow can do.";
  async function handlePick(plan) {
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
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2 text-2xl", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6 text-primary" }),
        headline
      ] }),
      /* @__PURE__ */ jsx(DialogDescription, { children: subhead })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: PLANS.map((p) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled: loadingPlan !== null,
        onClick: () => handlePick(p.key),
        className: "group relative flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-accent/40 disabled:opacity-60",
        children: [
          p.highlight && /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-3 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary", children: p.highlight }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: p.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-semibold text-foreground", children: p.price }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: p.cadence })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: p.description }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary", children: loadingPlan === p.key ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
            " Opening checkout…"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Choose ",
            p.name,
            " →"
          ] }) })
        ]
      },
      p.key
    )) }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "flex-row items-center justify-between gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => {
            onOpenChange(false);
            navigate({ to: "/pricing" });
          },
          children: "See full comparison"
        }
      ),
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
