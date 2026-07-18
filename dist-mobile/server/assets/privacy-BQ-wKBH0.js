import { jsxs, jsx } from "react/jsx-runtime";
import { L as LegalPage } from "./LegalPage-CeqkTX9q.js";
import "@tanstack/react-router";
import "lucide-react";
import "./router-BND-OwId.js";
import "@tanstack/react-query";
import "react";
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
function PrivacyPage() {
  return /* @__PURE__ */ jsxs(LegalPage, { title: "Privacy Policy", subtitle: "Last updated: May 2026", children: [
    /* @__PURE__ */ jsx("p", { children: 'Kookaflow ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have.' }),
    /* @__PURE__ */ jsx("h2", { children: "What data we collect" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsx("li", { children: "Account details: your name and email address." }),
      /* @__PURE__ */ jsx("li", { children: "Profile information: job role and shift pattern." }),
      /* @__PURE__ */ jsx("li", { children: "Calendar content: life events, activities, and shift schedule." }),
      /* @__PURE__ */ jsx("li", { children: "Financial preferences: hourly rate, used to calculate earnings." }),
      /* @__PURE__ */ jsx("li", { children: "Device push notification token, if you enable notifications." }),
      /* @__PURE__ */ jsx("li", { children: "Google Calendar events, only if you choose to connect your Google account." })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Google User Data" }),
    /* @__PURE__ */ jsx("p", { children: "Kookaflow integrates with Google Calendar via OAuth 2.0. When you connect your Google account, Kookaflow requests read-only access to your Google Calendar data (scope: calendar.readonly)." }),
    /* @__PURE__ */ jsx("p", { children: "What we access: Calendar event titles, dates, times, and descriptions from your Google Calendar." }),
    /* @__PURE__ */ jsx("p", { children: "What we do NOT do:" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsx("li", { children: "We do not write to, modify, or delete your Google Calendar events." }),
      /* @__PURE__ */ jsx("li", { children: "We do not sell your Google Calendar data to third parties." }),
      /* @__PURE__ */ jsx("li", { children: "We do not share your Google Calendar data with any third parties." }),
      /* @__PURE__ */ jsx("li", { children: "We do not use your Google Calendar data to train AI or machine learning models." }),
      /* @__PURE__ */ jsx("li", { children: "We do not transfer your Google Calendar data except as necessary to provide the Kookaflow service." })
    ] }),
    /* @__PURE__ */ jsx("p", { children: "Data storage: Google Calendar data is accessed in real time to display events in your Kookaflow calendar. We store only the minimum data necessary to display your schedule within the app." }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Revoking access: You can disconnect Google Calendar at any time from the More tab in Kookaflow, or by visiting your Google Account permissions at",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://myaccount.google.com/permissions", target: "_blank", rel: "noopener noreferrer", children: "myaccount.google.com/permissions" }),
      "."
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "How we use your data" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsx("li", { children: "To provide the calendar, shift management, and life-balance features." }),
      /* @__PURE__ */ jsx("li", { children: "To send daily and weekly reminders you have opted into." }),
      /* @__PURE__ */ jsx("li", { children: "To calculate wellness and balance scores based on your activity." }),
      /* @__PURE__ */ jsx("li", { children: "To keep the service secure and to fix bugs." })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Third-party services" }),
    /* @__PURE__ */ jsx("p", { children: "We rely on a small set of trusted providers to deliver Kookaflow:" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Supabase" }),
        " — database and authentication."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Resend" }),
        " — email delivery for reminders and account emails."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "OneSignal" }),
        " — push notifications."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Google Calendar API" }),
        " — only if you connect your Google account."
      ] })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Data storage" }),
    /* @__PURE__ */ jsx("p", { children: "Your data is stored securely on Supabase servers and protected by row-level security so that only you can access your information." }),
    /* @__PURE__ */ jsx("h2", { children: "Your rights" }),
    /* @__PURE__ */ jsx("p", { children: "You can access, correct, export, or delete your data at any time. You may delete your account from Settings, or contact us for a copy of your data." }),
    /* @__PURE__ */ jsx("h2", { children: "Contact" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Questions about this policy? Email",
      " ",
      /* @__PURE__ */ jsx("a", { href: "mailto:support@kookaflow.com", children: "support@kookaflow.com" }),
      "."
    ] })
  ] });
}
export {
  PrivacyPage as component
};
