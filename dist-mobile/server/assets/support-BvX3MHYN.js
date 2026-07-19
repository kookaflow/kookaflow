import { jsx, jsxs } from "react/jsx-runtime";
import { L as LegalPage } from "./LegalPage-bPFpupqn.js";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Mail } from "lucide-react";
import { c as cn } from "./router-CfW6Ca5m.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "./client-BiJkZOJ7.js";
import "@supabase/supabase-js";
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
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
const FAQS = [{
  q: "How do I add a shift?",
  a: "Tap the + button or use the quick-add panel at the bottom of the calendar. Select a shift type and tap any date."
}, {
  q: "How do I connect Google Calendar?",
  a: "Go to Settings → Connected Calendars → Connect Google Calendar."
}, {
  q: "How do I delete an event?",
  a: "Tap the event on the calendar to open it, then tap the delete button at the bottom."
}, {
  q: "How do I enable push notifications?",
  a: "Go to Settings → Reminders and enable Push Notifications."
}, {
  q: "How is my Balance Score calculated?",
  a: "Your Balance Score measures how evenly your time is distributed across life categories. A score above 80 means great balance."
}, {
  q: "Can I export my data?",
  a: "Email support@kookaflow.com and we will send you a copy of your data within 7 days."
}, {
  q: "How do I delete my account?",
  a: "Go to Settings → scroll to bottom → Delete Account. This permanently removes all your data."
}];
function SupportPage() {
  return /* @__PURE__ */ jsxs(LegalPage, { title: "How can we help?", subtitle: "We're here to support your flow.", children: [
    /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("a", { href: "mailto:support@kookaflow.com", className: "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent", children: [
      /* @__PURE__ */ jsx(Mail, { className: "size-4 text-primary" }),
      "support@kookaflow.com"
    ] }) }),
    /* @__PURE__ */ jsx("h2", { children: "Frequently asked questions" }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: FAQS.map((f, i) => /* @__PURE__ */ jsxs(AccordionItem, { value: `item-${i}`, children: [
      /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-sm font-medium", children: f.q }),
      /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm text-muted-foreground", children: f.a })
    ] }, i)) }) })
  ] });
}
export {
  SupportPage as component
};
