import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { A as AuthShell } from "./AuthShell-0mCXOHGQ.js";
import { A as AuthField, a as AuthSubmit } from "./AuthField-BpOW5rIn.js";
import { a as LegalFooterLinks } from "./LegalPage-CeqkTX9q.js";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { a as Route } from "./router-BND-OwId.js";
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
function LoginPage() {
  const navigate = useNavigate();
  const {
    next
  } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (next) window.location.assign(next);
    else navigate({
      to: "/calendar"
    });
  };
  const sendReset = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setResetting(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setResetting(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for a reset link");
  };
  return /* @__PURE__ */ jsx(AuthShell, { tagline: "Find your flow, whatever your hours", subtitle: "Welcome back — sign in to continue", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "auth-field-in", style: {
      animationDelay: "0ms"
    }, children: /* @__PURE__ */ jsx(AuthField, { id: "email", label: "Email", icon: Mail, type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", placeholder: "you@example.com" }) }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in", style: {
      animationDelay: "80ms"
    }, children: /* @__PURE__ */ jsx(AuthField, { id: "password", label: "Password", icon: Lock, type: "password", togglePassword: true, required: true, value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", placeholder: "••••••••" }) }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in flex justify-end", style: {
      animationDelay: "160ms"
    }, children: /* @__PURE__ */ jsx("button", { type: "button", onClick: sendReset, disabled: resetting, className: "text-xs font-medium text-primary hover:underline", children: "Forgot your password?" }) }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in pt-1", style: {
      animationDelay: "240ms"
    }, children: /* @__PURE__ */ jsx(AuthSubmit, { disabled: loading, children: loading ? "Signing in…" : "Sign In" }) }),
    /* @__PURE__ */ jsxs("div", { className: "auth-field-in relative py-2", style: {
      animationDelay: "320ms"
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-border" }) }),
      /* @__PURE__ */ jsx("div", { className: "relative flex justify-center", children: /* @__PURE__ */ jsx("span", { className: "bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground", children: "or" }) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "auth-field-in text-center text-xs text-muted-foreground", style: {
      animationDelay: "400ms"
    }, children: "🔒 Secure • Private • No ads" }),
    /* @__PURE__ */ jsxs("p", { className: "auth-field-in text-center text-sm text-muted-foreground", style: {
      animationDelay: "480ms"
    }, children: [
      "New to Kookaflow?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/signup", search: next ? {
        next
      } : void 0, className: "font-medium text-primary hover:underline", children: "Create an account" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "auth-field-in pt-2", style: {
      animationDelay: "560ms"
    }, children: /* @__PURE__ */ jsx(LegalFooterLinks, {}) })
  ] }) });
}
export {
  LoginPage as component
};
