import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { useNavigate, Link, Outlet } from "@tanstack/react-router";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { u as useEvents, E as EventsProvider } from "./EventsProvider-BYnASFiW.js";
import { toast } from "sonner";
import { Briefcase, X, MapPin, Clock, Sparkles } from "lucide-react";
import { g as getEventColour } from "./shiftConfig-Bs1pzrbu.js";
import { S as ShiftTemplatesProvider } from "./ShiftTemplatesProvider-BXt4644x.js";
import { B as Button } from "./router-BND-OwId.js";
import { u as useSubscription } from "./useSubscription-BCGIZOhs.js";
import { P as PaywallModal } from "./PaywallModal-B5kNjNtK.js";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "zod";
import "./auth-middleware-DFGJyMRd.js";
import "./createMiddleware-BvN2ghIY.js";
import "./server-DjzWdpJV.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "clsx";
import "tailwind-merge";
import "react-onesignal";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
import "./dialog-C_Bc8_kc.js";
import "@radix-ui/react-dialog";
import "./stripe.functions-mbERDdRZ.js";
const SOUND_PREFS_KEY = "kookaflow.sound-prefs.v1";
const LAST_OPENED_KEY = "kookaflow.lastOpenedDate";
function readAlertMinutes() {
  if (typeof window === "undefined") return 10;
  try {
    const raw = window.localStorage.getItem(SOUND_PREFS_KEY);
    if (!raw) return 10;
    const p = JSON.parse(raw);
    return typeof p.eventAlertMinutes === "number" ? p.eventAlertMinutes : 10;
  } catch {
    return 10;
  }
}
function isShiftAlertEnabled() {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SOUND_PREFS_KEY);
    if (!raw) return true;
    const p = JSON.parse(raw);
    return p.shiftAlertEnabled !== false;
  } catch {
    return true;
  }
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function todayKey() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isToday(iso) {
  const d = new Date(iso);
  const now = /* @__PURE__ */ new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function greeting() {
  const h = (/* @__PURE__ */ new Date()).getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
function shiftTypeLabel(e) {
  const t = e.shift?.shiftType;
  if (!t || t === "custom") return e.shift?.customLabel || e.shift?.role || "work";
  return t.replace(/_/g, " ");
}
function ShiftAlertToast({ id, event, minutesAway, onView }) {
  const label = shiftTypeLabel(event);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative w-full overflow-hidden rounded-2xl text-white shadow-xl",
      style: { background: "linear-gradient(135deg, #1E2A6E 0%, #F59E0B 100%)" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Briefcase, { className: "size-5" }),
              /* @__PURE__ */ jsx("span", { className: "text-base font-bold", children: "Shift Starting Soon" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => toast.dismiss(id),
                "aria-label": "Close",
                className: "rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white",
                children: /* @__PURE__ */ jsx(X, { className: "size-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm leading-snug text-white/95", children: [
            "Your ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold capitalize", children: label }),
            " shift starts at",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: formatTime(event.start) }),
            " — ",
            minutesAway,
            " ",
            minutesAway === 1 ? "minute" : "minutes",
            " to go"
          ] }),
          event.shift?.location ? /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-xs text-white/85", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "size-3.5" }),
            " ",
            event.shift.location
          ] }) : null,
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 pt-1", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => toast.dismiss(id),
                className: "rounded-full border border-white/60 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10",
                children: "Dismiss"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  onView();
                  toast.dismiss(id);
                },
                className: "rounded-full bg-white px-3 py-1 text-xs font-semibold transition hover:bg-white/90",
                style: { color: "#1E2A6E" },
                children: "View shift"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute bottom-0 left-0 h-1 bg-white/70",
            style: { animation: "kookaflow-toast-progress 10s linear forwards" }
          }
        )
      ]
    }
  );
}
function DailySummaryToast({ id, count, firstShift, onOpen }) {
  const accent = firstShift ? getEventColour(firstShift) : "#6B7280";
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => {
        onOpen();
        toast.dismiss(id);
      },
      className: "block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl",
      style: { borderLeft: `4px solid ${accent}` },
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 p-4", style: { color: "#1E2A6E" }, children: [
        /* @__PURE__ */ jsxs("p", { className: "text-base font-semibold", children: [
          "Good ",
          greeting(),
          " 👋"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-foreground/80", children: [
          "You have ",
          count,
          " ",
          count === 1 ? "event" : "events",
          " today"
        ] }),
        firstShift ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-foreground/80", children: [
          "Your ",
          /* @__PURE__ */ jsx("span", { className: "font-medium capitalize", children: shiftTypeLabel(firstShift) }),
          " ",
          "shift starts at",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatTime(firstShift.start) })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80", children: "No shifts today — enjoy your time off 🌿" })
      ] })
    }
  );
}
function ShiftAlertWatcher() {
  const { events, isLoading } = useEvents();
  const navigate = useNavigate();
  const shownIdsRef = useRef(/* @__PURE__ */ new Set());
  const summaryShownRef = useRef(false);
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);
  useEffect(() => {
    if (isLoading || summaryShownRef.current) return;
    const today = todayKey();
    let last = null;
    try {
      last = window.localStorage.getItem(LAST_OPENED_KEY);
    } catch {
    }
    if (last === today) {
      summaryShownRef.current = true;
      return;
    }
    summaryShownRef.current = true;
    try {
      window.localStorage.setItem(LAST_OPENED_KEY, today);
    } catch {
    }
    const todays = events.filter((e) => isToday(e.start));
    const firstShift = todays.filter((e) => e.category === "work").sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
    toast.custom(
      (t) => /* @__PURE__ */ jsx(
        DailySummaryToast,
        {
          id: t,
          count: todays.length,
          firstShift,
          onOpen: () => navigate({ to: "/calendar" })
        }
      ),
      {
        duration: 1e4,
        position: "top-center",
        // @ts-expect-error sonner 2.x supports per-toast swipe directions
        swipeDirections: ["top"]
      }
    );
  }, [isLoading, events, navigate]);
  useEffect(() => {
    if (isLoading) return;
    const check = () => {
      if (!isShiftAlertEnabled()) return;
      const windowMin = readAlertMinutes();
      const now = Date.now();
      const cur = eventsRef.current;
      for (const e of cur) {
        if (e.category !== "work") continue;
        if (!isToday(e.start)) continue;
        if (shownIdsRef.current.has(e.id)) continue;
        const startMs = new Date(e.start).getTime();
        const diffMin = Math.round((startMs - now) / 6e4);
        if (diffMin < 0 || diffMin > windowMin) continue;
        shownIdsRef.current.add(e.id);
        toast.custom(
          (t) => /* @__PURE__ */ jsx(
            ShiftAlertToast,
            {
              id: t,
              event: e,
              minutesAway: Math.max(0, diffMin),
              onView: () => navigate({ to: "/calendar" })
            }
          ),
          {
            duration: 1e4,
            position: "top-center",
            // @ts-expect-error sonner 2.x supports per-toast swipe directions
            swipeDirections: ["top"]
          }
        );
      }
    };
    check();
    const id = window.setInterval(check, 6e4);
    return () => window.clearInterval(id);
  }, [isLoading, navigate]);
  return null;
}
function TrialBanner() {
  const sub = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  if (sub.loading || !sub.signedIn) return null;
  if (sub.tier === "pro" || sub.tier === "lifetime" || sub.tier === "basic") return null;
  const expired = sub.tier === "expired" || !sub.isTrialing && sub.tier === "trial";
  if (dismissed && !expired) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex items-center justify-between gap-2 border-b px-3 py-2 ${expired ? "border-red-700 bg-[#DC2626] text-white font-semibold" : "border-border bg-primary/10 text-foreground text-sm"}`,
        style: expired ? { fontSize: 13 } : void 0,
        role: "status",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
            expired ? /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 shrink-0 text-primary" }),
            expired ? /* @__PURE__ */ jsxs("div", { className: "min-w-0 leading-tight", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate", children: "Your free trial has ended" }),
              /* @__PURE__ */ jsx("div", { className: "truncate text-[11px] font-normal opacity-90", children: "Upgrade to keep access" })
            ] }) : /* @__PURE__ */ jsx("span", { className: "truncate", children: sub.trialDaysRemaining <= 1 ? "Last day of your free trial." : `${sub.trialDaysRemaining} days left in your free trial.` })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: expired ? "outline" : "default",
                className: expired ? "border-white bg-white font-bold text-[#DC2626] hover:bg-white/90 hover:text-[#DC2626] rounded-full px-4 py-1.5 h-auto" : "",
                onClick: () => setPaywallOpen(true),
                children: "Upgrade"
              }
            ),
            !expired && /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(Link, { to: "/pricing", children: "Compare plans" }) }),
            !expired && /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDismissed(true), "aria-label": "Dismiss", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      PaywallModal,
      {
        open: paywallOpen,
        onOpenChange: setPaywallOpen,
        reason: expired ? "trial-expired" : void 0
      }
    )
  ] });
}
function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data
      } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!data.user) {
        navigate({
          to: "/login"
        });
      } else {
        const {
          data: profile
        } = await supabase.from("profiles").select("onboarded_at").eq("id", data.user.id).maybeSingle();
        if (!profile?.onboarded_at && window.location.pathname !== "/onboarding") {
          navigate({
            to: "/onboarding"
          });
          return;
        }
        setStatus("ready");
      }
    })();
    const {
      data: sub
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({
        to: "/login"
      });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);
  if (status === "checking") {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) });
  }
  return /* @__PURE__ */ jsx(EventsProvider, { children: /* @__PURE__ */ jsxs(ShiftTemplatesProvider, { children: [
    /* @__PURE__ */ jsx(ShiftAlertWatcher, {}),
    /* @__PURE__ */ jsx(TrialBanner, {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) });
}
export {
  AuthenticatedLayout as component
};
