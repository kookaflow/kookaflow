import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { l as logo, u as useServerFn, B as Button, c as cn, d as usePreferences, T as THEMES, g as getPushStatus, f as updatePushPrefs, b as createSsrRpc } from "./router-CfW6Ca5m.js";
import { T as ThemeToggle } from "./ThemeToggle-DkD6ct3r.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Sparkles, Loader2, Layers, LogOut, CalendarRange, Coffee, CalendarCheck2, AlertTriangle, RefreshCw, Unplug, Check, Sun, Moon, Monitor, Bell, BellOff, Mail, Smartphone, Volume2, Play, CloudRain, Waves, Trees, Download, FileText, FileSpreadsheet, ShieldCheck, HelpCircle, Scale, Star, Share2, AlertOctagon, Trash2 } from "lucide-react";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-Bueegtn5.js";
import { toast } from "sonner";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { u as useSubscription } from "./useSubscription-BCGIZOhs.js";
import { a as createCustomerPortalSession } from "./stripe.functions-HdK7T6FJ.js";
import { S as Switch, g as getGoogleConnectionStatus, d as disconnectGoogleCalendar, t as triggerGoogleSync, a as getGoogleAuthUrl } from "./google-calendar.functions-BISB_u9i.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns";
import { L as Label } from "./label-BX49QBTb.js";
import { I as Input } from "./input-BilhWrar.js";
import OneSignal from "react-onesignal";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
import jsPDF from "jspdf";
import { u as useEvents } from "./EventsProvider-CUezkWPz.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-DkTnvVPY.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
import "@radix-ui/react-switch";
import "@radix-ui/react-label";
import "./createMiddleware-BvN2ghIY.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-dialog";
function MoreHero() {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative mb-6 flex flex-col items-center justify-center overflow-hidden rounded-b-3xl text-center text-white shadow-lg",
      style: {
        height: 160,
        background: "radial-gradient(ellipse at 80% 20%, #ffc338 0%, #fb862a 25%, #7e294d 60%, #251074 100%)"
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 z-20", children: /* @__PURE__ */ jsx(ThemeToggle, {}) }),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute inset-0 opacity-20",
            style: {
              background: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25), transparent 55%)"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: logo,
            alt: "Kookaflow",
            style: { height: 52, width: "auto" },
            className: "relative z-10 object-contain drop-shadow"
          }
        ),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "relative z-10 mt-2 px-4 text-white/95",
            style: {
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.3px"
            },
            children: "Find your flow, whatever your hours"
          }
        ),
        /* @__PURE__ */ jsx(
          "svg",
          {
            "aria-hidden": true,
            viewBox: "0 0 1440 80",
            preserveAspectRatio: "none",
            className: "absolute -bottom-px left-0 h-[40px] w-full text-background",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z",
                fill: "currentColor"
              }
            )
          }
        )
      ]
    }
  );
}
function initials(name, email) {
  const src = (name ?? email ?? "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}
function AccountSection() {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const sub = useSubscription();
  const openPortal = useServerFn(createCustomerPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle();
      setName(profile?.full_name ?? null);
    })();
  }, []);
  const tierLabel = sub.tier === "lifetime" ? "Lifetime Pro" : sub.tier === "pro" ? "Pro" : sub.tier === "basic" ? "Basic" : sub.tier === "expired" ? "Expired" : sub.isTrialing ? "Free trial" : "Trial";
  const tierBadgeClass = sub.tier === "pro" || sub.tier === "lifetime" ? "bg-primary/15 text-primary" : sub.tier === "basic" ? "bg-accent/30 text-accent-foreground" : sub.tier === "expired" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground";
  const subSubtitle = sub.tier === "lifetime" ? "Lifetime — thanks for your support" : sub.tier === "pro" ? "Pro — all features unlocked" : sub.tier === "basic" ? "Basic — upgrade for the dashboard & sync" : sub.tier === "expired" ? "Trial ended — upgrade to keep using Pro" : sub.isTrialing ? `${sub.trialDaysRemaining} day${sub.trialDaysRemaining === 1 ? "" : "s"} left in your free trial` : "14-day trial";
  const showManage = (sub.tier === "pro" || sub.tier === "basic") && !!sub.stripeCustomerId;
  const showUpgrade = sub.tier === "trial" || sub.tier === "basic" || sub.tier === "expired";
  const upgradeLabel = sub.tier === "basic" ? "Upgrade to Pro" : sub.tier === "expired" ? "Resubscribe" : "Upgrade";
  async function handlePortal() {
    try {
      setPortalLoading(true);
      const res = await openPortal({});
      if (res?.url) window.location.assign(res.url);
      else toast.error("Could not open billing portal.");
    } catch {
      toast.error("Could not open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Account" }),
    /* @__PURE__ */ jsxs(Card, { className: "p-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/settings",
          className: "flex items-center gap-3 p-4 transition-colors hover:bg-accent/40",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary", children: initials(name, email) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-foreground", children: name ?? "Add your name" }),
              /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-muted-foreground", children: email ?? "—" })
            ] }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mx-4 h-px bg-border" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Sparkles, { size: 18 }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Subscription" }),
          /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-muted-foreground", children: subSubtitle })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${tierBadgeClass}`, children: tierLabel }),
        /* @__PURE__ */ jsxs("div", { className: "flex w-full gap-2 sm:w-auto", children: [
          showUpgrade && /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "default", className: "flex-1 sm:flex-none", children: /* @__PURE__ */ jsx(Link, { to: "/pricing", children: upgradeLabel }) }),
          showManage && /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: handlePortal,
              disabled: portalLoading,
              className: "flex-1 sm:flex-none",
              children: portalLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Manage"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ShiftsLinkRow() {
  return /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Shifts" }),
    /* @__PURE__ */ jsx(Card, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/shifts",
        className: "flex items-center gap-3 p-4 transition-colors hover:bg-accent/40",
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Layers, { size: 18 }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Manage Shift Templates" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Create and edit your custom shift types" })
          ] }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
        ]
      }
    ) })
  ] });
}
function SignOutSection() {
  const navigate = useNavigate();
  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  return /* @__PURE__ */ jsx("div", { className: "mt-8 border-t border-border pt-6", children: /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: handleSignOut,
      className: "flex w-full items-center justify-center gap-2 text-sm font-medium text-destructive/80 transition-colors hover:text-destructive",
      children: [
        /* @__PURE__ */ jsx(LogOut, { className: "size-4" }),
        "Sign Out"
      ]
    }
  ) });
}
const DEFAULTS = {
  week_starts_on: 1,
  time_format: "12h",
  show_week_numbers: false,
  show_public_holidays: true
};
function useUserSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data } = await supabase.from("user_preferences").select("week_starts_on,time_format,show_week_numbers,show_public_holidays").eq("user_id", u.user.id).maybeSingle();
      if (cancelled) return;
      if (data) {
        setSettings({
          week_starts_on: data.week_starts_on === 0 ? 0 : 1,
          time_format: data.time_format ?? "12h",
          show_week_numbers: !!data.show_week_numbers,
          show_public_holidays: data.show_public_holidays ?? true
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  async function update(patch) {
    setSettings((p) => ({ ...p, ...patch }));
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("user_preferences").update(patch).eq("user_id", u.user.id);
  }
  return { settings, loading, update };
}
function CalendarPreferences() {
  const { settings, update, loading } = useUserSettings();
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CalendarRange, { className: "size-4 text-primary" }),
        " Calendar"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Tune how your calendar reads and counts time." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
      /* @__PURE__ */ jsx(Row, { label: "Start week on", help: "Australian default is Monday.", children: /* @__PURE__ */ jsx(
        Segmented,
        {
          value: settings.week_starts_on === 0 ? "sun" : "mon",
          onChange: (v) => update({ week_starts_on: v === "sun" ? 0 : 1 }),
          options: [
            { value: "mon", label: "Monday" },
            { value: "sun", label: "Sunday" }
          ],
          disabled: loading
        }
      ) }),
      /* @__PURE__ */ jsx(Row, { label: "Time format", help: "How times are shown throughout the app.", children: /* @__PURE__ */ jsx(
        Segmented,
        {
          value: settings.time_format,
          onChange: (v) => update({ time_format: v }),
          options: [
            { value: "12h", label: "12-hour" },
            { value: "24h", label: "24-hour" }
          ],
          disabled: loading
        }
      ) }),
      /* @__PURE__ */ jsx(
        ToggleRow,
        {
          label: "Show week numbers",
          help: "Display W## in the top-left of each week row.",
          checked: settings.show_week_numbers,
          onChange: (v) => update({ show_week_numbers: v }),
          disabled: loading
        }
      ),
      /* @__PURE__ */ jsx(
        ToggleRow,
        {
          label: "Show public holidays",
          help: "Mark public holidays on your calendar.",
          checked: settings.show_public_holidays,
          onChange: (v) => update({ show_public_holidays: v }),
          disabled: loading
        }
      )
    ] })
  ] });
}
function Row({ label, help, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: label }),
      help && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: help })
    ] }),
    /* @__PURE__ */ jsx("div", { children })
  ] });
}
function ToggleRow({
  label,
  help,
  checked,
  onChange,
  disabled
}) {
  return /* @__PURE__ */ jsx(Row, { label, help, children: /* @__PURE__ */ jsx(Switch, { checked, onCheckedChange: onChange, disabled }) });
}
function Segmented({
  value,
  onChange,
  options,
  disabled
}) {
  return /* @__PURE__ */ jsx("div", { className: "inline-flex rounded-full border border-border bg-muted p-1", children: options.map((o) => {
    const active = value === o.value;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => onChange(o.value),
        className: cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
          active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50"
        ),
        children: o.label
      },
      o.value
    );
  }) });
}
function GoogleLogo({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 48 48", className, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#4285F4",
        d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#34A853",
        d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#FBBC05",
        d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#EA4335",
        d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      }
    )
  ] });
}
function ConnectedCalendars() {
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getGoogleConnectionStatus);
  const disconnect = useServerFn(disconnectGoogleCalendar);
  const triggerSync = useServerFn(triggerGoogleSync);
  const fetchAuthUrl = useServerFn(getGoogleAuthUrl);
  const [connecting, setConnecting] = useState(false);
  const { data: status, isLoading } = useQuery({
    queryKey: ["google-connection-status"],
    queryFn: () => fetchStatus()
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "connected") {
      qc.invalidateQueries({ queryKey: ["google-connection-status"] });
      qc.invalidateQueries({ queryKey: ["google-events"] });
      toast.success("Google Calendar connected");
      params.delete("google");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, [qc]);
  const syncMut = useMutation({
    mutationFn: () => {
      toast.message(
        "Syncing your calendar — this may take a few minutes depending on how many events you have ☕",
        { icon: /* @__PURE__ */ jsx(Coffee, { className: "size-4" }), duration: 8e3, id: "google-sync" }
      );
      return triggerSync();
    },
    onSuccess: (res) => {
      toast.dismiss("google-sync");
      if (res.ok) {
        toast.success(
          `Synced ${res.imported} event${res.imported === 1 ? "" : "s"}${res.removed ? `, removed ${res.removed}` : ""}`
        );
      } else {
        toast.error(`Sync failed: ${res.error ?? "unknown error"}`);
      }
      qc.invalidateQueries({ queryKey: ["google-connection-status"] });
      qc.invalidateQueries({ queryKey: ["google-events"] });
    }
  });
  const disconnectMut = useMutation({
    mutationFn: () => disconnect(),
    onSuccess: () => {
      toast.success("Google Calendar disconnected");
      qc.invalidateQueries({ queryKey: ["google-connection-status"] });
      qc.invalidateQueries({ queryKey: ["google-events"] });
    }
  });
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await fetchAuthUrl();
      window.location.href = url;
    } catch (e) {
      setConnecting(false);
      const msg = e instanceof Error ? e.message : "Could not start Google connection";
      toast.error(msg);
    }
  };
  return /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Connected Calendars" }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsx(GoogleLogo, { className: "size-5" }),
          "Google Calendar"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Import your Google Calendar events alongside your shifts." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : status?.connected ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129)]" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
                "Connected",
                status.googleEmail ? ` as ${status.googleEmail}` : ""
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: status.lastSyncedAt ? `Last synced ${formatDistanceToNow(new Date(status.lastSyncedAt), { addSuffix: true })}` : "Not synced yet" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(CalendarCheck2, { className: "size-5 text-emerald-500" })
        ] }),
        status.lastSyncError && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 shrink-0" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Google Calendar disconnected — reconnect to continue syncing.",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsxs("span", { className: "opacity-70", children: [
              "(",
              status.lastSyncError,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => syncMut.mutate(),
              disabled: syncMut.isPending,
              className: "gap-2",
              children: [
                /* @__PURE__ */ jsx(
                  RefreshCw,
                  {
                    className: `size-4 ${syncMut.isPending ? "animate-spin" : ""}`
                  }
                ),
                syncMut.isPending ? "Syncing…" : "Sync now"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => {
                if (confirm(
                  "Disconnect Google Calendar? Your imported events will be removed from Kookaflow."
                ))
                  disconnectMut.mutate();
              },
              disabled: disconnectMut.isPending,
              className: "gap-2 text-destructive hover:text-destructive",
              children: [
                /* @__PURE__ */ jsx(Unplug, { className: "size-4" }),
                "Disconnect"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Import your Google Calendar events into Kookaflow." }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: handleConnect,
            disabled: connecting,
            variant: "outline",
            className: "gap-2 bg-background",
            children: [
              /* @__PURE__ */ jsx(GoogleLogo, { className: "size-4" }),
              connecting ? "Connecting…" : "Connect"
            ]
          }
        )
      ] }) })
    ] })
  ] });
}
const MODES = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor }
];
function ThemeSettings() {
  const { prefs, setThemeName, setMode } = usePreferences();
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Appearance" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Pick a theme and mode. Changes apply instantly." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: THEMES.map((t) => {
        const selected = prefs.themeName === t.name;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setThemeName(t.name),
            "aria-pressed": selected,
            className: cn(
              "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:border-primary/60 hover:shadow",
              selected && "border-primary ring-2 ring-ring"
            ),
            children: [
              selected && /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(Check, { className: "size-3" }) }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex h-14 overflow-hidden rounded-lg border border-border",
                  "aria-hidden": true,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "flex-1", style: { background: t.preview.bgLight } }),
                    /* @__PURE__ */ jsx("div", { className: "flex-1", style: { background: t.preview.bgDark } }),
                    /* @__PURE__ */ jsxs("div", { className: "flex w-10 flex-col", children: [
                      /* @__PURE__ */ jsx("div", { className: "flex-1", style: { background: t.preview.accent } }),
                      /* @__PURE__ */ jsx("div", { className: "flex-1", style: { background: t.preview.highlight } })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-card-foreground", children: t.label }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: t.description })
              ] })
            ]
          },
          t.name
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Mode" }),
        /* @__PURE__ */ jsx("div", { className: "inline-flex rounded-full border border-border bg-muted p-1", children: MODES.map(({ value, label, Icon }) => {
          const active = prefs.mode === value;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setMode(value),
              "aria-pressed": active,
              className: cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              ),
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "size-3.5" }),
                label
              ]
            },
            value
          );
        }) })
      ] })
    ] })
  ] });
}
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHANNELS = [
  { value: "email", label: "Email", icon: /* @__PURE__ */ jsx(Mail, { className: "size-3.5" }) },
  { value: "push", label: "Push Notifications", icon: /* @__PURE__ */ jsx(Bell, { className: "size-3.5" }) },
  { value: "both", label: "Both", icon: /* @__PURE__ */ jsx(Smartphone, { className: "size-3.5" }) }
];
function ChannelSelector({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: CHANNELS.map((ch) => /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => onChange(ch.value),
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        value === ch.value ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-input bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      ),
      children: [
        ch.icon,
        ch.label
      ]
    },
    ch.value
  )) });
}
function DaySelector({
  selected,
  onChange
}) {
  const toggle = useCallback(
    (day) => {
      onChange(
        selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]
      );
    },
    [selected, onChange]
  );
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: WEEK_DAYS.map((day) => {
    const isSelected = selected.includes(day);
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => toggle(day),
        className: cn(
          "flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition-all",
          isSelected ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-input bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground"
        ),
        "aria-pressed": isSelected,
        children: day
      },
      day
    );
  }) });
}
function TimePicker({ value, onChange }) {
  return /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
    Input,
    {
      type: "time",
      value,
      onChange: (e) => onChange(e.target.value),
      className: "w-auto pr-2"
    }
  ) });
}
function RemindersSettings() {
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyTime, setDailyTime] = useState("08:00");
  const [dailyChannel, setDailyChannel] = useState("email");
  const [dailyEmail, setDailyEmail] = useState("");
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState(["Sun"]);
  const [weeklyTime, setWeeklyTime] = useState("18:00");
  const [weeklyChannel, setWeeklyChannel] = useState("email");
  const [weeklyEmail, setWeeklyEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
  }, []);
  const showDailyEmail = dailyChannel === "email" || dailyChannel === "both";
  const showWeeklyEmail = weeklyChannel === "email" || weeklyChannel === "both";
  const sampleDailyMessage = `Good morning! Here's your day at a glance:

• Work: 8h shift (07:00–15:00)
• Rest: 7h sleep planned
• Exercise: 1h gym session
• Family: dinner at 18:00

Balance score yesterday: 72/100

Take a breath—you've got this.`;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx(NotificationStatusCard, {}),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Bell, { className: "size-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Daily Reminder" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Get a summary of your day every morning" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Switch, { checked: dailyEnabled, onCheckedChange: setDailyEnabled })
      ] }) }),
      dailyEnabled && /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Time" }),
          /* @__PURE__ */ jsx(TimePicker, { value: dailyTime, onChange: setDailyTime })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Channel" }),
          /* @__PURE__ */ jsx(ChannelSelector, { value: dailyChannel, onChange: setDailyChannel })
        ] }),
        showDailyEmail && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "daily-email", className: "text-sm font-medium", children: "Email address" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "daily-email",
              type: "email",
              placeholder: "you@example.com",
              value: dailyEmail,
              onChange: (e) => setDailyEmail(e.target.value),
              className: "max-w-sm"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Bell, { className: "size-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Weekly Reminder" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Review your week and plan ahead" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Switch, { checked: weeklyEnabled, onCheckedChange: setWeeklyEnabled })
      ] }) }),
      weeklyEnabled && /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Day(s)" }),
          /* @__PURE__ */ jsx(DaySelector, { selected: weeklyDays, onChange: setWeeklyDays })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Time" }),
          /* @__PURE__ */ jsx(TimePicker, { value: weeklyTime, onChange: setWeeklyTime })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Channel" }),
          /* @__PURE__ */ jsx(ChannelSelector, { value: weeklyChannel, onChange: setWeeklyChannel })
        ] }),
        showWeeklyEmail && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "weekly-email", className: "text-sm font-medium", children: "Email address" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "weekly-email",
              type: "email",
              placeholder: "you@example.com",
              value: weeklyEmail,
              onChange: (e) => setWeeklyEmail(e.target.value),
              className: "max-w-sm"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ShiftAlertsCard, {}),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Preview" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "A sample of what your daily reminder will look like" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border bg-muted/40 p-4", children: /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap font-mono text-sm text-foreground", children: sampleDailyMessage }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: handleSave, className: cn("min-w-[140px] transition-all", saved && "bg-green-600 hover:bg-green-700"), children: saved ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Check, { className: "size-4" }),
      "Saved"
    ] }) : "Save Preferences" }) })
  ] });
}
function usePermissionState() {
  const [perm, setPerm] = useState(
    "default"
  );
  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
    const id = window.setInterval(() => setPerm(Notification.permission), 1500);
    return () => window.clearInterval(id);
  }, []);
  return perm;
}
function NotificationStatusCard() {
  const perm = usePermissionState();
  const enable = async () => {
    try {
      await OneSignal.Notifications.requestPermission();
    } catch (e) {
      console.error(e);
    }
  };
  if (perm === "granted") {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block size-2 rounded-full bg-emerald-500" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: "🔔 Push notifications are active on this device" })
    ] });
  }
  if (perm === "denied") {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block size-2 rounded-full bg-amber-500" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: "Notifications blocked — enable in your browser settings" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block size-2 rounded-full bg-muted-foreground/50" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: "🔕 Push notifications are off" })
    ] }),
    /* @__PURE__ */ jsx(Button, { size: "sm", onClick: enable, disabled: perm === "unsupported", children: "Enable notifications" })
  ] });
}
function ShiftAlertsCard() {
  const perm = usePermissionState();
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getPushStatus);
  const persist = useServerFn(updatePushPrefs);
  const { data: status } = useQuery({
    queryKey: ["push-status"],
    queryFn: () => fetchStatus()
  });
  const mut = useMutation({
    mutationFn: (v) => persist({ data: { push_shift_alerts: v } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["push-status"] })
  });
  if (perm !== "granted") return null;
  const enabled = status?.push_shift_alerts ?? true;
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(BellOff, { className: "size-4" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Shift Alerts" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Get a push notification before each shift starts" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Switch,
      {
        checked: enabled,
        disabled: mut.isPending,
        onCheckedChange: (v) => mut.mutate(v)
      }
    )
  ] }) }) });
}
const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  job_role: z.string().min(1).max(60).optional(),
  shift_pattern: z.string().min(1).max(60).optional(),
  timezone: z.string().max(80).optional()
});
const ChannelSchema = z.enum(["email", "sms", "push", "both"]).nullable().optional();
const PreferencesUpdateSchema = z.object({
  theme: z.enum(["slate", "midnight", "lavender", "forest"]).optional(),
  theme_mode: z.enum(["light", "dark"]).optional(),
  accent_colour: z.string().max(20).nullable().optional(),
  default_view: z.enum(["month", "week", "day"]).optional(),
  week_starts_on: z.union([z.literal(0), z.literal(1)]).optional(),
  time_format: z.enum(["12h", "24h"]).optional(),
  show_week_numbers: z.boolean().optional(),
  show_public_holidays: z.boolean().optional(),
  hourly_rate: z.number().nonnegative().nullable().optional(),
  currency: z.enum(["AUD", "USD", "GBP", "EUR", "NZD"]).optional(),
  country: z.string().min(2).max(2).optional(),
  daily_reminder_enabled: z.boolean().optional(),
  daily_reminder_time: z.string().nullable().optional(),
  daily_reminder_channel: ChannelSchema,
  weekly_reminder_enabled: z.boolean().optional(),
  weekly_reminder_day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]).nullable().optional(),
  weekly_reminder_time: z.string().nullable().optional(),
  weekly_reminder_channel: ChannelSchema,
  sound_enabled: z.boolean().optional(),
  notification_sound: z.string().max(40).optional(),
  reminder_minutes_before: z.number().int().min(0).max(1440).optional(),
  shift_alert_sound: z.enum(["triple_chime", "rising_alert", "double_bell", "gentle_pulse", "none"]).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(40).nullable().optional()
});
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2463312fc4d1b2ffd2434ce4c0f80068611403d6f74377dd28e6a9ab1196f3be"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => ProfileUpdateSchema.parse(input)).handler(createSsrRpc("2c8c8cd158627a7870819d611e726b3c7236006dd291b701e81ae6a04d31114b"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  full_name: z.string().min(1).max(120),
  job_role: z.string().min(1).max(60),
  shift_pattern: z.string().min(1).max(60)
}).parse(input)).handler(createSsrRpc("c32e024ea22c2aed7c00796b6360c5d8fe11cdc9b55858d7af2fe026227d169a"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("19718eb6225df91d07a00f3dd911b486d48f4879d098f96ca62d2f45d591dc6b"));
const updatePreferences = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => PreferencesUpdateSchema.parse(input)).handler(createSsrRpc("ba75cdea88e86f3aea58df065aa9236671dd2d3a27c5fba4b388fd328930d87b"));
const STORAGE_KEY = "kookaflow.sound-prefs.v1";
const DEFAULT_PREFS = {
  masterEnabled: true,
  notificationSound: "soft-chime",
  eventAlertEnabled: true,
  eventAlertMinutes: 10,
  shiftAlertEnabled: true,
  shiftAlertSound: "triple_chime",
  ambient: "off"
};
const SOUNDS = [
  { value: "soft-chime", label: "Soft Chime" },
  { value: "bell", label: "Bell" },
  { value: "nature", label: "Nature (birds)" },
  { value: "digital-ping", label: "Digital Ping" },
  { value: "none", label: "None" }
];
const LEAD_OPTIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" }
];
const SHIFT_ALERT_SOUNDS = [
  { value: "triple_chime", label: "Triple Chime (recommended)" },
  { value: "rising_alert", label: "Rising Alert" },
  { value: "double_bell", label: "Double Bell" },
  { value: "gentle_pulse", label: "Gentle Pulse" },
  { value: "none", label: "None" }
];
const AMBIENT_OPTIONS = [
  { value: "off", label: "Off", icon: /* @__PURE__ */ jsx(Volume2, { className: "size-3.5" }) },
  { value: "rain", label: "Rain", icon: /* @__PURE__ */ jsx(CloudRain, { className: "size-3.5" }) },
  { value: "white-noise", label: "White Noise", icon: /* @__PURE__ */ jsx(Waves, { className: "size-3.5" }) },
  { value: "forest", label: "Forest", icon: /* @__PURE__ */ jsx(Trees, { className: "size-3.5" }) }
];
let sharedCtx = null;
function getCtx() {
  if (!sharedCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    sharedCtx = new Ctor();
  }
  if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {
  });
  return sharedCtx;
}
function playTone(opts) {
  const ctx = getCtx();
  const t0 = ctx.currentTime + (opts.startOffset ?? 0);
  const dur = opts.duration ?? 0.3;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  const peak = opts.gain ?? 0.18;
  g.gain.setValueAtTime(1e-4, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}
function playSound(id) {
  if (id === "none") return;
  switch (id) {
    case "soft-chime":
      playTone({ freq: 880, type: "sine", duration: 0.45, gain: 0.15 });
      playTone({ freq: 1320, type: "sine", duration: 0.55, startOffset: 0.08, gain: 0.1 });
      break;
    case "bell":
      playTone({ freq: 660, type: "triangle", duration: 0.9, gain: 0.18 });
      playTone({ freq: 990, type: "sine", duration: 0.7, startOffset: 0.02, gain: 0.08 });
      break;
    case "nature": {
      const ctx = getCtx();
      for (let i = 0; i < 3; i++) {
        const t0 = ctx.currentTime + i * 0.18;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1800, t0);
        osc.frequency.exponentialRampToValueAtTime(2600, t0 + 0.12);
        g.gain.setValueAtTime(1e-4, t0);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.14);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      }
      break;
    }
    case "digital-ping":
      playTone({ freq: 1760, type: "square", duration: 0.12, gain: 0.1 });
      playTone({ freq: 2200, type: "square", duration: 0.12, startOffset: 0.1, gain: 0.08 });
      break;
  }
}
function playShiftAlertSound(id) {
  if (id === "none") return;
  const ctx = getCtx();
  switch (id) {
    case "triple_chime": {
      playTone({ freq: 440, type: "sine", duration: 0.3, startOffset: 0, gain: 0.18 });
      playTone({ freq: 554, type: "sine", duration: 0.3, startOffset: 0.4, gain: 0.18 });
      playTone({ freq: 659, type: "sine", duration: 0.5, startOffset: 0.8, gain: 0.18 });
      break;
    }
    case "rising_alert": {
      const t0 = ctx.currentTime;
      const dur = 2;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, t0);
      osc.frequency.linearRampToValueAtTime(600, t0 + dur);
      g.gain.setValueAtTime(1e-4, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.1);
      g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
      break;
    }
    case "double_bell": {
      const ring = (offset) => {
        const t0 = ctx.currentTime + offset;
        const dur = 0.4;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(528, t0);
        osc2.frequency.setValueAtTime(1056, t0);
        g.gain.setValueAtTime(1e-4, t0);
        g.gain.exponentialRampToValueAtTime(0.22, t0 + 5e-3);
        g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
        osc1.connect(g);
        osc2.connect(g);
        g.connect(ctx.destination);
        osc1.start(t0);
        osc2.start(t0);
        osc1.stop(t0 + dur + 0.05);
        osc2.stop(t0 + dur + 0.05);
      };
      ring(0);
      ring(0.6);
      break;
    }
    case "gentle_pulse": {
      for (let i = 0; i < 3; i++) {
        playTone({ freq: 392, type: "sine", duration: 0.2, startOffset: i * 0.3, gain: 0.1 });
      }
      break;
    }
  }
}
function createNoiseBuffer(ctx, seconds = 2) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
function startAmbient(id) {
  if (id === "off") return null;
  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 1e-4;
  master.connect(ctx.destination);
  master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.6);
  const nodes = [];
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 2);
  noise.loop = true;
  if (id === "white-noise") {
    noise.connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop(), disconnect: () => noise.disconnect() });
  } else if (id === "rain") {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 600;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4e3;
    noise.connect(hp).connect(lp).connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop(), disconnect: () => noise.disconnect() });
    nodes.push({ disconnect: () => hp.disconnect() });
    nodes.push({ disconnect: () => lp.disconnect() });
  } else if (id === "forest") {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    const wind = ctx.createGain();
    wind.gain.value = 0.5;
    noise.connect(lp).connect(wind).connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop(), disconnect: () => noise.disconnect() });
    nodes.push({ disconnect: () => lp.disconnect() });
    nodes.push({ disconnect: () => wind.disconnect() });
    let stopped = false;
    const chirp = () => {
      if (stopped) return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1800 + Math.random() * 600, t0);
      osc.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 400, t0 + 0.1);
      g.gain.setValueAtTime(1e-4, t0);
      g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.14);
      osc.connect(g).connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.18);
      setTimeout(chirp, 1500 + Math.random() * 3500);
    };
    setTimeout(chirp, 800);
    nodes.push({ disconnect: () => {
      stopped = true;
    } });
  }
  return {
    stop: () => {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + 0.3);
      } catch {
      }
      setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop?.();
          } catch {
          }
        });
        nodes.forEach((n) => {
          try {
            n.disconnect();
          } catch {
          }
        });
        try {
          master.disconnect();
        } catch {
        }
      }, 350);
    }
  };
}
function loadPrefs() {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}
function SoundNotifications() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const ambientRef = useRef(null);
  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
    }
  }, [prefs, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    ambientRef.current?.stop();
    ambientRef.current = null;
    if (prefs.masterEnabled && prefs.ambient !== "off") {
      ambientRef.current = startAmbient(prefs.ambient);
    }
    return () => {
      ambientRef.current?.stop();
      ambientRef.current = null;
    };
  }, [prefs.ambient, prefs.masterEnabled, hydrated]);
  const update = useCallback((k, v) => {
    setPrefs((p) => ({ ...p, [k]: v }));
  }, []);
  const handleSelectSound = (id) => {
    update("notificationSound", id);
    if (prefs.masterEnabled) playSound(id);
  };
  const handleSave = async () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
    }
    try {
      await updatePreferences({
        data: {
          reminder_minutes_before: prefs.eventAlertMinutes,
          shift_alert_sound: prefs.shiftAlertSound
        }
      });
    } catch {
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  const disabled = !prefs.masterEnabled;
  return /* @__PURE__ */ jsxs(Card, { className: "mt-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Volume2, { className: "size-5 text-primary" }),
        /* @__PURE__ */ jsx(CardTitle, { children: "Sound & Notifications" })
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Choose alert sounds and ambient audio. All preferences are saved on this device." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border bg-card/50 p-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-medium", children: "Master sound" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Turn all app sounds on or off." })
        ] }),
        /* @__PURE__ */ jsx(
          Switch,
          {
            checked: prefs.masterEnabled,
            onCheckedChange: (v) => update("masterEnabled", v)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("space-y-2", disabled && "opacity-50 pointer-events-none"), children: [
        /* @__PURE__ */ jsx(Label, { children: "Notification sound" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              value: prefs.notificationSound,
              onChange: (e) => handleSelectSound(e.target.value),
              className: "flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              children: SOUNDS.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value))
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => playSound(prefs.notificationSound),
              children: [
                /* @__PURE__ */ jsx(Play, { className: "size-3.5 mr-1" }),
                " Preview"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Plays a short tone when an alert fires." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("space-y-3 rounded-lg border border-border p-4", disabled && "opacity-50"), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-base font-medium", children: "Event reminder alert" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Play a sound before an event starts." })
          ] }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              disabled,
              checked: prefs.eventAlertEnabled,
              onCheckedChange: (v) => update("eventAlertEnabled", v)
            }
          )
        ] }),
        prefs.eventAlertEnabled && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: LEAD_OPTIONS.map((m) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => update("eventAlertMinutes", m.value),
            className: cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              prefs.eventAlertMinutes === m.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
            ),
            children: m.label
          },
          m.value
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("flex items-center justify-between rounded-lg border border-border p-4", disabled && "opacity-50"), children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-medium", children: "Shift start alert" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "A distinct sound right before a shift begins." })
        ] }),
        /* @__PURE__ */ jsx(
          Switch,
          {
            disabled,
            checked: prefs.shiftAlertEnabled,
            onCheckedChange: (v) => update("shiftAlertEnabled", v)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("space-y-3 rounded-lg border border-border p-4", disabled && "opacity-50"), children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-medium", children: "Shift start alert sound" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Plays when your shift is about to begin." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: SHIFT_ALERT_SOUNDS.map((s) => {
          const selected = prefs.shiftAlertSound === s.value;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
                selected ? "border-primary bg-primary/5" : "border-border bg-card"
              ),
              children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    disabled,
                    onClick: () => update("shiftAlertSound", s.value),
                    className: "flex flex-1 items-center gap-2 text-left text-sm font-medium",
                    children: [
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: cn(
                            "inline-flex size-4 items-center justify-center rounded-full border",
                            selected ? "border-primary" : "border-muted-foreground/40"
                          ),
                          children: selected && /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full bg-primary" })
                        }
                      ),
                      s.label
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    disabled: disabled || s.value === "none",
                    onClick: () => playShiftAlertSound(s.value),
                    "aria-label": `Preview ${s.label}`,
                    children: /* @__PURE__ */ jsx(Play, { className: "size-3.5" })
                  }
                )
              ]
            },
            s.value
          );
        }) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "💡 For the alert to play, Kookaflow must be open or running in the background. Enable push notifications for alerts when the app is closed." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("space-y-3 rounded-lg border border-border p-4", disabled && "opacity-50"), children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-base font-medium", children: "Ambient focus mode" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Soft looping background sound while the app is open." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: AMBIENT_OPTIONS.map((o) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => update("ambient", o.value),
            className: cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              prefs.ambient === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
            ),
            children: [
              o.icon,
              o.label
            ]
          },
          o.value
        )) }),
        prefs.ambient !== "off" && prefs.masterEnabled && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Playing ",
          AMBIENT_OPTIONS.find((o) => o.value === prefs.ambient)?.label.toLowerCase(),
          " — toggle off to stop."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: handleSave, children: saved ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Check, { className: "size-4 mr-1.5" }),
        " Saved"
      ] }) : "Save Preferences" }) })
    ] })
  ] });
}
const CATEGORY_LABEL = {
  work: "Work",
  rest: "Rest",
  wellness: "Wellness",
  exercise: "Exercise",
  social: "Social",
  family: "Family",
  personal: "Personal",
  travel: "Travel"
};
function ExportSection() {
  const { events } = useEvents();
  const [busy, setBusy] = useState(null);
  async function exportPdf() {
    try {
      setBusy("pdf");
      const now = /* @__PURE__ */ new Date();
      const monthLabel = format(now, "MMMM yyyy");
      const filename = `Kookaflow-${format(now, "MMMM")}-${format(now, "yyyy")}.pdf`;
      generateMonthlyPdf(events, now, monthLabel).save(filename);
      toast.success("Monthly report downloaded");
    } catch (e) {
      toast.error(e.message || "Could not generate PDF");
    } finally {
      setBusy(null);
    }
  }
  function exportCsv() {
    try {
      setBusy("csv");
      const csv = eventsToCsv(events);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kookaflow-events-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (e) {
      toast.error(e.message || "Could not generate CSV");
    } finally {
      setBusy(null);
    }
  }
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Download, { className: "size-4 text-primary" }),
        " Export"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Download your data for record-keeping or sharing." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          className: "w-full justify-start gap-2",
          onClick: exportPdf,
          disabled: busy !== null,
          children: [
            /* @__PURE__ */ jsx(FileText, { className: "size-4 text-primary" }),
            busy === "pdf" ? "Generating…" : "Export Monthly Report"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          className: "w-full justify-start gap-2",
          onClick: exportCsv,
          disabled: busy !== null,
          children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { className: "size-4 text-primary" }),
            busy === "csv" ? "Generating…" : "Export Events as CSV"
          ]
        }
      )
    ] })
  ] });
}
function eventsToCsv(events) {
  const headers = [
    "Date",
    "Title",
    "Category",
    "Shift Type",
    "Start Time",
    "End Time",
    "Duration (hrs)",
    "Earnings"
  ];
  const rows = events.map((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const hours = Math.max(0, (end.getTime() - start.getTime()) / 36e5);
    return [
      format(start, "yyyy-MM-dd"),
      e.title,
      CATEGORY_LABEL[e.category] ?? e.category,
      e.shift?.shiftType ?? "",
      format(start, "HH:mm"),
      format(end, "HH:mm"),
      hours.toFixed(2),
      ""
    ];
  });
  return [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}
function csvCell(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function generateMonthlyPdf(events, anchor, monthLabel) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("Kookaflow", margin, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Monthly Report — ${monthLabel}`, margin, 68);
  const gridTop = 96;
  const gridLeft = margin;
  const gridRight = pageWidth - margin;
  const cellW = (gridRight - gridLeft) / 7;
  const cellH = 70;
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d, i) => {
    doc.text(d, gridLeft + i * cellW + 4, gridTop - 6);
  });
  const byDay = /* @__PURE__ */ new Map();
  events.forEach((e) => {
    const k = format(new Date(e.start), "yyyy-MM-dd");
    const arr = byDay.get(k) ?? [];
    arr.push(e);
    byDay.set(k, arr);
  });
  doc.setDrawColor(226, 232, 240);
  days.forEach((d, idx) => {
    const row = Math.floor(idx / 7);
    const col = idx % 7;
    const x = gridLeft + col * cellW;
    const y2 = gridTop + row * cellH;
    doc.rect(x, y2, cellW, cellH);
    doc.setFontSize(9);
    doc.setTextColor(isSameMonth(d, anchor) ? 15 : 200, 23, 42);
    doc.text(String(d.getDate()), x + 4, y2 + 12);
    const dayEvents = (byDay.get(format(d, "yyyy-MM-dd")) ?? []).slice(0, 3);
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    dayEvents.forEach((e, i) => {
      const label = e.title.length > 18 ? e.title.slice(0, 17) + "…" : e.title;
      doc.text(`• ${label}`, x + 4, y2 + 24 + i * 10);
    });
  });
  const inMonth = events.filter((e) => isSameMonth(new Date(e.start), anchor));
  const totals = /* @__PURE__ */ new Map();
  inMonth.forEach((e) => {
    const hrs = Math.max(0, (new Date(e.end).getTime() - new Date(e.start).getTime()) / 36e5);
    totals.set(e.category, (totals.get(e.category) ?? 0) + hrs);
  });
  const totalsTop = gridTop + Math.ceil(days.length / 7) * cellH + 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Total hours by category", margin, totalsTop);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  let y = totalsTop + 18;
  const sortedTotals = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  sortedTotals.forEach(([cat, hrs]) => {
    doc.text(`${CATEGORY_LABEL[cat] ?? cat}`, margin, y);
    doc.text(`${hrs.toFixed(1)} h`, margin + 200, y);
    y += 16;
  });
  if (sortedTotals.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text("No events this month.", margin, y);
    y += 16;
  }
  const totalHrs = [...totals.values()].reduce((a, b) => a + b, 0);
  const workHrs = totals.get("work") ?? 0;
  const score = totalHrs === 0 ? 0 : Math.round((totalHrs - workHrs) / totalHrs * 100);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Balance score: ${score}/100`, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Share of non-work time across logged activities this month.",
    margin,
    y + 14
  );
  return doc;
}
const SHARE_TEXT = "I use Kookaflow to manage my shifts and find my flow — find your flow too! kookaflow.com";
const APP_STORE_URL = "#";
function AboutSection() {
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Kookaflow", text: SHARE_TEXT });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_TEXT);
      toast.success("Share message copied to clipboard");
    } catch {
      toast.error("Couldn't open share sheet");
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "About" }),
    /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
      /* @__PURE__ */ jsx(RowLink, { to: "/privacy", icon: /* @__PURE__ */ jsx(ShieldCheck, { size: 18 }), label: "Privacy Policy" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(RowLink, { to: "/terms", icon: /* @__PURE__ */ jsx(FileText, { size: 18 }), label: "Terms of Service" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(RowLink, { to: "/support", icon: /* @__PURE__ */ jsx(HelpCircle, { size: 18 }), label: "Support & Help" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(RowLink, { to: "/eula", icon: /* @__PURE__ */ jsx(Scale, { size: 18 }), label: "EULA" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(RowExternal, { href: APP_STORE_URL, icon: /* @__PURE__ */ jsx(Star, { size: 18 }), label: "Rate Kookaflow ⭐" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(RowButton, { onClick: share, icon: /* @__PURE__ */ jsx(Share2, { size: 18 }), label: "Share Kookaflow" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-0.5 text-center text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsx("div", { children: "App Version v1.0.0" }),
      /* @__PURE__ */ jsx("div", { children: "© 2026 Kookaflow" })
    ] })
  ] });
}
function Divider() {
  return /* @__PURE__ */ jsx("div", { className: "mx-4 h-px bg-border" });
}
function RowShell({ icon, label, trailing }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", children: icon }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 text-sm font-medium", children: label }),
    trailing ?? /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
  ] });
}
function RowLink({ to, icon, label }) {
  return /* @__PURE__ */ jsx(Link, { to, className: "block transition-colors hover:bg-accent/40", children: /* @__PURE__ */ jsx(RowShell, { icon, label }) });
}
function RowExternal({ href, icon, label }) {
  return /* @__PURE__ */ jsx("a", { href, target: "_blank", rel: "noopener", className: "block transition-colors hover:bg-accent/40", children: /* @__PURE__ */ jsx(RowShell, { icon, label }) });
}
function RowButton({ onClick, icon, label }) {
  return /* @__PURE__ */ jsx("button", { type: "button", onClick, className: "block w-full text-left transition-colors hover:bg-accent/40", children: /* @__PURE__ */ jsx(RowShell, { icon, label }) });
}
const deleteAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("605045233debcf4fbca7c93f06a21eab51d31e90e5fab3208ca6233b08e8f1d1"));
function DangerZone() {
  const navigate = useNavigate();
  const runDelete = useServerFn(deleteAccount);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const mut = useMutation({
    mutationFn: () => runDelete(),
    onSuccess: async () => {
      await supabase.auth.signOut();
      toast.success("Your account has been permanently deleted.");
      navigate({ to: "/login" });
    },
    onError: (err) => {
      toast.error(err.message || "Could not delete account");
    }
  });
  const canDelete = confirmText.trim() === "DELETE" && !mut.isPending;
  return /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-destructive", children: "Danger Zone" }),
    /* @__PURE__ */ jsx("div", { className: "rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsx(AlertOctagon, { size: 18 }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Delete Account" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "This permanently deletes your account and all your data including shifts, events, and preferences. This cannot be undone." }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "mt-3 gap-2 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive",
            onClick: () => {
              setConfirmText("");
              setOpen(true);
            },
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
              "Delete My Account"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (o) => !mut.isPending && setOpen(o), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Are you absolutely sure?" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "text-foreground/90", children: "This will permanently delete:" })
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("li", { children: "✗ All your shifts and events" }),
        /* @__PURE__ */ jsx("li", { children: "✗ Your life balance history" }),
        /* @__PURE__ */ jsx("li", { children: "✗ Your preferences and settings" }),
        /* @__PURE__ */ jsx("li", { children: "✗ Your account" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-destructive", children: "This cannot be undone." }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "confirm-delete", className: "text-xs font-medium text-foreground", children: [
          "Type ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: "DELETE" }),
          " to confirm"
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "confirm-delete",
            value: confirmText,
            onChange: (e) => setConfirmText(e.target.value),
            placeholder: "DELETE",
            autoComplete: "off",
            disabled: mut.isPending
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            onClick: () => setOpen(false),
            disabled: mut.isPending,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            disabled: !canDelete,
            onClick: () => mut.mutate(),
            children: mut.isPending ? "Deleting…" : "Permanently Delete Account"
          }
        )
      ] })
    ] }) })
  ] });
}
function MorePage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(MoreHero, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl p-4 sm:p-6", children: [
      /* @__PURE__ */ jsx(AccountSection, {}),
      /* @__PURE__ */ jsx(CalendarPreferences, {}),
      /* @__PURE__ */ jsx(ConnectedCalendars, {}),
      /* @__PURE__ */ jsx(ShiftsLinkRow, {}),
      /* @__PURE__ */ jsx(ThemeSettings, {}),
      /* @__PURE__ */ jsx(RemindersSettings, {}),
      /* @__PURE__ */ jsx(SoundNotifications, {}),
      /* @__PURE__ */ jsx(ExportSection, {}),
      /* @__PURE__ */ jsx(AboutSection, {}),
      /* @__PURE__ */ jsx(DangerZone, {}),
      /* @__PURE__ */ jsx(SignOutSection, {})
    ] })
  ] });
}
export {
  MorePage as component
};
