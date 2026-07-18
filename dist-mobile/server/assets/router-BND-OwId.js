import { QueryClientProvider, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useRouter, isRedirect, useRouterState, Link, createRootRouteWithContext, HeadContent, Scripts, Outlet, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useRef, useEffect, useMemo, createContext, useContext, useCallback } from "react";
import { s as supabase } from "./client-BiJkZOJ7.js";
import { CalendarDays, BarChart2, Briefcase, LayoutGrid, X, Bell, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import OneSignal from "react-onesignal";
import { T as TSS_SERVER_FUNCTION, f as getServerFnById, e as createServerFn } from "./server-DjzWdpJV.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DFGJyMRd.js";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Toaster as Toaster$1, toast } from "sonner";
import { createTanStackMcpHandler, createTanStackOAuthProtectedResourceMetadataHandler, createTanStackListToolsHandler, createTanStackInvokeToolHandler } from "@lovable.dev/mcp-js/stacks/tanstack";
import { defineTool, defineMcp, auth } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
import { v as verifyState, g as getRedirectUri, e as exchangeCodeForTokens, b as getUserInfoEmail, s as syncUserCalendar } from "./google-calendar.server-B_7mIU_e.js";
import { a as getStripe, p as planForPriceId } from "./stripe.server-DLwKer5H.js";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
const appCss = "/assets/styles-Buh1dAF0.css";
function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
const THEMES = [
  {
    name: "slate",
    label: "Slate",
    description: "Calm, broad-appeal blue.",
    preview: { bgLight: "#F8FAFC", bgDark: "#0F172A", surface: "#E2E8F0", accent: "#3B82F6", highlight: "#F97316" }
  },
  {
    name: "midnight",
    label: "Midnight",
    description: "Deep navy with teal & amber.",
    preview: { bgLight: "#F8FAFC", bgDark: "#0F172A", surface: "#1E293B", accent: "#14B8A6", highlight: "#F59E0B" }
  },
  {
    name: "lavender",
    label: "Lavender",
    description: "Soft purple with violet & coral.",
    preview: { bgLight: "#F5F3FF", bgDark: "#1E1B2E", surface: "#EDE9FE", accent: "#7C3AED", highlight: "#F43F5E" }
  },
  {
    name: "forest",
    label: "Forest",
    description: "Emerald with sunny yellow.",
    preview: { bgLight: "#F0FDF4", bgDark: "#1C1C2E", surface: "#DCFCE7", accent: "#10B981", highlight: "#FCD34D" }
  }
];
const DEFAULT_THEME = "midnight";
const DEFAULT_MODE = "system";
function isThemeName(v) {
  return v === "slate" || v === "midnight" || v === "lavender" || v === "forest";
}
function isThemeMode(v) {
  return v === "light" || v === "dark" || v === "system";
}
const KEY = "kookaflow.prefs.v1";
const DEFAULT = {
  themeName: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  defaultView: "month",
  weekStartsOn: 1
};
const PreferencesContext = createContext(null);
function migrateLegacy(raw) {
  if (!raw || typeof raw !== "object") return DEFAULT;
  const r = raw;
  const themeName = isThemeName(r.themeName) ? r.themeName : DEFAULT.themeName;
  let mode = DEFAULT.mode;
  if (isThemeMode(r.mode)) mode = r.mode;
  else if (r.theme === "light" || r.theme === "dark") mode = r.theme;
  const defaultView = r.defaultView === "month" || r.defaultView === "week" || r.defaultView === "day" ? r.defaultView : DEFAULT.defaultView;
  const weekStartsOn = r.weekStartsOn === 0 ? 0 : 1;
  return { themeName, mode, defaultView, weekStartsOn };
}
function resolveDarkClass(mode) {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFAULT);
  const hydratedRef = useRef(false);
  const syncTimer = useRef(null);
  useEffect(() => {
    const stored = loadJSON(KEY, null);
    setPrefs(migrateLegacy(stored));
    hydratedRef.current = true;
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = prefs.themeName;
    document.documentElement.classList.toggle("dark", resolveDarkClass(prefs.mode));
    if (hydratedRef.current) saveJSON(KEY, prefs);
  }, [prefs]);
  useEffect(() => {
    if (prefs.mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => document.documentElement.classList.toggle("dark", mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs.mode]);
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const { data: row } = await supabase.from("user_preferences").select("theme, theme_mode").eq("user_id", data.user.id).maybeSingle();
      if (cancelled || !row) return;
      setPrefs((p) => ({
        ...p,
        themeName: isThemeName(row.theme) ? row.theme : p.themeName,
        mode: isThemeMode(row.theme_mode) ? row.theme_mode : p.mode
      }));
    }
    pull();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") pull();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const persistMode = prefs.mode === "system" ? resolveDarkClass("system") ? "dark" : "light" : prefs.mode;
      await supabase.from("user_preferences").update({ theme: prefs.themeName, theme_mode: persistMode }).eq("user_id", data.user.id);
    }, 400);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [prefs.themeName, prefs.mode]);
  const value = useMemo(() => ({
    prefs,
    setThemeName: (themeName) => setPrefs((p) => ({ ...p, themeName })),
    setMode: (mode) => setPrefs((p) => ({ ...p, mode })),
    toggleMode: () => setPrefs((p) => ({ ...p, mode: resolveDarkClass(p.mode) ? "light" : "dark" })),
    toggleTheme: () => setPrefs((p) => ({ ...p, mode: resolveDarkClass(p.mode) ? "light" : "dark" })),
    setDefaultView: (defaultView) => setPrefs((p) => ({ ...p, defaultView }))
  }), [prefs]);
  return /* @__PURE__ */ jsx(PreferencesContext.Provider, { value, children });
}
function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const logo = "/assets/kookaflow-logo-TQ7wut1r.png";
const NAV_ITEMS = [
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { to: "/shifts", label: "Shifts", icon: Briefcase },
  { to: "/more", label: "More", icon: LayoutGrid }
];
function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("aside", { className: "fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-card md:flex lg:w-56", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-5 py-5", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: logo,
            alt: "Kookaflow",
            style: { height: 48, width: "auto" },
            className: "object-contain"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-bold tracking-tight", children: "Kookaflow" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex flex-1 flex-col gap-1 px-3", children: NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.to);
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.to,
            className: cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "size-4" }),
              /* @__PURE__ */ jsx("span", { children: item.label })
            ]
          },
          item.to
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx(
      "nav",
      {
        className: "fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.15)] md:hidden",
        style: { paddingBottom: "env(safe-area-inset-bottom)" },
        children: NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return /* @__PURE__ */ jsxs(
            Link,
            {
              to: item.to,
              className: cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-12 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              ),
              children: [
                /* @__PURE__ */ jsx(
                  Icon,
                  {
                    size: 22,
                    strokeWidth: active ? 2.5 : 2,
                    fill: active ? "currentColor" : "none",
                    fillOpacity: active ? 0.15 : 0,
                    className: cn(active && "text-primary")
                  }
                ),
                /* @__PURE__ */ jsx("span", { children: item.label })
              ]
            },
            item.to
          );
        })
      }
    )
  ] });
}
const SyncContext = createContext(null);
function SyncStatusProvider({ children }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const startSync = useCallback(() => setIsSyncing(true), []);
  const endSync = useCallback(() => setIsSyncing(false), []);
  return /* @__PURE__ */ jsx(SyncContext.Provider, { value: { isSyncing, startSync, endSync }, children });
}
function useSyncStatus() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSyncStatus must be used inside SyncStatusProvider");
  return ctx;
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getOneSignalConfig = createServerFn({
  method: "GET"
}).handler(createSsrRpc("adde96f63af5b06d261cf7992215c5410b20b0207cd86904d1b79613332c2274"));
const updatePushSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  playerId: z.string().min(1).max(200).nullable(),
  enabled: z.boolean()
}).parse(input)).handler(createSsrRpc("564774cc5d10c59626aadb13d6e0edd6150c16b24551ba3f73d342d74e0d8024"));
const getPushStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c20f88eac8d5893b56159e9fd24a88aa0527a6da3bb0296b5ee39aa431158954"));
const updatePushPrefs = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  push_daily_reminder: z.boolean().optional(),
  push_weekly_reminder: z.boolean().optional(),
  push_shift_alerts: z.boolean().optional()
}).parse(input)).handler(createSsrRpc("867f5ab2f08a9ea12753a77405335a09484a1dd7f1e72d5df96c5e5e65d9bde5"));
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-white shadow hover:opacity-90 [background:radial-gradient(ellipse_at_80%_20%,#ffc338_0%,#fb862a_25%,#7e294d_60%,#251074_100%)]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const DISMISS_KEY = "kookaflow.push.dismissedAt";
const DISMISS_DAYS = 7;
function recentlyDismissed() {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1e3;
  } catch {
    return false;
  }
}
function PushPermissionPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    if (recentlyDismissed()) return;
    const t = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(t);
  }, []);
  if (!open) return null;
  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
    }
    setOpen(false);
  };
  const enable = async () => {
    setBusy(true);
    try {
      await OneSignal.Notifications.requestPermission();
    } catch (e) {
      console.error("Permission request failed", e);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 animate-in slide-in-from-bottom-8 duration-300", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: dismiss,
        "aria-label": "Dismiss",
        className: "absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground",
        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "Kookaflow", className: "h-10 w-auto" }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-full bg-amber-500/15 p-2", children: /* @__PURE__ */ jsx(Bell, { className: "h-8 w-8 text-amber-500" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground", children: "Never miss a shift 🦅" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Enable notifications to get reminders before your shifts start and your daily summary each morning." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: enable,
          disabled: busy,
          className: "w-full bg-gradient-to-r from-[hsl(var(--brand-navy,231_56%_27%))] to-amber-500 text-white hover:opacity-95",
          style: {
            backgroundImage: "linear-gradient(to right, #1E2A6E, #F59E0B)"
          },
          children: busy ? "Asking…" : "Enable notifications"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: dismiss,
          className: "block w-full text-center text-sm text-muted-foreground hover:text-foreground",
          children: "Maybe later"
        }
      )
    ] })
  ] }) });
}
let initialised = false;
function OneSignalProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const persistFn = useServerFn(updatePushSubscription);
  const cfgFn = useServerFn(getOneSignalConfig);
  const lastPlayerId = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined" || initialised) return;
    initialised = true;
    (async () => {
      try {
        const cfg = await cfgFn();
        if (!cfg.appId) return;
        await OneSignal.init({
          appId: cfg.appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" }
        });
        setReady(true);
      } catch (e) {
        console.error("OneSignal init failed", e);
      }
    })();
  }, [cfgFn]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!ready || !userId) return;
    (async () => {
      try {
        await OneSignal.login(userId);
      } catch (e) {
        console.error("OneSignal login failed", e);
      }
    })();
  }, [ready, userId]);
  useEffect(() => {
    if (!ready || !userId) return;
    const handler = async () => {
      try {
        const playerId = OneSignal.User.PushSubscription.id ?? null;
        const optedIn = OneSignal.User.PushSubscription.optedIn ?? false;
        if (playerId === lastPlayerId.current) return;
        lastPlayerId.current = playerId;
        await persistFn({ data: { playerId, enabled: !!optedIn && !!playerId } });
      } catch (e) {
        console.error("Failed to persist OneSignal subscription", e);
      }
    };
    handler();
    OneSignal.User.PushSubscription.addEventListener("change", handler);
    return () => {
      OneSignal.User.PushSubscription.removeEventListener("change", handler);
    };
  }, [ready, userId, persistFn]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    children,
    ready && userId ? /* @__PURE__ */ jsx(PushPermissionPrompt, {}) : null
  ] });
}
function SyncBanner() {
  const { isSyncing } = useSyncStatus();
  if (!isSyncing) return null;
  return /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-40 flex items-center gap-2 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground backdrop-blur", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "size-4 shrink-0 animate-spin text-primary" }),
    /* @__PURE__ */ jsx("span", { children: "Syncing your calendar — this may take a few minutes depending on how many events you have ☕" })
  ] });
}
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRecovered, setShowRecovered] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const goOffline = () => setIsOnline(false);
    const goOnline = () => {
      setIsOnline((prev) => {
        if (!prev) setShowRecovered(true);
        return true;
      });
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);
  useEffect(() => {
    if (!showRecovered) return;
    const t = setTimeout(() => setShowRecovered(false), 3e3);
    return () => clearTimeout(t);
  }, [showRecovered]);
  if (!isOnline) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        className: "sticky top-0 z-50 flex h-9 w-full items-center justify-center bg-[#F59E0B] px-4 text-[13px] font-bold text-white",
        children: "You're offline — changes will sync when you reconnect"
      }
    );
  }
  if (showRecovered) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        role: "status",
        "aria-live": "polite",
        className: "sticky top-0 z-50 flex h-9 w-full items-center justify-center bg-[#10B981] px-4 text-[13px] font-bold text-white animate-in fade-in slide-in-from-top-2 duration-200",
        children: "Back online — syncing... ✓"
      }
    );
  }
  return null;
}
const BRAND_GRADIENT = "radial-gradient(ellipse at 80% 20%, #ffc338 0%, #fb862a 25%, #7e294d 60%, #251074 100%)";
function SplashScreen({ duration = 1500 }) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), duration);
    const t2 = setTimeout(() => setVisible(false), duration + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration]);
  if (!visible) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500",
      style: {
        background: BRAND_GRADIENT,
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? "none" : "auto"
      },
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: logo,
            alt: "Kookaflow",
            style: { height: 140, width: "auto" },
            className: "object-contain"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-3xl font-bold tracking-tight text-white", children: "Kookaflow" })
      ]
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$w = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { name: "google-site-verification", content: "bcV_myttg-cEbX2Xffm26CdzaGvQ_xEQ6HLwjATKFpw" },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Kookaflow — Find your flow, whatever your hours" },
      { name: "description", content: "Kookaflow helps shift workers plan shifts and balance rest, wellness, family, and social time." },
      { name: "author", content: "Kookaflow" },
      { property: "og:title", content: "Kookaflow — Find your flow, whatever your hours" },
      { property: "og:description", content: "Kookaflow helps shift workers plan shifts and balance rest, wellness, family, and social time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "theme-color", content: "#1E2A6E" },
      { name: "twitter:title", content: "Kookaflow — Find your flow, whatever your hours" },
      { name: "twitter:description", content: "Kookaflow helps shift workers plan shifts and balance rest, wellness, family, and social time." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d43d583-d01a-499d-9b06-bc8d13f6e7fb/id-preview-c3b21344--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app-1779550240470.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d43d583-d01a-499d-9b06-bc8d13f6e7fb/id-preview-c3b21344--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app-1779550240470.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$w.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(PreferencesProvider, { children: /* @__PURE__ */ jsx(SyncStatusProvider, { children: /* @__PURE__ */ jsxs(OneSignalProvider, { children: [
    /* @__PURE__ */ jsx(SplashScreen, {}),
    /* @__PURE__ */ jsx(AppLayout, {}),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(AuthListener, {})
  ] }) }) }) });
}
function AuthListener() {
  const router2 = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        toast("Your session timed out — please sign in again");
      }
      router2.invalidate();
      queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router2, queryClient]);
  return null;
}
function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showNav = ["/calendar", "/dashboard", "/shifts", "/settings", "/more"].some(
    (p) => pathname.startsWith(p)
  );
  if (!showNav) return /* @__PURE__ */ jsx(Outlet, {});
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(OfflineBanner, {}),
    /* @__PURE__ */ jsx(SyncBanner, {}),
    /* @__PURE__ */ jsx(AppNav, {}),
    /* @__PURE__ */ jsx("div", { className: "md:pl-56", children: /* @__PURE__ */ jsx("div", { className: "pb-16 md:pb-0", children: /* @__PURE__ */ jsx(Outlet, {}) }) })
  ] });
}
const $$splitComponentImporter$h = () => import("./terms-Cqpi21cG.js");
const Route$v = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms of Service — Kookaflow"
    }, {
      name: "description",
      content: "The terms that govern your use of Kookaflow."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./support-PDpHqGUe.js");
const Route$u = createFileRoute("/support")({
  head: () => ({
    meta: [{
      title: "Support — Kookaflow"
    }, {
      name: "description",
      content: "Get help with Kookaflow. FAQs and contact."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./signup-DYIM6TFT.js");
const Route$t = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Create account — Kookaflow"
    }]
  }),
  validateSearch: (s) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//") ? s.next : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./reset-password-D37F47_n.js");
const Route$s = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Reset password — Kookaflow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./privacy-BQ-wKBH0.js");
const Route$r = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy — Kookaflow"
    }, {
      name: "description",
      content: "How Kookaflow collects, uses, and protects your data."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./pricing-DAv_lNau.js");
const Route$q = createFileRoute("/pricing")({
  head: () => ({
    meta: [{
      title: "Pricing — Kookaflow"
    }, {
      name: "description",
      content: "Simple pricing for shift workers. Try Kookaflow free for 14 days, then choose the plan that fits your life."
    }, {
      property: "og:title",
      content: "Pricing — Kookaflow"
    }, {
      property: "og:description",
      content: "14-day free trial. Pro from $4.99 AUD/mo, or pay once for Lifetime Pro."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
function supabaseForUser(ctx) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  const token = ctx.getToken();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        if (token) h.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      }
    }
  });
}
const listEventsTool = defineTool({
  name: "list_events",
  title: "List calendar events",
  description: "List the signed-in user's Kookaflow calendar events (shifts and personal events) between two ISO datetimes.",
  inputSchema: {
    from: z.string().describe("Start of range, ISO 8601 datetime (e.g. 2026-07-18T00:00:00Z)."),
    to: z.string().describe("End of range, ISO 8601 datetime."),
    category: z.enum(["work", "rest", "wellness", "exercise", "social", "family", "personal", "travel"]).optional().describe("Optional category filter."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows (default 100).")
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase2 = supabaseForUser(ctx);
    let query = supabase2.from("events").select(
      "id,title,category,start_time,end_time,is_all_day,shift_type,shift_role,location,notes"
    ).gte("start_time", from).lte("start_time", to).order("start_time", { ascending: true }).limit(limit ?? 100);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { events: data ?? [] }
    };
  }
});
const createEventTool = defineTool({
  name: "create_event",
  title: "Create calendar event",
  description: "Create a new event in the signed-in user's Kookaflow calendar (shift or personal event).",
  inputSchema: {
    title: z.string().min(1).max(200).describe("Event title."),
    category: z.enum(["work", "rest", "wellness", "exercise", "social", "family", "personal", "travel"]).describe("Life category for the event."),
    start: z.string().describe("Start datetime, ISO 8601."),
    end: z.string().describe("End datetime, ISO 8601."),
    isAllDay: z.boolean().optional(),
    notes: z.string().max(2e3).optional(),
    location: z.string().max(200).optional()
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const userId = ctx.getUserId();
    if (!ctx.isAuthenticated() || !userId) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase2 = supabaseForUser(ctx);
    const { data, error } = await supabase2.from("events").insert({
      user_id: userId,
      title: input.title,
      category: input.category,
      start_time: input.start,
      end_time: input.end,
      is_all_day: input.isAllDay ?? false,
      notes: input.notes ?? null,
      location: input.location ?? null
    }).select("id,title,category,start_time,end_time").single();
    if (error || !data) {
      return { content: [{ type: "text", text: error?.message ?? "Insert failed" }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Created event ${data.id}: ${data.title}` }],
      structuredContent: { event: data }
    };
  }
});
const projectRef = "zssperwyftamtseuojqg";
const mcp = defineMcp({
  name: "kookaflow-mcp",
  title: "Kookaflow",
  version: "0.1.0",
  instructions: "Tools for the signed-in Kookaflow user. Use `list_events` to read shifts and personal events for a date range, and `create_event` to add new events to their calendar.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated"
  }),
  tools: [listEventsTool, createEventTool]
});
const Route$p = createFileRoute("/mcp")({
  server: {
    handlers: {
      ANY: createTanStackMcpHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
const $$splitComponentImporter$b = () => import("./login-to8Sylgp.js");
const Route$o = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in — Kookaflow"
    }]
  }),
  validateSearch: (s) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//") ? s.next : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./eula-CTdTyzdN.js");
const Route$n = createFileRoute("/eula")({
  head: () => ({
    meta: [{
      title: "End User Licence Agreement — Kookaflow"
    }, {
      name: "description",
      content: "End User Licence Agreement for the Kookaflow mobile and web app."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_authenticated-Cpv312aN.js");
const Route$m = createFileRoute("/_authenticated")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./index-Dc6z1I8S.js");
const Route$l = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Kookaflow — Find your flow, whatever your hours"
    }, {
      name: "description",
      content: "Kookaflow is the shift calendar that cares about your whole life. Built for nurses, paramedics, and shift workers who want balance, not burnout."
    }, {
      property: "og:title",
      content: "Kookaflow — The shift worker life balance calendar"
    }, {
      property: "og:description",
      content: "Track shifts, see your life balance, and get gentle nudges toward rest, wellness, and family."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./pro.success-DkthURS0.js");
const Route$k = createFileRoute("/pro/success")({
  head: () => ({
    meta: [{
      title: "Welcome to Pro — Kookaflow"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_authenticated.shifts-BhI5Cn7V.js");
const Route$j = createFileRoute("/_authenticated/shifts")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_authenticated.settings-DPtiBEbS.js");
const Route$i = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{
      title: "Account Settings — Kookaflow"
    }, {
      name: "description",
      content: "Manage your profile, shift pattern and security."
    }, {
      property: "og:title",
      content: "Account Settings — Kookaflow"
    }, {
      property: "og:description",
      content: "Manage your profile, shift pattern and security."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_authenticated.onboarding-DLBmnIkr.js");
const Route$h = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [{
      title: "Welcome — Kookaflow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_authenticated.more-lDtyURou.js");
const Route$g = createFileRoute("/_authenticated/more")({
  head: () => ({
    meta: [{
      title: "More — Kookaflow"
    }, {
      name: "description",
      content: "Preferences, calendar settings, notifications, exports and support for Kookaflow."
    }, {
      property: "og:title",
      content: "More — Kookaflow"
    }, {
      property: "og:description",
      content: "Preferences, calendar settings, notifications, exports and support for Kookaflow."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_authenticated.dashboard-B4Z0r5g-.js");
const Route$f = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — Kookaflow"
    }, {
      name: "description",
      content: "Your life-balance dashboard: weekly hours, monthly distribution, and research-backed wellness nudges."
    }, {
      property: "og:title",
      content: "Dashboard — Kookaflow"
    }, {
      property: "og:description",
      content: "See how your time spreads across work, rest, wellness, exercise, and relationships."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_authenticated.calendar-Di0pbWSq.js");
const Route$e = createFileRoute("/_authenticated/calendar")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const Route$d = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      ANY: createTanStackOAuthProtectedResourceMetadataHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
const Route$c = createFileRoute("/.mcp/list-tools")({
  server: {
    handlers: {
      // ANY: TanStack returns SPA HTML for methods not in `handlers`; the SDK 405s instead.
      ANY: createTanStackListToolsHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
function escapeHtml$2(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function htmlResponse(title, body, status = 200) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}main{max-width:420px}h1{margin:0 0 12px;font-size:22px}p{color:#aaa;margin:0 0 24px}a{display:inline-block;padding:10px 18px;border-radius:8px;background:#fff;color:#000;text-decoration:none;font-weight:600}</style>
    </head><body><main>${body}<p style="margin-top:24px"><a href="/settings">Back to Settings</a></p></main>
    <script>setTimeout(function(){location.href="/settings?google=connected"},1500)<\/script>
    </body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
const Route$b = createFileRoute("/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        if (error) {
          return htmlResponse(
            "Connection cancelled",
            `<h1>Connection cancelled</h1><p>${escapeHtml$2(error)}</p>`,
            400
          );
        }
        if (!code || !state) {
          return htmlResponse(
            "Missing parameters",
            `<h1>Missing code or state</h1>`,
            400
          );
        }
        const userId = verifyState(state);
        if (!userId) {
          return htmlResponse(
            "Invalid state",
            `<h1>Invalid or expired state</h1><p>Please try connecting again.</p>`,
            400
          );
        }
        try {
          const redirectUri = getRedirectUri(request);
          const tokens = await exchangeCodeForTokens(code, redirectUri);
          const email = await getUserInfoEmail(tokens.access_token);
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1e3);
          await supabaseAdmin.from("google_calendar_connections").upsert(
            {
              user_id: userId,
              google_email: email,
              google_calendar_id: "primary",
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              token_expires_at: expiresAt.toISOString(),
              scope: tokens.scope,
              last_sync_error: null,
              sync_token: null
            },
            { onConflict: "user_id" }
          );
          syncUserCalendar(userId).catch(
            (e) => console.warn("initial google sync failed", e)
          );
          return htmlResponse(
            "Connected!",
            `<h1>Google Calendar connected</h1><p>${escapeHtml$2(email ?? "")}</p><p>Returning to Settings…</p>`
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return htmlResponse(
            "Connection failed",
            `<h1>Connection failed</h1><p>${escapeHtml$2(msg)}</p>`,
            500
          );
        }
      }
    }
  }
});
const Route$a = createFileRoute("/.mcp/invoke-tool/$tool")({
  server: {
    handlers: {
      // ANY: TanStack returns SPA HTML for methods not in `handlers`; the SDK 405s instead.
      ANY: createTanStackInvokeToolHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
function oauthClient() {
  return supabase;
}
const $$splitErrorComponentImporter = () => import("./_._lovable.oauth.consent-D5zJKxGs.js");
const $$splitComponentImporter = () => import("./_._lovable.oauth.consent-DmqJqEJh.js");
const Route$9 = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : ""
  }),
  beforeLoad: async ({
    search,
    location
  }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({
        to: "/login",
        search: {
          next
        }
      });
    }
  },
  loader: async ({
    location
  }) => {
    const params = new URLSearchParams(location.search);
    const authorizationId = params.get("authorization_id");
    const {
      data,
      error
    } = await oauthClient().auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({
      href: immediate
    });
    return data;
  },
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
const Route$8 = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });
        const body = await request.text();
        const stripe = getStripe();
        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, signature, secret);
        } catch (err) {
          console.error("Stripe webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }
        try {
          await handleEvent(event);
        } catch (err) {
          console.error("Stripe webhook handler error:", event.type, err);
          return new Response("Handler error", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      }
    }
  }
});
async function handleEvent(event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id || session.client_reference_id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      if (!userId) return;
      if (session.mode === "payment") {
        const stripe = getStripe();
        const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
        const priceId = items.data[0]?.price?.id;
        const plan = priceId ? planForPriceId(priceId) : null;
        if (!plan) return;
        await supabaseAdmin.from("profiles").update({
          subscription_tier: plan.tier,
          subscription_status: "active",
          subscription_end_date: null,
          stripe_customer_id: customerId
        }).eq("id", userId);
      }
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const userId = sub.metadata?.supabase_user_id ?? await lookupUserByCustomer(typeof sub.customer === "string" ? sub.customer : sub.customer.id);
      if (!userId) return;
      const priceId = sub.items.data[0]?.price?.id;
      const plan = priceId ? planForPriceId(priceId) : null;
      const tier = plan?.tier ?? "pro";
      const status = mapSubscriptionStatus(sub.status);
      const periodEnd = subscriptionPeriodEnd(sub);
      await supabaseAdmin.from("profiles").update({
        subscription_tier: status === "expired" ? "expired" : tier,
        subscription_status: status,
        subscription_end_date: periodEnd,
        stripe_subscription_id: sub.id,
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id
      }).eq("id", userId);
      return;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = sub.metadata?.supabase_user_id ?? await lookupUserByCustomer(typeof sub.customer === "string" ? sub.customer : sub.customer.id);
      if (!userId) return;
      await supabaseAdmin.from("profiles").update({
        subscription_tier: "expired",
        subscription_status: "canceled",
        subscription_end_date: subscriptionPeriodEnd(sub)
      }).eq("id", userId);
      return;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
      if (!customerId) return;
      const userId = await lookupUserByCustomer(customerId);
      if (!userId) return;
      await supabaseAdmin.from("profiles").update({ subscription_status: "past_due" }).eq("id", userId);
      return;
    }
    default:
      return;
  }
}
function mapSubscriptionStatus(status) {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialling";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "expired";
    default:
      return "expired";
  }
}
function subscriptionPeriodEnd(sub) {
  const item = sub.items.data[0];
  const ts = item?.current_period_end ?? sub.current_period_end;
  return ts ? new Date(ts * 1e3).toISOString() : null;
}
async function lookupUserByCustomer(customerId) {
  const { data } = await supabaseAdmin.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
  return data?.id ?? null;
}
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const CATEGORY_LABELS = {
  work: "Work",
  rest: "Rest",
  wellness: "Wellness",
  exercise: "Exercise",
  social: "Social",
  family: "Family",
  personal: "Personal",
  travel: "Travel"
};
const WELLNESS_TIPS = [
  "Aim for 7–9 hours of sleep — Matthew Walker's research shows it's the single best predictor of next-day wellbeing.",
  "Take a 10-minute walk between activities. Movement breaks improve mood and focus.",
  "Stay hydrated through your shift — even mild dehydration affects reaction time.",
  "Connect with one person today, even briefly. Social connection is a top driver of life satisfaction (PERMA).",
  "Try 4-7-8 breathing for one minute before bed: inhale 4s, hold 7s, exhale 8s.",
  "Step outside for 5 minutes of daylight — it helps reset your circadian rhythm.",
  "Pause before your shift to set one small intention. Meaning matters as much as rest."
];
function pickWellnessTip(seed) {
  return WELLNESS_TIPS[seed % WELLNESS_TIPS.length];
}
function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
async function sendResendEmail(args) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY
    },
    body: JSON.stringify({
      from: "Kookaflow <hello@kookaflow.com>",
      to: [args.to],
      subject: args.subject,
      html: args.html
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed [${res.status}]: ${body}`);
  }
  return res.json();
}
function fmtTime$1(iso, tz) {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz
  });
}
function fmtDate(d, tz) {
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: tz
  });
}
function shell$1(title, inner) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F5FB;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1E2A6E;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1E2A6E 0%,#F59E0B 100%);color:#fff;padding:24px;border-radius:16px 16px 0 0;">
      <div style="font-size:14px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Kookaflow</div>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">${title}</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;">
      ${inner}
      <p style="margin:32px 0 0;font-size:12px;color:#8a8fb0;">You're receiving this because email reminders are enabled in Kookaflow. Manage in Settings → Reminders.</p>
    </div>
  </div></body></html>`;
}
function eventRow(e, tz) {
  const label = CATEGORY_LABELS[e.category] ?? e.category;
  const time = e.is_all_day ? "All day" : `${fmtTime$1(e.start_time, tz)} – ${fmtTime$1(e.end_time, tz)}`;
  const loc = e.location ? ` · ${e.location}` : "";
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eef0f8;">
    <div style="font-weight:600;">${escapeHtml$1(e.title)}</div>
    <div style="font-size:13px;color:#5b6088;">${time} · ${label}${escapeHtml$1(loc)}</div>
  </td></tr>`;
}
function escapeHtml$1(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function computeBalance(events) {
  const totals = {};
  let total = 0;
  for (const e of events) {
    const mins = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / 6e4;
    totals[e.category] = (totals[e.category] ?? 0) + mins;
    total += mins;
  }
  const work = totals["work"] ?? 0;
  const rest = (totals["rest"] ?? 0) + (totals["wellness"] ?? 0);
  const life = (totals["social"] ?? 0) + (totals["family"] ?? 0) + (totals["personal"] ?? 0) + (totals["exercise"] ?? 0);
  if (total === 0) return { score: 0, totals };
  const workRatio = work / total;
  const lifeRatio = (rest + life) / total;
  const score = Math.round(Math.min(100, lifeRatio * 80 + (1 - workRatio) * 20));
  return { score, totals };
}
function buildDailyEmail(args) {
  const { date, tz, events, tipSeed, name } = args;
  const dateLabel = fmtDate(date, tz);
  const subject = `Your Kookaflow Day Ahead ☀️ — ${dateLabel}`;
  const greeting = name ? `Good morning, ${escapeHtml$1(name)}!` : "Good morning!";
  const tip = pickWellnessTip(tipSeed);
  const { score } = computeBalance(events);
  const work = events.find((e) => e.category === "work");
  const shiftLine = work ? `<p style="margin:0 0 16px;">Your next shift: <strong>${escapeHtml$1(work.title)}</strong> at ${fmtTime$1(work.start_time, tz)}.</p>` : `<p style="margin:0 0 16px;">No shifts today — enjoy your time off 🌿</p>`;
  const list = events.length ? `<table style="width:100%;border-collapse:collapse;margin:0 0 16px;">${events.map((e) => eventRow(e, tz)).join("")}</table>` : `<p style="color:#5b6088;margin:0 0 16px;">Nothing scheduled. A clear day is a gift — use it well.</p>`;
  const inner = `
    <p style="margin:0 0 8px;font-size:16px;">${greeting}</p>
    <p style="margin:0 0 20px;color:#5b6088;">Here's what's on for ${dateLabel}.</p>
    ${shiftLine}
    ${list}
    <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin:8px 0 16px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;">Life balance score</div>
      <div style="font-size:28px;font-weight:700;color:#F59E0B;">${score}/100</div>
    </div>
    <div style="border-left:4px solid #F59E0B;background:#FFF8EC;padding:12px 16px;border-radius:8px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Wellness tip</div>
      <div style="font-size:14px;">${escapeHtml$1(tip)}</div>
    </div>
  `;
  return { subject, html: shell$1("Your day ahead", inner) };
}
function buildWeeklyEmail(args) {
  const { weekStart, tz, events, tipSeed, name } = args;
  const dateLabel = fmtDate(weekStart, tz);
  const subject = `Your Kookaflow Week Ahead 📅 — Week of ${dateLabel}`;
  const greeting = name ? `Hi ${escapeHtml$1(name)},` : "Hi there,";
  const { score, totals } = computeBalance(events);
  const workMins = totals["work"] ?? 0;
  const workHrs = (workMins / 60).toFixed(1);
  const breakdown = Object.entries(totals).sort((a, b) => b[1] - a[1]).map(
    ([cat, mins]) => `<tr><td style="padding:6px 0;color:#1E2A6E;">${CATEGORY_LABELS[cat] ?? cat}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${(mins / 60).toFixed(1)}h</td></tr>`
  ).join("");
  const tip = pickWellnessTip(tipSeed);
  const nudge = workMins / 60 > 40 ? "You've got a heavy work week ahead. Block at least one full rest window — even 90 minutes of unscheduled time protects recovery." : (totals["exercise"] ?? 0) < 90 ? "Try to add two 30-minute movement blocks this week. Even brisk walking counts." : (totals["social"] ?? 0) < 60 ? "Plan one social moment this week — coffee, a call, a meal. Connection is a top wellbeing predictor." : tip;
  const inner = `
    <p style="margin:0 0 8px;font-size:16px;">${greeting}</p>
    <p style="margin:0 0 20px;color:#5b6088;">Here's your overview for the week of ${dateLabel}.</p>
    <p style="margin:0 0 16px;">You have <strong>${events.filter((e) => e.category === "work").length}</strong> shifts scheduled — about <strong>${workHrs}h</strong> of work.</p>
    <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin:0 0 16px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Hours by category</div>
      <table style="width:100%;border-collapse:collapse;">${breakdown || `<tr><td style="color:#5b6088;">No events scheduled yet.</td></tr>`}</table>
    </div>
    <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin:0 0 16px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;">Life balance score</div>
      <div style="font-size:28px;font-weight:700;color:#F59E0B;">${score}/100</div>
    </div>
    <div style="border-left:4px solid #F59E0B;background:#FFF8EC;padding:12px 16px;border-radius:8px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Wellness nudge</div>
      <div style="font-size:14px;">${escapeHtml$1(nudge)}</div>
    </div>
  `;
  return { subject, html: shell$1("Your week ahead", inner) };
}
function getZonedNow(tz) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  const parts = fmt.formatToParts(/* @__PURE__ */ new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday").toLowerCase().slice(0, 3)
  };
}
function isTimeInWindow(reminderTime, zoned, windowMinutes = 5) {
  const [hh, mm] = reminderTime.split(":").map(Number);
  const reminderMin = hh * 60 + mm;
  const nowMin = zoned.hour * 60 + zoned.minute;
  const diff = nowMin - reminderMin;
  return diff >= 0 && diff < windowMinutes;
}
function dateForTz(zoned) {
  return `${zoned.year}-${String(zoned.month).padStart(2, "0")}-${String(zoned.day).padStart(2, "0")}`;
}
function startOfDayUtc(tz, zoned) {
  const iso = `${zoned.year}-${String(zoned.month).padStart(2, "0")}-${String(zoned.day).padStart(2, "0")}T00:00:00`;
  const local = /* @__PURE__ */ new Date(`${iso}Z`);
  const offsetFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
    hour: "2-digit"
  });
  const parts = offsetFmt.formatToParts(local);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = tzName.match(/GMT([+-]\d+)(?::(\d+))?/);
  const hOff = match ? Number(match[1]) : 0;
  const mOff = match && match[2] ? Number(match[2]) * Math.sign(hOff || 1) : 0;
  const totalMin = hOff * 60 + mOff;
  return new Date(local.getTime() - totalMin * 6e4);
}
const Route$7 = createFileRoute("/api/public/hooks/send-weekly-reminder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabase2 = getAdminClient();
        const { data: prefs, error } = await supabase2.from("user_preferences").select(
          "user_id, email, weekly_reminder_time, weekly_reminder_day, weekly_reminder_channel, weekly_reminder_enabled"
        ).eq("weekly_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }
        const results = [];
        for (const p of prefs ?? []) {
          if (!p.email) {
            results.push({ user_id: p.user_id, status: "no_email" });
            continue;
          }
          if (p.weekly_reminder_channel && p.weekly_reminder_channel !== "email" && p.weekly_reminder_channel !== "both") {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.weekly_reminder_time || !p.weekly_reminder_day) {
            results.push({ user_id: p.user_id, status: "no_schedule" });
            continue;
          }
          const { data: profile } = await supabase2.from("profiles").select("timezone, full_name").eq("id", p.user_id).maybeSingle();
          const tz = profile?.timezone || "UTC";
          const zoned = getZonedNow(tz);
          if (zoned.weekday !== p.weekly_reminder_day) {
            results.push({ user_id: p.user_id, status: "wrong_day" });
            continue;
          }
          if (!isTimeInWindow(p.weekly_reminder_time, zoned, 5)) {
            results.push({ user_id: p.user_id, status: "out_of_window" });
            continue;
          }
          const sentFor = dateForTz(zoned);
          const { error: insErr } = await supabase2.from("reminder_sends").insert({
            user_id: p.user_id,
            kind: "weekly",
            sent_for_date: sentFor
          });
          if (insErr) {
            results.push({ user_id: p.user_id, status: "already_sent" });
            continue;
          }
          const weekStart = startOfDayUtc(tz, zoned);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 6e4);
          const { data: events } = await supabase2.from("events").select(
            "id,title,category,start_time,end_time,is_all_day,shift_type,location"
          ).eq("user_id", p.user_id).gte("start_time", weekStart.toISOString()).lt("start_time", weekEnd.toISOString()).order("start_time", { ascending: true });
          const { subject, html } = buildWeeklyEmail({
            name: profile?.full_name ?? null,
            weekStart,
            tz,
            events: events ?? [],
            tipSeed: zoned.year * 53 + Math.floor(zoned.day / 7) + zoned.month
          });
          try {
            await sendResendEmail({ to: p.email, subject, html });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e) {
            await supabase2.from("reminder_sends").delete().eq("user_id", p.user_id).eq("kind", "weekly").eq("sent_for_date", sentFor);
            results.push({
              user_id: p.user_id,
              status: `error:${e.message}`
            });
          }
        }
        return Response.json({ ok: true, results });
      }
    }
  }
});
const Route$6 = createFileRoute("/api/public/hooks/send-trial-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabase2 = getAdminClient();
        const now = /* @__PURE__ */ new Date();
        const lowerIso = new Date(now.getTime() - 24 * 36e5).toISOString();
        const upperIso = new Date(now.getTime() + 5 * 24 * 36e5).toISOString();
        const { data: profiles, error } = await supabase2.from("profiles").select("id, full_name, trial_ends_at, subscription_tier").eq("subscription_tier", "trial").gte("trial_ends_at", lowerIso).lte("trial_ends_at", upperIso);
        if (error) {
          return new Response(`profiles error: ${error.message}`, { status: 500 });
        }
        const results = [];
        for (const p of profiles ?? []) {
          if (!p.trial_ends_at) continue;
          const trialEnds = new Date(p.trial_ends_at);
          const msLeft = trialEnds.getTime() - now.getTime();
          const daysLeft = Math.ceil(msLeft / 864e5);
          let kind = null;
          if (msLeft <= 0) kind = "trial_expired";
          else if (daysLeft === 1) kind = "trial_1_day";
          else if (daysLeft === 4) kind = "trial_4_days";
          if (!kind) {
            results.push({ user_id: p.id, status: "no_match" });
            continue;
          }
          const { data: userResp } = await supabase2.auth.admin.getUserById(p.id);
          const email = userResp?.user?.email;
          if (!email) {
            results.push({ user_id: p.id, status: "no_email" });
            continue;
          }
          const sentFor = trialEnds.toISOString().slice(0, 10);
          const { error: insErr } = await supabase2.from("reminder_sends").insert({ user_id: p.id, kind, sent_for_date: sentFor });
          if (insErr) {
            results.push({ user_id: p.id, status: "already_sent" });
            continue;
          }
          const { subject, html } = buildTrialEmail({
            name: p.full_name ?? null,
            kind
          });
          try {
            await sendResendEmail({ to: email, subject, html });
            results.push({ user_id: p.id, status: `sent:${kind}` });
          } catch (e) {
            await supabase2.from("reminder_sends").delete().eq("user_id", p.id).eq("kind", kind).eq("sent_for_date", sentFor);
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ user_id: p.id, status: `error:${msg}` });
          }
        }
        return Response.json({ ok: true, results });
      }
    }
  }
});
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function shell(title, inner) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F5FB;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1E2A6E;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1E2A6E 0%,#F59E0B 100%);color:#fff;padding:24px;border-radius:16px 16px 0 0;">
      <div style="font-size:14px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Kookaflow</div>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">${title}</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;">
      ${inner}
      <p style="margin:32px 0 0;font-size:12px;color:#8a8fb0;">You're receiving this because your Kookaflow trial is ending soon.</p>
    </div>
  </div></body></html>`;
}
function ctaButton(label) {
  return `<a href="https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app/pricing"
    style="display:inline-block;background:#F59E0B;color:#1E2A6E;text-decoration:none;font-weight:700;
    padding:12px 20px;border-radius:10px;margin:16px 0 8px;">${label}</a>`;
}
function buildTrialEmail(args) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name)},` : "Hi there,";
  if (args.kind === "trial_4_days") {
    return {
      subject: "4 days left in your Kookaflow trial 🌿",
      html: shell(
        "4 days to go",
        `<p style="margin:0 0 12px;font-size:16px;">${greeting}</p>
         <p style="margin:0 0 12px;">You've got <strong>4 days</strong> left in your free trial of Kookaflow Pro.</p>
         <p style="margin:0 0 12px;">Keep your wellness streak, your life-balance dashboard and Google Calendar sync running — pick a plan whenever you're ready.</p>
         ${ctaButton("Choose your plan")}
         <p style="margin:16px 0 0;color:#5b6088;font-size:13px;">No pressure — your data is safe either way.</p>`
      )
    };
  }
  if (args.kind === "trial_1_day") {
    return {
      subject: "Last day of your Kookaflow trial ⏳",
      html: shell(
        "One day left",
        `<p style="margin:0 0 12px;font-size:16px;">${greeting}</p>
         <p style="margin:0 0 12px;">Tomorrow your free trial ends. After that, Pro features (life-balance dashboard, Google Calendar sync, SMS &amp; push reminders) will be paused.</p>
         <p style="margin:0 0 12px;">Lock in Pro now — Pro Yearly is <strong>$29.99 AUD</strong>, or grab <strong>Lifetime Pro</strong> for a one-time $59.99.</p>
         ${ctaButton("Upgrade now")}`
      )
    };
  }
  return {
    subject: "Your Kookaflow trial has ended",
    html: shell(
      "Trial ended",
      `<p style="margin:0 0 12px;font-size:16px;">${greeting}</p>
       <p style="margin:0 0 12px;">Your 14-day Kookaflow Pro trial has ended. Your calendar and shifts are still here — but Pro features are paused for now.</p>
       <p style="margin:0 0 12px;">Reactivate anytime:</p>
       <ul style="margin:0 0 12px 18px;color:#1E2A6E;">
         <li>Basic — $2.99 / month (core calendar &amp; shifts)</li>
         <li>Pro Monthly — $4.99 / month</li>
         <li>Pro Yearly — $29.99 / year (save 50%)</li>
         <li>Lifetime Pro — $59.99 one-time</li>
       </ul>
       ${ctaButton("Reactivate Kookaflow")}`
    )
  };
}
const ONESIGNAL_API = "https://api.onesignal.com/notifications";
function getOneSignalCreds() {
  const appId = process.env.ONESIGNAL_APP_ID;
  if (!appId) throw new Error("ONESIGNAL_APP_ID is not configured");
  const key = process.env.ONESIGNAL_API_KEY ?? process.env.ONESIGNAL_REST_API_KEY;
  if (!key)
    throw new Error("ONESIGNAL_API_KEY is not configured");
  return { appId, key };
}
async function sendOneSignalPush({
  externalUserIds,
  heading,
  content,
  url
}) {
  const { appId, key } = getOneSignalCreds();
  const res = await fetch(ONESIGNAL_API, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      app_id: appId,
      include_aliases: { external_id: externalUserIds },
      target_channel: "push",
      headings: { en: heading },
      contents: { en: content },
      ...url ? { url } : {}
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `OneSignal API error [${res.status}]: ${JSON.stringify(data)}`
    );
  }
  return data;
}
async function sendPushToUser({
  supabaseAdmin: supabaseAdmin2,
  userId,
  title,
  message,
  url,
  scheduledFor
}) {
  const { data: profile, error } = await supabaseAdmin2.from("profiles").select("onesignal_player_id, push_notifications_enabled").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile?.onesignal_player_id)
    return { skipped: true, reason: "no_player_id" };
  if (!profile.push_notifications_enabled)
    return { skipped: true, reason: "push_disabled" };
  const { appId, key } = getOneSignalCreds();
  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      Authorization: `Basic ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: [profile.onesignal_player_id],
      headings: { en: title },
      contents: { en: message },
      ...url ? { url } : {},
      ...scheduledFor ? { send_after: scheduledFor } : {}
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `OneSignal API error [${res.status}]: ${JSON.stringify(data)}`
    );
  }
  return { skipped: false, data };
}
function appUrl() {
  return process.env.PUBLIC_APP_URL ?? "https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app";
}
function computeBalanceScore(events) {
  if (events.length === 0) return 50;
  let workHours = 0;
  let lifeHours = 0;
  for (const e of events) {
    const hrs = e.is_all_day ? 8 : Math.max(
      0,
      (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / 36e5
    );
    if (e.category === "work") workHours += hrs;
    else lifeHours += hrs;
  }
  const total = workHours + lifeHours;
  if (total === 0) return 50;
  const lifeRatio = lifeHours / total;
  const score = Math.round(100 - Math.abs(lifeRatio - 0.6) * 150);
  return Math.max(0, Math.min(100, score));
}
const Route$5 = createFileRoute(
  "/api/public/hooks/send-push-weekly-reminder"
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabase2 = getAdminClient();
        const { data: prefs, error } = await supabase2.from("user_preferences").select(
          "user_id, weekly_reminder_time, weekly_reminder_day, weekly_reminder_channel, weekly_reminder_enabled"
        ).eq("weekly_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }
        const results = [];
        for (const p of prefs ?? []) {
          const ch = p.weekly_reminder_channel;
          if (!ch || ch !== "push" && ch !== "both") {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.weekly_reminder_time || !p.weekly_reminder_day) {
            results.push({ user_id: p.user_id, status: "no_schedule" });
            continue;
          }
          const { data: profile } = await supabase2.from("profiles").select("timezone, full_name, push_weekly_reminder, push_notifications_enabled").eq("id", p.user_id).maybeSingle();
          if (!profile?.push_notifications_enabled || !profile?.push_weekly_reminder) {
            results.push({ user_id: p.user_id, status: "push_pref_off" });
            continue;
          }
          const tz = profile?.timezone || "UTC";
          const zoned = getZonedNow(tz);
          if (zoned.weekday !== p.weekly_reminder_day) {
            results.push({ user_id: p.user_id, status: "wrong_day" });
            continue;
          }
          if (!isTimeInWindow(p.weekly_reminder_time, zoned, 5)) {
            results.push({ user_id: p.user_id, status: "out_of_window" });
            continue;
          }
          const sentFor = dateForTz(zoned);
          const { error: insErr } = await supabase2.from("reminder_sends").insert({
            user_id: p.user_id,
            kind: "push_weekly",
            sent_for_date: sentFor
          });
          if (insErr) {
            results.push({ user_id: p.user_id, status: "already_sent" });
            continue;
          }
          const weekStart = startOfDayUtc(tz, zoned);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 6e4);
          const { data: events } = await supabase2.from("events").select(
            "id,title,category,start_time,end_time,is_all_day,shift_type,location"
          ).eq("user_id", p.user_id).gte("start_time", weekStart.toISOString()).lt("start_time", weekEnd.toISOString()).order("start_time", { ascending: true });
          const evs = events ?? [];
          const shifts = evs.filter((e) => e.category === "work").length;
          const score = computeBalanceScore(evs);
          const firstName = (profile?.full_name ?? "").trim().split(/\s+/)[0] || "there";
          const content = `📊 This week: ${shifts} shifts scheduled. Balance score: ${score}/100. Have a great week, ${firstName}! 🦅`;
          try {
            await sendOneSignalPush({
              externalUserIds: [p.user_id],
              heading: "Your Kookaflow Week Ahead 🦅",
              content,
              url: `${appUrl()}/dashboard`
            });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e) {
            await supabase2.from("reminder_sends").delete().eq("user_id", p.user_id).eq("kind", "push_weekly").eq("sent_for_date", sentFor);
            results.push({
              user_id: p.user_id,
              status: `error:${e.message}`
            });
          }
        }
        return Response.json({ ok: true, results });
      }
    }
  }
});
const BodySchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  url: z.string().url().optional(),
  scheduledFor: z.string().datetime().optional()
});
const Route$4 = createFileRoute(
  "/api/public/hooks/send-push-notification"
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "validation_failed", details: parsed.error.flatten() },
            { status: 400 }
          );
        }
        const supabase2 = getAdminClient();
        try {
          const result = await sendPushToUser({
            supabaseAdmin: supabase2,
            userId: parsed.data.userId,
            title: parsed.data.title,
            message: parsed.data.message,
            url: parsed.data.url,
            scheduledFor: parsed.data.scheduledFor
          });
          return Response.json({ ok: true, result });
        } catch (e) {
          return Response.json(
            { ok: false, error: e?.message ?? "send_failed" },
            { status: 500 }
          );
        }
      }
    }
  }
});
function fmtTime(iso, tz) {
  try {
    return new Date(iso).toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz
    });
  } catch {
    return new Date(iso).toISOString().slice(11, 16);
  }
}
function shiftLabel(t) {
  switch (t) {
    case "morning":
    case "afternoon":
    case "evening":
    case "night":
      return t;
    case "split":
      return "split";
    case "side_hustle":
      return "side hustle";
    case "oncall":
      return "on-call";
    default:
      return "work";
  }
}
const Route$3 = createFileRoute(
  "/api/public/hooks/send-push-daily-reminder"
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabase2 = getAdminClient();
        const { data: prefs, error } = await supabase2.from("user_preferences").select(
          "user_id, daily_reminder_time, daily_reminder_channel, daily_reminder_enabled"
        ).eq("daily_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }
        const results = [];
        for (const p of prefs ?? []) {
          const ch = p.daily_reminder_channel;
          if (!ch || ch !== "push" && ch !== "both") {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.daily_reminder_time) {
            results.push({ user_id: p.user_id, status: "no_time" });
            continue;
          }
          const { data: profile } = await supabase2.from("profiles").select("timezone, push_daily_reminder, push_notifications_enabled").eq("id", p.user_id).maybeSingle();
          if (!profile?.push_notifications_enabled || !profile?.push_daily_reminder) {
            results.push({ user_id: p.user_id, status: "push_pref_off" });
            continue;
          }
          const tz = profile?.timezone || "UTC";
          const zoned = getZonedNow(tz);
          if (!isTimeInWindow(p.daily_reminder_time, zoned, 5)) {
            results.push({ user_id: p.user_id, status: "out_of_window" });
            continue;
          }
          const sentFor = dateForTz(zoned);
          const { error: insErr } = await supabase2.from("reminder_sends").insert({
            user_id: p.user_id,
            kind: "push_daily",
            sent_for_date: sentFor
          });
          if (insErr) {
            results.push({ user_id: p.user_id, status: "already_sent" });
            continue;
          }
          const dayStart = startOfDayUtc(tz, zoned);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 6e4);
          const { data: events } = await supabase2.from("events").select(
            "id,title,category,start_time,end_time,is_all_day,shift_type,location"
          ).eq("user_id", p.user_id).gte("start_time", dayStart.toISOString()).lt("start_time", dayEnd.toISOString()).order("start_time", { ascending: true });
          const evs = events ?? [];
          const shift = evs.find((e) => e.category === "work");
          const score = computeBalanceScore(evs);
          let content;
          if (shift) {
            const startStr = shift.is_all_day ? "all day" : `at ${fmtTime(shift.start_time, tz)}`;
            content = `📅 Today: ${shiftLabel(shift.shift_type)} ${startStr}. You have ${evs.length} events today. Balance score: ${score}/100 🦅`;
          } else if (evs.length > 0) {
            content = `🌿 No shifts today — enjoy your time off! You have ${evs.length} personal events. Balance score: ${score}/100`;
          } else {
            content = `☀️ A free day! Perfect time for rest, family or something you love.`;
          }
          try {
            await sendOneSignalPush({
              externalUserIds: [p.user_id],
              heading: "Your Kookaflow Day Ahead 🦅",
              content,
              url: `${appUrl()}/calendar`
            });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e) {
            await supabase2.from("reminder_sends").delete().eq("user_id", p.user_id).eq("kind", "push_daily").eq("sent_for_date", sentFor);
            results.push({
              user_id: p.user_id,
              status: `error:${e.message}`
            });
          }
        }
        return Response.json({ ok: true, results });
      }
    }
  }
});
const Route$2 = createFileRoute("/api/public/hooks/send-daily-reminder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabase2 = getAdminClient();
        const { data: prefs, error } = await supabase2.from("user_preferences").select(
          "user_id, email, daily_reminder_time, daily_reminder_channel, daily_reminder_enabled"
        ).eq("daily_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }
        const results = [];
        for (const p of prefs ?? []) {
          if (!p.email) {
            results.push({ user_id: p.user_id, status: "no_email" });
            continue;
          }
          if (p.daily_reminder_channel && p.daily_reminder_channel !== "email" && p.daily_reminder_channel !== "both") {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.daily_reminder_time) {
            results.push({ user_id: p.user_id, status: "no_time" });
            continue;
          }
          const { data: profile } = await supabase2.from("profiles").select("timezone, full_name").eq("id", p.user_id).maybeSingle();
          const tz = profile?.timezone || "UTC";
          const zoned = getZonedNow(tz);
          if (!isTimeInWindow(p.daily_reminder_time, zoned, 5)) {
            results.push({ user_id: p.user_id, status: "out_of_window" });
            continue;
          }
          const sentFor = dateForTz(zoned);
          const { error: insErr } = await supabase2.from("reminder_sends").insert({
            user_id: p.user_id,
            kind: "daily",
            sent_for_date: sentFor
          });
          if (insErr) {
            results.push({ user_id: p.user_id, status: "already_sent" });
            continue;
          }
          const dayStart = startOfDayUtc(tz, zoned);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 6e4);
          const { data: events } = await supabase2.from("events").select(
            "id,title,category,start_time,end_time,is_all_day,shift_type,location"
          ).eq("user_id", p.user_id).gte("start_time", dayStart.toISOString()).lt("start_time", dayEnd.toISOString()).order("start_time", { ascending: true });
          const { subject, html } = buildDailyEmail({
            name: profile?.full_name ?? null,
            date: dayStart,
            tz,
            events: events ?? [],
            tipSeed: zoned.year * 366 + zoned.month * 31 + zoned.day
          });
          try {
            await sendResendEmail({ to: p.email, subject, html });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e) {
            await supabase2.from("reminder_sends").delete().eq("user_id", p.user_id).eq("kind", "daily").eq("sent_for_date", sentFor);
            results.push({
              user_id: p.user_id,
              status: `error:${e.message}`
            });
          }
        }
        return Response.json({ ok: true, results });
      }
    }
  }
});
const Route$1 = createFileRoute(
  "/api/public/hooks/dispatch-shift-alerts"
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const supabase2 = getAdminClient();
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const { data: due, error } = await supabase2.from("scheduled_push_alerts").select("id,user_id,title,message,url,fire_at").is("sent_at", null).lte("fire_at", nowIso).order("fire_at", { ascending: true }).limit(200);
        if (error) {
          return new Response(`query error: ${error.message}`, { status: 500 });
        }
        const results = [];
        for (const row of due ?? []) {
          try {
            const res = await sendPushToUser({
              supabaseAdmin: supabase2,
              userId: row.user_id,
              title: row.title,
              message: row.message,
              url: row.url ?? void 0
            });
            await supabase2.from("scheduled_push_alerts").update({ sent_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", row.id);
            results.push({
              id: row.id,
              status: res.skipped ? `skipped:${res.reason}` : "sent"
            });
          } catch (e) {
            results.push({ id: row.id, status: `error:${e?.message ?? "unknown"}` });
          }
        }
        return Response.json({ ok: true, dispatched: results.length, results });
      }
    }
  }
});
const Route = createFileRoute("/api/public/google/sync-all")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data: conns } = await supabaseAdmin.from("google_calendar_connections").select("user_id");
        const results = [];
        for (const c of conns ?? []) {
          try {
            await syncUserCalendar(c.user_id);
            results.push({ userId: c.user_id, ok: true });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await supabaseAdmin.from("google_calendar_connections").update({ last_sync_error: msg }).eq("user_id", c.user_id);
            results.push({ userId: c.user_id, ok: false, error: msg });
          }
        }
        return Response.json({ ok: true, count: results.length, results });
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger sync" })
    }
  }
});
const TermsRoute = Route$v.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$w
});
const SupportRoute = Route$u.update({
  id: "/support",
  path: "/support",
  getParentRoute: () => Route$w
});
const SignupRoute = Route$t.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$w
});
const ResetPasswordRoute = Route$s.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$w
});
const PrivacyRoute = Route$r.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$w
});
const PricingRoute = Route$q.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => Route$w
});
const McpRoute = Route$p.update({
  id: "/mcp",
  path: "/mcp",
  getParentRoute: () => Route$w
});
const LoginRoute = Route$o.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$w
});
const EulaRoute = Route$n.update({
  id: "/eula",
  path: "/eula",
  getParentRoute: () => Route$w
});
const AuthenticatedRoute = Route$m.update({
  id: "/_authenticated",
  getParentRoute: () => Route$w
});
const IndexRoute = Route$l.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$w
});
const ProSuccessRoute = Route$k.update({
  id: "/pro/success",
  path: "/pro/success",
  getParentRoute: () => Route$w
});
const AuthenticatedShiftsRoute = Route$j.update({
  id: "/shifts",
  path: "/shifts",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedSettingsRoute = Route$i.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedOnboardingRoute = Route$h.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedMoreRoute = Route$g.update({
  id: "/more",
  path: "/more",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDashboardRoute = Route$f.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedCalendarRoute = Route$e.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => AuthenticatedRoute
});
const Char91DotwellKnownChar93OauthProtectedResourceRoute = Route$d.update({
  id: "/.well-known/oauth-protected-resource",
  path: "/.well-known/oauth-protected-resource",
  getParentRoute: () => Route$w
});
const Char91DotmcpChar93ListToolsRoute = Route$c.update({
  id: "/.mcp/list-tools",
  path: "/.mcp/list-tools",
  getParentRoute: () => Route$w
});
const AuthGoogleCallbackRoute = Route$b.update({
  id: "/auth/google/callback",
  path: "/auth/google/callback",
  getParentRoute: () => Route$w
});
const Char91DotmcpChar93InvokeToolToolRoute = Route$a.update({
  id: "/.mcp/invoke-tool/$tool",
  path: "/.mcp/invoke-tool/$tool",
  getParentRoute: () => Route$w
});
const DotlovableOauthConsentRoute = Route$9.update({
  id: "/.lovable/oauth/consent",
  path: "/.lovable/oauth/consent",
  getParentRoute: () => Route$w
});
const ApiPublicStripeWebhookRoute = Route$8.update({
  id: "/api/public/stripe/webhook",
  path: "/api/public/stripe/webhook",
  getParentRoute: () => Route$w
});
const ApiPublicHooksSendWeeklyReminderRoute = Route$7.update({
  id: "/api/public/hooks/send-weekly-reminder",
  path: "/api/public/hooks/send-weekly-reminder",
  getParentRoute: () => Route$w
});
const ApiPublicHooksSendTrialRemindersRoute = Route$6.update({
  id: "/api/public/hooks/send-trial-reminders",
  path: "/api/public/hooks/send-trial-reminders",
  getParentRoute: () => Route$w
});
const ApiPublicHooksSendPushWeeklyReminderRoute = Route$5.update({
  id: "/api/public/hooks/send-push-weekly-reminder",
  path: "/api/public/hooks/send-push-weekly-reminder",
  getParentRoute: () => Route$w
});
const ApiPublicHooksSendPushNotificationRoute = Route$4.update({
  id: "/api/public/hooks/send-push-notification",
  path: "/api/public/hooks/send-push-notification",
  getParentRoute: () => Route$w
});
const ApiPublicHooksSendPushDailyReminderRoute = Route$3.update({
  id: "/api/public/hooks/send-push-daily-reminder",
  path: "/api/public/hooks/send-push-daily-reminder",
  getParentRoute: () => Route$w
});
const ApiPublicHooksSendDailyReminderRoute = Route$2.update({
  id: "/api/public/hooks/send-daily-reminder",
  path: "/api/public/hooks/send-daily-reminder",
  getParentRoute: () => Route$w
});
const ApiPublicHooksDispatchShiftAlertsRoute = Route$1.update({
  id: "/api/public/hooks/dispatch-shift-alerts",
  path: "/api/public/hooks/dispatch-shift-alerts",
  getParentRoute: () => Route$w
});
const ApiPublicGoogleSyncAllRoute = Route.update({
  id: "/api/public/google/sync-all",
  path: "/api/public/google/sync-all",
  getParentRoute: () => Route$w
});
const AuthenticatedRouteChildren = {
  AuthenticatedCalendarRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedMoreRoute,
  AuthenticatedOnboardingRoute,
  AuthenticatedSettingsRoute,
  AuthenticatedShiftsRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  EulaRoute,
  LoginRoute,
  McpRoute,
  PricingRoute,
  PrivacyRoute,
  ResetPasswordRoute,
  SignupRoute,
  SupportRoute,
  TermsRoute,
  Char91DotmcpChar93ListToolsRoute,
  Char91DotwellKnownChar93OauthProtectedResourceRoute,
  ProSuccessRoute,
  DotlovableOauthConsentRoute,
  Char91DotmcpChar93InvokeToolToolRoute,
  AuthGoogleCallbackRoute,
  ApiPublicGoogleSyncAllRoute,
  ApiPublicHooksDispatchShiftAlertsRoute,
  ApiPublicHooksSendDailyReminderRoute,
  ApiPublicHooksSendPushDailyReminderRoute,
  ApiPublicHooksSendPushNotificationRoute,
  ApiPublicHooksSendPushWeeklyReminderRoute,
  ApiPublicHooksSendTrialRemindersRoute,
  ApiPublicHooksSendWeeklyReminderRoute,
  ApiPublicStripeWebhookRoute
};
const routeTree = Route$w._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Button as B,
  Route$t as R,
  THEMES as T,
  Route$o as a,
  createSsrRpc as b,
  cn as c,
  usePreferences as d,
  Route$9 as e,
  updatePushPrefs as f,
  getPushStatus as g,
  buttonVariants as h,
  logo as l,
  oauthClient as o,
  router as r,
  useServerFn as u
};
