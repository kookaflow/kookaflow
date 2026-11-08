import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { A as AuthShell } from "./AuthShell-BqlgC_Gn.js";
import { B as Button } from "./router-C_zvVCQQ.js";
import { I as Input } from "./input-BmQN7L_A.js";
import { L as Label } from "./label-Czvb_wkq.js";
import { s as supabase } from "./client-cQp9FZyJ.js";
import "@tanstack/react-query";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "./server-ByrTSFfk.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "@tanstack/react-router/ssr/server";
import "zod";
import "./auth-middleware-diYpcNXl.js";
import "@supabase/supabase-js";
import "@capacitor/core";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-BJYB10a6.js";
import "crypto";
import "./push.server-DLAoPm14.js";
import "./revenuecat.server-BDbresy-.js";
import "./stripe.server-BP8E5IMg.js";
import "stripe";
import "@radix-ui/react-label";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsx(AuthShell, { tagline: "Set a new password", subtitle: "Choose a strong password to secure your account", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "new", children: "New password" }),
      /* @__PURE__ */ jsx(Input, { id: "new", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "new-password" })
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Saving…" : "Update password" })
  ] }) });
}
export {
  ResetPasswordPage as component
};
