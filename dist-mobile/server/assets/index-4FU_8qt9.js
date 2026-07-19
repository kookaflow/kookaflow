import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { l as logo, B as Button } from "./router-CfW6Ca5m.js";
import "@tanstack/react-query";
import "react";
import "./client-BiJkZOJ7.js";
import "@supabase/supabase-js";
import "lucide-react";
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
const BRAND_GRADIENT = "linear-gradient(135deg, #251074 0%, #7e294d 45%, #fb862a 80%, #ffc338 100%)";
const FEATURES = [{
  icon: "🗓️",
  title: "Smart Shift Calendar",
  body: "Month, week and day views with a quick-add stamp panel."
}, {
  icon: "📊",
  title: "Life Balance Dashboard",
  body: "See your balance score across work, rest, wellness and family."
}, {
  icon: "🌿",
  title: "Wellness Nudges",
  body: "Gentle reminders to rest, exercise and connect with loved ones."
}, {
  icon: "📧",
  title: "Daily Summaries",
  body: "Beautiful morning emails showing your day ahead."
}, {
  icon: "📅",
  title: "Google Calendar Sync",
  body: "Import your Google Calendar alongside your shifts."
}, {
  icon: "💰",
  title: "Earnings Tracker",
  body: "Automatically calculate your shift earnings."
}];
const PLANS = [{
  name: "Free Trial",
  price: "14 days",
  sub: "Full access, no card required"
}, {
  name: "Basic",
  price: "$2.99",
  sub: "AUD / month"
}, {
  name: "Pro",
  price: "$4.99",
  sub: "AUD / month  •  or $29.99 / year"
}, {
  name: "Lifetime",
  price: "$59.99",
  sub: "AUD one-time"
}];
const PROFESSIONS = [{
  icon: "👩‍⚕️",
  label: "Nurses and midwives"
}, {
  icon: "🚑",
  label: "Paramedics and ambos"
}, {
  icon: "🏭",
  label: "Factory and manufacturing workers"
}, {
  icon: "🔒",
  label: "Security officers"
}, {
  icon: "🏨",
  label: "Hospitality staff"
}, {
  icon: "🚌",
  label: "Transport workers"
}];
function LandingPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("section", { className: "relative overflow-hidden px-6 pb-24 pt-16 text-white", style: {
      background: BRAND_GRADIENT
    }, children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-4xl flex-col items-center text-center", children: [
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Kookaflow", className: "mb-6 h-28 w-auto object-contain drop-shadow-lg sm:h-32" }),
      /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl", style: {
        textShadow: "0 2px 12px rgba(0,0,0,0.3)"
      }, children: "Kookaflow" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-xl font-medium text-white/95 sm:text-2xl", children: "Find your flow, whatever your hours" }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-base text-white/90 sm:text-lg", children: "The shift calendar that cares about your whole life, not just your shifts. Built for nurses, paramedics, and every shift worker who deserves better." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", className: "bg-white text-[#251074] hover:bg-white/90 [background:white]", children: /* @__PURE__ */ jsx(Link, { to: "/signup", children: "Start Free 14-Day Trial" }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "border-white/70 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Sign In" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "px-6 py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-bold tracking-tight sm:text-4xl", children: "Everything a shift worker needs" }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: FEATURES.map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl", children: f.icon }),
        /* @__PURE__ */ jsx("h3", { className: "mt-3 text-lg font-semibold", children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.body })
      ] }, f.title)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-muted/30 px-6 py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-bold tracking-tight sm:text-4xl", children: "Simple, fair pricing" }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: PLANS.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col rounded-2xl border border-border bg-card p-6 text-center shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium uppercase tracking-wider text-muted-foreground", children: p.name }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-bold", children: p.price }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-muted-foreground", children: p.sub })
      ] }, p.name)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 flex justify-center", children: /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsx(Link, { to: "/signup", children: "Start Free Trial" }) }) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "px-6 py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-bold tracking-tight sm:text-4xl", children: "Built for shift workers" }),
      /* @__PURE__ */ jsx("ul", { className: "mt-10 grid gap-4 sm:grid-cols-2", children: PROFESSIONS.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: p.icon }),
        /* @__PURE__ */ jsx("span", { className: "text-base", children: p.label })
      ] }, p.label)) }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-center text-muted-foreground", children: "And anyone working irregular hours." })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "px-6 py-12 text-white", style: {
      background: BRAND_GRADIENT
    }, children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl flex-col items-center gap-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold tracking-tight", children: "Kookaflow" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90", children: "Find your flow, whatever your hours" }),
      /* @__PURE__ */ jsxs("nav", { className: "mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm", children: [
        /* @__PURE__ */ jsx(Link, { to: "/privacy", className: "text-white/90 hover:text-white hover:underline", children: "Privacy Policy" }),
        /* @__PURE__ */ jsx(Link, { to: "/terms", className: "text-white/90 hover:text-white hover:underline", children: "Terms of Service" }),
        /* @__PURE__ */ jsx(Link, { to: "/support", className: "text-white/90 hover:text-white hover:underline", children: "Support" }),
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-white/90 hover:text-white hover:underline", children: "Sign In" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 text-xs text-white/70", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Kookaflow. All rights reserved."
      ] })
    ] }) })
  ] });
}
export {
  LandingPage as component
};
