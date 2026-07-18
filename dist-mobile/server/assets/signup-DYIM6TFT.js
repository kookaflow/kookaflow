import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import { A as AuthShell } from "./AuthShell-0mCXOHGQ.js";
import { A as AuthField, a as AuthSubmit } from "./AuthField-BpOW5rIn.js";
import { a as LegalFooterLinks } from "./LegalPage-CeqkTX9q.js";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { R as Route } from "./router-BND-OwId.js";
import "./label-DyyUUh84.js";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@supabase/supabase-js";
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
import "./createMiddleware-BvN2ghIY.js";
import "@radix-ui/react-slot";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
function SignupPage() {
  const navigate = useNavigate();
  const {
    next
  } = Route.useSearch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${next ?? "/calendar"}`,
        data: {
          full_name: fullName
        }
      }
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    if (data.user) {
      await supabase.from("profiles").update({
        full_name: fullName
      }).eq("id", data.user.id);
    }
    setLoading(false);
    if (data.session) {
      if (next) window.location.assign(next);
      else navigate({
        to: "/onboarding"
      });
    } else toast.success("Check your email to confirm your account");
  };
  return /* @__PURE__ */ jsx(AuthShell, { tagline: "Find your flow, whatever your hours", subtitle: "Create your account to get started", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "auth-field-in", style: {
      animationDelay: "0ms"
    }, children: /* @__PURE__ */ jsx(AuthField, { id: "name", label: "Full name", icon: User, required: true, value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Alex Morgan" }) }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in", style: {
      animationDelay: "80ms"
    }, children: /* @__PURE__ */ jsx(AuthField, { id: "email", label: "Email", icon: Mail, type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", placeholder: "you@example.com" }) }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in", style: {
      animationDelay: "160ms"
    }, children: /* @__PURE__ */ jsx(AuthField, { id: "password", label: "Password", icon: Lock, type: "password", togglePassword: true, required: true, value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "new-password", placeholder: "At least 6 characters" }) }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in", style: {
      animationDelay: "240ms"
    }, children: /* @__PURE__ */ jsx(AuthField, { id: "confirm", label: "Confirm password", icon: ShieldCheck, type: "password", togglePassword: true, required: true, value: confirm, onChange: (e) => setConfirm(e.target.value), autoComplete: "new-password", placeholder: "Re-enter password" }) }),
    /* @__PURE__ */ jsx("p", { className: "auth-field-in text-center text-xs font-medium text-emerald-600 dark:text-emerald-400", style: {
      animationDelay: "320ms"
    }, children: "✓ Free to start   ✓ No credit card required   ✓ Cancel anytime" }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in pt-1", style: {
      animationDelay: "400ms"
    }, children: /* @__PURE__ */ jsx(AuthSubmit, { disabled: loading, children: loading ? "Creating…" : "Create Account" }) }),
    /* @__PURE__ */ jsxs("p", { className: "auth-field-in text-center text-[11px] leading-relaxed text-muted-foreground", style: {
      animationDelay: "480ms"
    }, children: [
      "By creating an account you agree to our",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/terms", className: "text-primary hover:underline", children: "Terms of Service" }),
      " ",
      "and",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/privacy", className: "text-primary hover:underline", children: "Privacy Policy" }),
      "."
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "auth-field-in text-center text-sm text-muted-foreground", style: {
      animationDelay: "560ms"
    }, children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Sign in" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in pt-2", style: {
      animationDelay: "640ms"
    }, children: /* @__PURE__ */ jsx(LegalFooterLinks, {}) })
  ] }) });
}
export {
  SignupPage as component
};
