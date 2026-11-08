import { jsxs, jsx } from "react/jsx-runtime";
import { L as LegalPage } from "./LegalPage-CKRxA5LZ.js";
import "react";
import "@tanstack/react-router";
import "lucide-react";
import "./router-C_zvVCQQ.js";
import "@tanstack/react-query";
import "./client-cQp9FZyJ.js";
import "@supabase/supabase-js";
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
import "@capacitor/core";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "sonner";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-BJYB10a6.js";
import "crypto";
import "./push.server-DLAoPm14.js";
import "./revenuecat.server-BDbresy-.js";
import "./stripe.server-BP8E5IMg.js";
import "stripe";
function DeleteAccountPage() {
  return /* @__PURE__ */ jsxs(LegalPage, { title: "Delete your account", subtitle: "Kookaflow · developed by Bluegum Studio", children: [
    /* @__PURE__ */ jsxs("p", { children: [
      "This page explains how to delete your ",
      /* @__PURE__ */ jsx("strong", { children: "Kookaflow" }),
      " account and the data linked to it. Kookaflow is developed by ",
      /* @__PURE__ */ jsx("strong", { children: "Bluegum Studio" }),
      "."
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Delete your account in the app" }),
    /* @__PURE__ */ jsxs("ol", { children: [
      /* @__PURE__ */ jsx("li", { children: "Open Kookaflow and sign in." }),
      /* @__PURE__ */ jsxs("li", { children: [
        "Go to ",
        /* @__PURE__ */ jsx("strong", { children: "More → Danger Zone → Delete Account" }),
        "."
      ] }),
      /* @__PURE__ */ jsx("li", { children: "Confirm. Your account and data are deleted immediately and permanently." })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Request deletion without the app" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Email ",
      /* @__PURE__ */ jsx("a", { href: "mailto:hello@kookaflow.com?subject=Delete%20my%20account", children: "hello@kookaflow.com" }),
      " ",
      'from the email address you use for your Kookaflow account, with the subject "Delete my account". We will verify the request, delete your account within',
      /* @__PURE__ */ jsx("strong", { children: " 30 days" }),
      ", and confirm by email."
    ] }),
    /* @__PURE__ */ jsx("h2", { id: "delete-some-data", children: "Delete some of your data without deleting your account" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsx("li", { children: "Delete individual shifts, events and shift templates in the app at any time — open the item and choose Delete." }),
      /* @__PURE__ */ jsxs("li", { children: [
        "Disconnect Google Calendar in ",
        /* @__PURE__ */ jsx("strong", { children: "More → Connected Calendars → Disconnect" }),
        ". This removes Kookaflow's access to your Google account, deletes the stored connection and its tokens, and deletes the Google events Kookaflow had stored. Shifts already copied into your Google Calendar stay in Google."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        "For anything else, email",
        " ",
        /* @__PURE__ */ jsx("a", { href: "mailto:hello@kookaflow.com?subject=Delete%20some%20of%20my%20data", children: "hello@kookaflow.com" }),
        " ",
        `from your account's email address with the subject "Delete some of my data". We will handle it within `,
        /* @__PURE__ */ jsx("strong", { children: "30 days" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "What is deleted" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsx("li", { children: "Your profile and sign-in account (name, email, job role, settings)." }),
      /* @__PURE__ */ jsx("li", { children: "All shifts and calendar events." }),
      /* @__PURE__ */ jsx("li", { children: "Shift templates and custom categories." }),
      /* @__PURE__ */ jsx("li", { children: "Preferences, including reminder and notification settings." }),
      /* @__PURE__ */ jsx("li", { children: "Your Google Calendar connection: Kookaflow's access is revoked at Google, and its tokens and cached Google events are deleted." }),
      /* @__PURE__ */ jsx("li", { children: "Your push notification registration with our notification provider, plus scheduled alerts and reminder history." }),
      /* @__PURE__ */ jsx("li", { children: "Any active subscription paid by card on our website (Stripe) is cancelled immediately." }),
      /* @__PURE__ */ jsx("li", { children: "Dismissed wellness nudges and category display choices." })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "What is kept, and why" }),
    /* @__PURE__ */ jsx("p", { children: "Purchase and transaction records held by Apple, Google Play, RevenueCat or Stripe are kept as required for tax and legal purposes. These records are held by those providers under their own policies." }),
    /* @__PURE__ */ jsx("h2", { children: "Deleting your account does not cancel an App Store or Google Play subscription" }),
    /* @__PURE__ */ jsx("p", { children: "If you subscribed through the App Store or Google Play, cancel it in that store:" }),
    /* @__PURE__ */ jsxs("ul", { children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "iPhone / App Store:" }),
        " Settings → your name → Subscriptions → Kookaflow → Cancel Subscription."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Android / Google Play:" }),
        " open the Google Play Store → your profile icon → Payments & subscriptions → Subscriptions → Kookaflow → Cancel subscription."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Website (card payment):" }),
        " cancelled automatically when you delete your account."
      ] })
    ] }),
    /* @__PURE__ */ jsx("h2", { children: "Questions" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Contact ",
      /* @__PURE__ */ jsx("a", { href: "mailto:hello@kookaflow.com", children: "hello@kookaflow.com" }),
      "."
    ] })
  ] });
}
export {
  DeleteAccountPage as component
};
