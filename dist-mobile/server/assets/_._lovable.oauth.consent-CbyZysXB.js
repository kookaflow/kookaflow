import { jsx, jsxs } from "react/jsx-runtime";
import { e as Route, o as oauthClient } from "./router-CfW6Ca5m.js";
import { useState } from "react";
import { A as AuthShell } from "./AuthShell-B1_D-oGh.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
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
function Consent() {
  const details = Route.useLoaderData();
  const {
    authorization_id
  } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function decide(approve) {
    setBusy(true);
    setError(null);
    const call = approve ? oauthClient().auth.oauth.approveAuthorization(authorization_id) : oauthClient().auth.oauth.denyAuthorization(authorization_id);
    const {
      data,
      error: error2
    } = await call;
    if (error2) {
      setBusy(false);
      setError(error2.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }
  const clientName = details?.client?.name ?? "an app";
  return /* @__PURE__ */ jsx(AuthShell, { tagline: "Connect an app", subtitle: `Allow ${clientName} to use Kookaflow as you?`, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: clientName }),
      " will be able to call Kookaflow's enabled tools (read your calendar and create events) while you are signed in. This does not bypass Kookaflow's permissions."
    ] }),
    error && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", disabled: busy, onClick: () => decide(true), className: "flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50", children: busy ? "Working…" : "Approve" }),
      /* @__PURE__ */ jsx("button", { type: "button", disabled: busy, onClick: () => decide(false), className: "flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent/40 disabled:opacity-50", children: "Cancel connection" })
    ] })
  ] }) });
}
export {
  Consent as component
};
