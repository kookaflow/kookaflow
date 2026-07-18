import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { B as Button } from "./router-BND-OwId.js";
import { u as useSubscription } from "./useSubscription-BCGIZOhs.js";
import "@tanstack/react-query";
import "./client-BiJkZOJ7.js";
import "@supabase/supabase-js";
import "clsx";
import "tailwind-merge";
import "react-onesignal";
import "./server-DjzWdpJV.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "./auth-middleware-DFGJyMRd.js";
import "./createMiddleware-BvN2ghIY.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "sonner";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
function ProSuccessPage() {
  const sub = useSubscription();
  useEffect(() => {
    if (sub.tier === "pro" || sub.tier === "lifetime" || sub.tier === "basic") return;
    const id = setInterval(() => {
      void sub.refresh();
    }, 1500);
    const timeout = setTimeout(() => clearInterval(id), 1e4);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, [sub]);
  const tierLabel = sub.tier === "lifetime" ? "Lifetime Pro" : sub.tier === "pro" ? "Pro" : sub.tier === "basic" ? "Basic" : "your plan";
  return /* @__PURE__ */ jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-16", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8 text-primary" }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "You're all set!" }),
    /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      "Thanks for upgrading to ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: tierLabel }),
      ". Your account is being updated — this usually takes just a few seconds."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/calendar", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
        " Go to your calendar"
      ] }) }),
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", children: /* @__PURE__ */ jsx(Link, { to: "/settings", children: "Manage subscription" }) })
    ] })
  ] }) });
}
export {
  ProSuccessPage as component
};
