import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { l as logo, c as cn, B as Button } from "./router-BND-OwId.js";
import { I as Input } from "./input-COyQ-O9p.js";
import { L as Label } from "./label-DyyUUh84.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CvjQng6i.js";
import { Check } from "lucide-react";
import { s as supabase } from "./client-BiJkZOJ7.js";
import "@tanstack/react-query";
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
import "@radix-ui/react-label";
import "@radix-ui/react-select";
const JOB_ROLES = ["Nurse", "Paramedic", "Doctor", "Factory Worker", "Security Officer", "Retail Worker", "Hospitality Staff", "Transport Worker", "Teacher", "Other"];
const SHIFT_PATTERNS = [{
  id: "rotating",
  label: "Rotating",
  desc: "Mix of morning, afternoon and night"
}, {
  id: "fixed_morning",
  label: "Fixed Morning",
  desc: "Mostly morning shifts"
}, {
  id: "fixed_afternoon",
  label: "Fixed Afternoon",
  desc: "Mostly afternoon shifts"
}, {
  id: "fixed_night",
  label: "Fixed Night",
  desc: "Mostly night shifts"
}];
const THEMES = [{
  id: "slate",
  label: "Slate",
  swatch: "from-slate-500 to-slate-700"
}, {
  id: "midnight",
  label: "Midnight",
  swatch: "from-indigo-900 to-purple-700"
}, {
  id: "lavender",
  label: "Lavender",
  swatch: "from-purple-400 to-pink-400"
}, {
  id: "forest",
  label: "Forest",
  swatch: "from-emerald-600 to-green-800"
}];
function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [shiftPattern, setShiftPattern] = useState("rotating");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [theme, setTheme] = useState("midnight");
  const [saving, setSaving] = useState(false);
  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = async () => {
    setSaving(true);
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) {
      setSaving(false);
      return navigate({
        to: "/login"
      });
    }
    const userId = u.user.id;
    const [p1, p2] = await Promise.all([supabase.from("profiles").update({
      full_name: fullName || null,
      job_role: jobRole || null,
      shift_pattern: shiftPattern,
      onboarded_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId), supabase.from("user_preferences").update({
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      currency,
      theme
    }).eq("user_id", userId)]);
    setSaving(false);
    if (p1.error || p2.error) {
      toast.error(p1.error?.message ?? p2.error?.message ?? "Failed to save");
      return;
    }
    toast.success("All set!");
    navigate({
      to: "/calendar"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center gap-3 px-6 pb-16 pt-10 text-center text-white", style: {
      background: "var(--brand-gradient)"
    }, children: [
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Kookaflow", style: {
        height: 80,
        width: "auto"
      }, className: "object-contain" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Welcome to Kookaflow" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/80", children: "Find your flow, whatever your hours" }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 flex items-center justify-center gap-2", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: {
        background: i === step ? "var(--brand-highlight)" : "rgba(255,255,255,0.4)"
      } }, i)) }),
      /* @__PURE__ */ jsx("svg", { "aria-hidden": true, viewBox: "0 0 1440 80", preserveAspectRatio: "none", className: "absolute -bottom-px left-0 h-[60px] w-full text-background", children: /* @__PURE__ */ jsx("path", { d: "M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z", fill: "currentColor" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-start justify-center px-4 py-8", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-md space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 shadow-sm", children: [
      step === 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "What's your name?" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "We'll use this to personalise your dashboard." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full name" }),
          /* @__PURE__ */ jsx(Input, { id: "name", value: fullName, onChange: (e) => setFullName(e.target.value), autoFocus: true })
        ] })
      ] }),
      step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "What do you do?" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Pick a role or type your own." })
        ] }),
        /* @__PURE__ */ jsx(Input, { value: jobRole, onChange: (e) => setJobRole(e.target.value), placeholder: "Your role" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: JOB_ROLES.map((r) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setJobRole(r), className: cn("rounded-full border px-3 py-1 text-xs transition", jobRole === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"), children: r }, r)) })
      ] }),
      step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Your shift pattern" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "We can change this later." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: SHIFT_PATTERNS.map((p) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setShiftPattern(p.id), className: cn("rounded-xl border p-3 text-left transition", shiftPattern === p.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"), children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: p.label }),
            shiftPattern === p.id && /* @__PURE__ */ jsx(Check, { className: "size-4 text-primary" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: p.desc })
        ] }, p.id)) })
      ] }),
      step === 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Default hourly rate" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "For tracking earnings. You can skip this." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2 space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Rate" }),
            /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", value: hourlyRate, onChange: (e) => setHourlyRate(e.target.value), placeholder: "42.50" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Currency" }),
            /* @__PURE__ */ jsxs(Select, { value: currency, onValueChange: setCurrency, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsx(SelectContent, { children: ["AUD", "USD", "GBP", "EUR", "NZD"].map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] })
        ] })
      ] }),
      step === 4 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Pick a theme" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "You can change this in Settings any time." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: THEMES.map((t) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setTheme(t.id), className: cn("overflow-hidden rounded-xl border transition", theme === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"), children: [
          /* @__PURE__ */ jsx("div", { className: cn("h-16 bg-gradient-to-br", t.swatch) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: t.label }),
            theme === t.id && /* @__PURE__ */ jsx(Check, { className: "size-3 text-primary" })
          ] })
        ] }, t.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex justify-between gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: back, disabled: step === 0 || saving, children: "Back" }),
        step < 4 ? /* @__PURE__ */ jsx(Button, { type: "button", onClick: next, children: "Next" }) : /* @__PURE__ */ jsx(Button, { type: "button", onClick: finish, disabled: saving, children: saving ? "Saving…" : "Finish" })
      ] })
    ] }) }) })
  ] });
}
export {
  OnboardingPage as component
};
