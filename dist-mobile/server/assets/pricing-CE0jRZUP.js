import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { u as useServerFn, B as Button } from "./router-CfW6Ca5m.js";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { c as createCheckoutSession } from "./stripe.functions-HdK7T6FJ.js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "react-onesignal";
import "./server-CYeycCdn.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "./auth-middleware-COIRGScg.js";
import "@supabase/supabase-js";
import "./createMiddleware-BvN2ghIY.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
const TIERS = [{
  key: "basic",
  name: "Basic",
  price: "$2.99",
  cadence: "AUD / month",
  features: ["Calendar & shift tracking", "Shift templates", "Public holidays", "Email reminders"],
  cta: "Get Basic"
}, {
  key: "pro_monthly",
  name: "Pro Monthly",
  price: "$4.99",
  cadence: "AUD / month",
  features: ["Everything in Basic", "Life-balance dashboard", "Wellness nudges", "Google Calendar sync", "SMS reminders", "Push notifications"],
  cta: "Start Pro Monthly"
}, {
  key: "pro_yearly",
  name: "Pro Yearly",
  price: "$29.99",
  cadence: "AUD / year",
  features: ["Everything in Pro Monthly", "Save 50% vs monthly", "Priority support"],
  cta: "Start Pro Yearly",
  highlight: "Save 50%",
  recommended: true
}, {
  key: "lifetime",
  name: "Lifetime Pro",
  price: "$59.99",
  cadence: "AUD one-time",
  features: ["Everything in Pro", "Pay once, own it forever", "All future Pro features"],
  cta: "Get Lifetime",
  highlight: "Best long-term value"
}];
function PricingPage() {
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState(null);
  async function handlePick(plan) {
    try {
      setLoadingPlan(plan);
      const {
        data: userData
      } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({
          to: "/login",
          search: {
            redirect: "/pricing"
          }
        });
        return;
      }
      const res = await checkout({
        data: {
          plan
        }
      });
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
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-background px-4 py-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-12 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
        " 14-day free trial — no credit card required"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-semibold tracking-tight text-foreground sm:text-5xl", children: "Simple pricing for shift workers" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-3 max-w-2xl text-base text-muted-foreground", children: "Try every Pro feature free for 14 days. After that, pick the plan that fits your life. All prices in AUD." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: TIERS.map((t) => /* @__PURE__ */ jsxs("div", { className: `relative flex flex-col rounded-2xl border bg-card p-6 ${t.recommended ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`, children: [
      t.highlight && /* @__PURE__ */ jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground", children: t.highlight }),
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: t.name }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-4xl font-semibold text-foreground", children: t.price }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: t.cadence })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "mt-5 flex-1 space-y-2 text-sm text-foreground", children: t.features.map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
        /* @__PURE__ */ jsx("span", { children: f })
      ] }, f)) }),
      /* @__PURE__ */ jsx(Button, { className: "mt-6 w-full", variant: t.recommended ? "default" : "outline", disabled: loadingPlan !== null, onClick: () => handlePick(t.key), children: loadingPlan === t.key ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Opening checkout…"
      ] }) : t.cta })
    ] }, t.key)) }),
    /* @__PURE__ */ jsxs("p", { className: "mt-10 text-center text-xs text-muted-foreground", children: [
      "Already a customer?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Sign in" }),
      "."
    ] })
  ] }) });
}
export {
  PricingPage as component
};
