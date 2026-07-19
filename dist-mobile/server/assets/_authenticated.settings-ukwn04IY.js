import { jsxs, jsx } from "react/jsx-runtime";
import { P as PageHeader } from "./PageHeader-6NzEF-tS.js";
import { T as ThemeToggle } from "./ThemeToggle-DkD6ct3r.js";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-Bueegtn5.js";
import { I as Input } from "./input-BilhWrar.js";
import { L as Label } from "./label-BX49QBTb.js";
import { B as Button, c as cn } from "./router-CfW6Ca5m.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BeYbcYrv.js";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { UserCircle2, Briefcase, Check, KeyRound, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import "@radix-ui/react-label";
import "class-variance-authority";
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
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
import "@radix-ui/react-select";
const CURRENCIES = ["AUD", "USD", "GBP", "EUR", "NZD"];
function ProfileSection() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      const [{ data: profile }, { data: prefs }] = await Promise.all([
        supabase.from("profiles").select("full_name,job_role").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_preferences").select("hourly_rate,currency").eq("user_id", data.user.id).maybeSingle()
      ]);
      setFullName(profile?.full_name ?? "");
      setJobRole(profile?.job_role ?? "");
      setHourlyRate(prefs?.hourly_rate != null ? String(prefs.hourly_rate) : "");
      setCurrency(prefs?.currency ?? "AUD");
    })();
  }, []);
  async function save() {
    if (!userId) return;
    setSaving(true);
    try {
      const rateNum = hourlyRate === "" ? null : Number(hourlyRate);
      if (rateNum !== null && (Number.isNaN(rateNum) || rateNum < 0)) {
        toast.error("Hourly rate must be a positive number");
        return;
      }
      const [{ error: pErr }, { error: prefErr }] = await Promise.all([
        supabase.from("profiles").update({ full_name: fullName || null, job_role: jobRole || null }).eq("id", userId),
        supabase.from("user_preferences").update({ hourly_rate: rateNum, currency }).eq("user_id", userId)
      ]);
      if (pErr) throw pErr;
      if (prefErr) throw prefErr;
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(UserCircle2, { className: "size-4 text-primary" }),
        " Profile"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Your personal details and pay defaults." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "full_name", children: "Full name" }),
        /* @__PURE__ */ jsx(Input, { id: "full_name", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Your name" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(Input, { id: "email", value: email, readOnly: true, disabled: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "job_role", children: "Job role" }),
        /* @__PURE__ */ jsx(Input, { id: "job_role", value: jobRole, onChange: (e) => setJobRole(e.target.value), placeholder: "e.g. Nurse" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "rate", children: "Hourly rate" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "rate",
              type: "number",
              min: "0",
              step: "0.01",
              value: hourlyRate,
              onChange: (e) => setHourlyRate(e.target.value),
              placeholder: "0.00"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Currency" }),
          /* @__PURE__ */ jsxs(Select, { value: currency, onValueChange: setCurrency, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: CURRENCIES.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: save, disabled: saving, children: saving ? "Saving…" : "Save profile" }) })
    ] })
  ] });
}
const PATTERNS = [
  { id: "rotating", label: "Rotating", desc: "Mix of morning, afternoon and night" },
  { id: "fixed_morning", label: "Fixed Morning", desc: "Mostly morning shifts" },
  { id: "fixed_afternoon", label: "Fixed Afternoon", desc: "Mostly afternoon shifts" },
  { id: "fixed_night", label: "Fixed Night", desc: "Mostly night shifts" }
];
function ShiftPatternSection() {
  const [userId, setUserId] = useState(null);
  const [pattern, setPattern] = useState("rotating");
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: profile } = await supabase.from("profiles").select("shift_pattern").eq("id", data.user.id).maybeSingle();
      if (profile?.shift_pattern) setPattern(profile.shift_pattern);
    })();
  }, []);
  async function choose(id) {
    setPattern(id);
    if (!userId) return;
    const { error } = await supabase.from("profiles").update({ shift_pattern: id }).eq("id", userId);
    if (error) toast.error(error.message);
  }
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Briefcase, { className: "size-4 text-primary" }),
        " Shift Pattern"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "How your work week usually looks." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "grid gap-2 sm:grid-cols-2", children: PATTERNS.map((p) => {
      const active = pattern === p.id;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => choose(p.id),
          className: cn(
            "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
            active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent/40"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: p.label }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: p.desc })
            ] }),
            active && /* @__PURE__ */ jsx(Check, { className: "size-4 text-primary" })
          ]
        },
        p.id
      );
    }) })
  ] });
}
function SecuritySection() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  async function changePassword() {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== pw2) return toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPw("");
    setPw2("");
    toast.success("Password updated");
  }
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "size-4 text-primary" }),
        " Security"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Change your password and sign out." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-pw", children: "New password" }),
        /* @__PURE__ */ jsx(Input, { id: "new-pw", type: "password", value: pw, onChange: (e) => setPw(e.target.value), autoComplete: "new-password" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-pw2", children: "Confirm new password" }),
        /* @__PURE__ */ jsx(Input, { id: "new-pw2", type: "password", value: pw2, onChange: (e) => setPw2(e.target.value), autoComplete: "new-password" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: signOut, className: "gap-2", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "size-4" }),
          " Sign out"
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: changePassword, disabled: busy || !pw, children: busy ? "Updating…" : "Change password" })
      ] })
    ] })
  ] });
}
function SettingsPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Account", subtitle: "Your profile, shift pattern and security.", right: /* @__PURE__ */ jsx(ThemeToggle, {}) }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl p-4 sm:p-6", children: [
      /* @__PURE__ */ jsx(ProfileSection, {}),
      /* @__PURE__ */ jsx(ShiftPatternSection, {}),
      /* @__PURE__ */ jsx(SecuritySection, {})
    ] })
  ] });
}
export {
  SettingsPage as component
};
