import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useSyncExternalStore, useState, useEffect, useMemo } from "react";
import { setMinutes, setHours, startOfDay, addDays, endOfWeek, startOfWeek, endOfMonth, startOfMonth, format, isSameDay, endOfDay, differenceInDays } from "date-fns";
import { C as CATEGORY_LIST, b as getCategoryConfig } from "./shiftConfig-DpUyvYTp.js";
import { c as cn, B as Button } from "./router-CfW6Ca5m.js";
import { Lightbulb, ArrowUpRight, ArrowDownRight, Minus, Lock, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { P as PageHeader } from "./PageHeader-6NzEF-tS.js";
import { T as ThemeToggle } from "./ThemeToggle-DkD6ct3r.js";
import { E as EmptyState, a as BalanceScale } from "./empty-illustrations-BvS5Lh-X.js";
import { useNavigate } from "@tanstack/react-router";
import { u as useSubscription } from "./useSubscription-BCGIZOhs.js";
import { P as PaywallModal } from "./PaywallModal-BnPjLyWI.js";
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
import "./dialog-DkTnvVPY.js";
import "@radix-ui/react-dialog";
import "./stripe.functions-HdK7T6FJ.js";
function at(base, h, m = 0) {
  return setMinutes(setHours(startOfDay(base), h), m);
}
function buildMockEvents(today) {
  const d = (offset) => addDays(today, offset);
  return [
    {
      id: "e1",
      title: "Morning shift — Ward 4B",
      category: "work",
      start: at(today, 7),
      end: at(today, 15),
      shiftType: "morning",
      location: "Ward 4B"
    },
    {
      id: "e2",
      title: "Yoga flow",
      category: "exercise",
      start: at(today, 16, 30),
      end: at(today, 17, 30)
    },
    {
      id: "e3",
      title: "Dinner with Mia",
      category: "social",
      start: at(today, 19),
      end: at(today, 21)
    },
    {
      id: "e4",
      title: "Sleep",
      category: "rest",
      start: at(today, 22, 30),
      end: at(d(1), 6, 30)
    },
    {
      id: "e5",
      title: "Meditation",
      category: "wellness",
      start: at(today, 6, 30),
      end: at(today, 7)
    },
    {
      id: "e6",
      title: "Night shift — ER",
      category: "work",
      start: at(d(1), 22),
      end: at(d(2), 6),
      shiftType: "night",
      location: "ER"
    },
    {
      id: "e7",
      title: "Call mom",
      category: "family",
      start: at(d(2), 18),
      end: at(d(2), 18, 30)
    },
    {
      id: "e8",
      title: "Afternoon shift",
      category: "work",
      start: at(d(3), 14),
      end: at(d(3), 22),
      shiftType: "afternoon",
      location: "Triage"
    },
    {
      id: "e9",
      title: "Run in the park",
      category: "exercise",
      start: at(d(4), 8),
      end: at(d(4), 9)
    },
    {
      id: "e10",
      title: "Read a book",
      category: "personal",
      start: at(d(-1), 20),
      end: at(d(-1), 21, 30)
    },
    {
      id: "e11",
      title: "Morning shift",
      category: "work",
      start: at(d(-2), 7),
      end: at(d(-2), 15),
      shiftType: "morning",
      location: "Ward 2A"
    },
    {
      id: "e12",
      title: "Family brunch",
      category: "family",
      start: at(d(5), 11),
      end: at(d(5), 13)
    },
    {
      id: "e13",
      title: "Therapy session",
      category: "wellness",
      start: at(d(6), 10),
      end: at(d(6), 11)
    },
    {
      id: "e14",
      title: "Afternoon shift",
      category: "work",
      start: at(d(7), 14),
      end: at(d(7), 22),
      shiftType: "afternoon"
    }
  ];
}
let events = buildMockEvents(/* @__PURE__ */ new Date());
const listeners = /* @__PURE__ */ new Set();
function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function useEventsStore() {
  return useSyncExternalStore(
    subscribe,
    () => events,
    () => events
  );
}
function currentWeekRange(now = /* @__PURE__ */ new Date()) {
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 })
  };
}
function previousWeekRange(now = /* @__PURE__ */ new Date()) {
  const prev = addDays(now, -7);
  return currentWeekRange(prev);
}
function currentMonthRange(now = /* @__PURE__ */ new Date()) {
  return { start: startOfMonth(now), end: endOfMonth(now) };
}
function eventHoursInRange(e, start, end) {
  const s = e.start > start ? e.start : start;
  const en = e.end < end ? e.end : end;
  const mins = (+en - +s) / 6e4;
  return mins > 0 ? mins / 60 : 0;
}
function splitEventByDay(e, start, end) {
  const out = [];
  const s = e.start > start ? e.start : start;
  const en = e.end < end ? e.end : end;
  if (en <= s) return out;
  let cursor = startOfDay(s);
  while (cursor <= en) {
    const dayStart = cursor < s ? s : cursor;
    const dayEnd = endOfDay(cursor);
    const sliceEnd = dayEnd < en ? dayEnd : en;
    const hours = Math.max(0, (+sliceEnd - +dayStart) / 36e5);
    if (hours > 0) out.push({ day: startOfDay(cursor), hours, category: e.category });
    cursor = addDays(cursor, 1);
    if (differenceInDays(cursor, startOfDay(start)) > 60) break;
  }
  return out;
}
function emptyTotals() {
  return {
    work: 0,
    business: 0,
    rest: 0,
    wellness: 0,
    exercise: 0,
    social: 0,
    family: 0,
    personal: 0,
    travel: 0
  };
}
function weeklyByDay(events2, range) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(range.start, i);
    days.push({ day: format(d, "EEE"), date: d, total: 0, ...emptyTotals() });
  }
  for (const e of events2) {
    for (const s of splitEventByDay(e, range.start, range.end)) {
      const idx = days.findIndex((b) => isSameDay(b.date, s.day));
      if (idx === -1) continue;
      days[idx][s.category] += s.hours;
      days[idx].total += s.hours;
    }
  }
  return days;
}
function monthlyTotals(events2, range) {
  const t = emptyTotals();
  for (const e of events2) t[e.category] += eventHoursInRange(e, range.start, range.end);
  const totalHours = Object.values(t).reduce((a, b) => a + b, 0);
  const totals = CATEGORY_LIST.map((c) => ({
    category: c.id,
    label: c.label,
    color: c.colour,
    hours: +t[c.id].toFixed(1),
    pct: totalHours > 0 ? t[c.id] / totalHours * 100 : 0
  }));
  return { totals, totalHours };
}
function wakingHoursPerWeek(events2, thisWeek) {
  let restHours = 0;
  for (const e of events2) if (e.category === "rest") restHours += eventHoursInRange(e, thisWeek.start, thisWeek.end);
  if (restHours <= 0) return 7 * 16;
  const avg = Math.min(10, Math.max(6, restHours / 7));
  return 7 * (24 - avg);
}
function hoursInRangeForCategory(events2, cat, range) {
  let sum = 0;
  for (const e of events2) if (e.category === cat) sum += eventHoursInRange(e, range.start, range.end);
  return sum;
}
function categoryCard(cat, events2, thisWeek, lastWeek, waking) {
  const hours = hoursInRangeForCategory(events2, cat, thisWeek);
  const prevHours = hoursInRangeForCategory(events2, cat, lastWeek);
  const denom = Math.max(prevHours, 1);
  const deltaPct = (hours - prevHours) / denom * 100;
  const trend = Math.abs(deltaPct) < 5 ? "flat" : deltaPct > 0 ? "up" : "down";
  const buckets = weeklyByDay(events2, thisWeek);
  const sparkline = buckets.map((b) => +b[cat].toFixed(2));
  return {
    category: cat,
    hours: +hours.toFixed(1),
    pctOfWaking: waking > 0 ? Math.min(100, hours / waking * 100) : 0,
    prevHours: +prevHours.toFixed(1),
    deltaPct: Math.round(deltaPct),
    trend,
    sparkline
  };
}
const DASHBOARD_CARD_CATEGORIES = [
  "work",
  "rest",
  "wellness",
  "exercise",
  "social",
  "family",
  "travel"
];
const ESSENTIALS = ["exercise", "social", "family", "wellness"];
function balanceScore(events2, range) {
  const totals = {};
  let sum = 0;
  for (const c of CATEGORY_LIST) {
    if (c.id === "rest") continue;
    const h = hoursInRangeForCategory(events2, c.id, range);
    if (h > 0) {
      totals[c.id] = h;
      sum += h;
    }
  }
  if (sum < 5) {
    return { score: null, band: "Insufficient", copy: "Not enough data yet. Add a few more events to see your balance." };
  }
  const keys = Object.keys(totals);
  let H = 0;
  for (const k of keys) {
    const p = totals[k] / sum;
    H -= p * Math.log(p);
  }
  const Hmax = Math.log(Math.max(keys.length, 2));
  let score = Math.round(H / Hmax * 100);
  let bonus = 0;
  for (const e of ESSENTIALS) if ((totals[e] ?? 0) > 0) bonus += 1.25;
  score = Math.min(100, Math.max(0, Math.round(score + bonus)));
  let band;
  let copy;
  if (score < 40) {
    band = "Skewed";
    copy = "Your week is tilted toward one area. Try adding a Rest or Social block.";
  } else if (score < 70) {
    band = "Tilting";
    copy = "You're getting some variety, but a couple of categories are doing most of the work.";
  } else if (score < 90) {
    band = "Balanced";
    copy = "Nicely spread across life areas. Keep protecting the smaller ones.";
  } else {
    band = "In flow";
    copy = "Beautifully balanced week. This is the sweet spot.";
  }
  return { score, band, copy };
}
function encouragement(score) {
  if (score === null) return "Add a few more events to see your balance.";
  if (score >= 80) return "You're thriving 🌟";
  if (score >= 60) return "Good balance, keep it up 💪";
  if (score >= 40) return "Some areas need attention 🌱";
  return "Time to rebalance ❤️";
}
function BalanceScoreCard({ data }) {
  const score = data.score ?? 0;
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const offset = circ - score / 100 * circ;
  const ringColor = data.score === null ? "var(--muted-foreground)" : score < 40 ? "#EF4444" : score < 70 ? "#F59E0B" : score < 90 ? "#10B981" : "#3B82F6";
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Your Life Balance Score" }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            data.band === "In flow" && "bg-primary/15 text-primary",
            data.band === "Balanced" && "bg-emerald-500/15 text-emerald-500",
            data.band === "Tilting" && "bg-amber-500/15 text-amber-500",
            data.band === "Skewed" && "bg-destructive/15 text-destructive",
            data.band === "Insufficient" && "bg-muted text-muted-foreground"
          ),
          children: data.band
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative size-32 shrink-0", children: [
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 140 140", className: "-rotate-90", children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "70",
              cy: "70",
              r: radius,
              stroke: "var(--border)",
              strokeWidth: "10",
              fill: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "70",
              cy: "70",
              r: radius,
              stroke: ringColor,
              strokeWidth: "10",
              fill: "none",
              strokeLinecap: "round",
              strokeDasharray: circ,
              strokeDashoffset: offset,
              style: { transition: "stroke-dashoffset 600ms ease, stroke 400ms ease" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold tabular-nums", children: data.score === null ? "—" : data.score }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "/100" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-foreground", children: encouragement(data.score) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: data.copy })
      ] })
    ] })
  ] });
}
const TIPS = [
  {
    message: "Aim for 7–9 hours of sleep. Each hour of lost sleep measurably impairs memory consolidation, mood, and immune response the next day.",
    source: "Matthew Walker, Why We Sleep"
  },
  {
    message: "After a run of night shifts, give yourself a 24-hour recovery window before stacking more. Circadian resets take time, not willpower.",
    source: "Walker, sleep & shift-work research"
  },
  {
    message: "Get morning light within 30 minutes of waking — even on cloudy days. Bright light is the single strongest cue to anchor your circadian rhythm.",
    source: "Matthew Walker, Why We Sleep"
  },
  {
    message: "Target at least 150 minutes of moderate physical activity per week, plus two muscle-strengthening sessions. Movement protects heart, mood, and sleep.",
    source: "WHO Physical Activity Guidelines"
  },
  {
    message: "Even short walking breaks count. Replacing sitting time with light activity is associated with lower all-cause mortality.",
    source: "WHO Physical Activity Guidelines"
  },
  {
    message: "Strong social connection is associated with a 50% increase in longevity — comparable in impact to quitting smoking.",
    source: "Holt-Lunstad et al., meta-analysis on social relationships"
  },
  {
    message: "Loneliness carries a health risk on par with smoking 15 cigarettes a day. A 10-minute call to someone you love is not a luxury — it's medicine.",
    source: "Holt-Lunstad, social connection research"
  },
  {
    message: "A short daily mindfulness practice changes brain regions tied to attention and emotion regulation in as little as eight weeks.",
    source: "Harvard / Sara Lazar, MBSR neuroimaging studies"
  },
  {
    message: "Protected, distraction-free time with family or close friends is one of the strongest predictors of life satisfaction across cultures.",
    source: "Seligman, PERMA model of positive psychology"
  },
  {
    message: "Savor one small good moment from your day before bed. People who regularly notice positive events report higher wellbeing within two weeks.",
    source: "Seligman, positive psychology interventions"
  }
];
function WellnessNudgePanel(_props = {}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TIPS.length);
        setVisible(true);
      }, 400);
    }, 8e3);
    return () => clearInterval(interval);
  }, [paused]);
  const tip = TIPS[idx];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      className: "relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/40 p-5",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Lightbulb, { className: "size-4 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Kookaflow Tip" })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "flex flex-1 flex-col gap-2 transition-opacity duration-400 ease-in-out",
              visible ? "opacity-100" : "opacity-0"
            ),
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-foreground", children: tip.message }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] italic text-muted-foreground", children: [
                "— ",
                tip.source
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1.5", children: TIPS.map((_, i) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setVisible(false);
              setTimeout(() => {
                setIdx(i);
                setVisible(true);
              }, 200);
            },
            "aria-label": `Show tip ${i + 1}`,
            className: cn(
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted"
            )
          },
          i
        )) })
      ]
    }
  );
}
function WeeklyStackedBarChart({ data }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Hours this week" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Stacked by life category" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-64 flex-1", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data, margin: { top: 8, right: 8, bottom: 0, left: -16 }, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { stroke: "var(--border)", strokeDasharray: "3 3", vertical: false }),
      /* @__PURE__ */ jsx(
        XAxis,
        {
          dataKey: "day",
          tick: { fill: "var(--muted-foreground)", fontSize: 11 },
          axisLine: false,
          tickLine: false
        }
      ),
      /* @__PURE__ */ jsx(
        YAxis,
        {
          tick: { fill: "var(--muted-foreground)", fontSize: 11 },
          axisLine: false,
          tickLine: false,
          width: 36
        }
      ),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          cursor: { fill: "var(--accent)", opacity: 0.3 },
          contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12
          },
          formatter: (v, name) => [`${v.toFixed(1)}h`, name]
        }
      ),
      CATEGORY_LIST.map((c, i) => /* @__PURE__ */ jsx(
        Bar,
        {
          dataKey: c.id,
          name: c.label,
          stackId: "a",
          fill: c.colour,
          radius: i === CATEGORY_LIST.length - 1 ? [6, 6, 0, 0] : 0
        },
        c.id
      ))
    ] }) }) }),
    /* @__PURE__ */ jsx("ul", { className: "flex flex-wrap gap-x-3 gap-y-1 text-[11px]", children: CATEGORY_LIST.map((c) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full", style: { backgroundColor: c.colour } }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: c.label })
    ] }, c.id)) })
  ] });
}
function MonthlyDonutChart({ totals, totalHours }) {
  const visible = totals.filter((t) => t.hours > 0);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "This month" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "By category" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative h-56 flex-1", children: [
      visible.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
        /* @__PURE__ */ jsx(
          Pie,
          {
            data: visible,
            dataKey: "hours",
            nameKey: "label",
            cx: "50%",
            cy: "50%",
            innerRadius: 56,
            outerRadius: 88,
            paddingAngle: 2,
            stroke: "none",
            isAnimationActive: true,
            animationBegin: 0,
            animationDuration: 900,
            animationEasing: "ease-out",
            children: visible.map((d) => /* @__PURE__ */ jsx(Cell, { fill: d.color }, d.category))
          }
        ),
        /* @__PURE__ */ jsx(
          Tooltip,
          {
            contentStyle: {
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 12
            },
            formatter: (v) => [`${v.toFixed(1)}h`, ""]
          }
        )
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "No events this month yet." }),
      visible.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold tabular-nums", children: [
          totalHours.toFixed(0),
          "h"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "total" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]", children: totals.map((t) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full", style: { backgroundColor: t.color } }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.label }),
      /* @__PURE__ */ jsxs("span", { className: "ml-auto font-medium tabular-nums", children: [
        t.hours,
        "h"
      ] })
    ] }, t.category)) })
  ] });
}
function CategoryCard({ data }) {
  const def = getCategoryConfig(data.category);
  const Icon = def.Icon;
  const TrendIcon = data.trend === "up" ? ArrowUpRight : data.trend === "down" ? ArrowDownRight : Minus;
  const max = Math.max(0.5, ...data.sparkline);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 pl-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
      style: { borderLeft: `4px solid ${def.colour}` },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "flex size-9 items-center justify-center rounded-lg text-white",
                style: { backgroundColor: def.colour },
                children: /* @__PURE__ */ jsx(Icon, { className: "size-5" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: def.label })
          ] }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: cn(
                "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                data.trend === "up" && "bg-emerald-500/15 text-emerald-500",
                data.trend === "down" && "bg-destructive/15 text-destructive",
                data.trend === "flat" && "bg-muted text-muted-foreground"
              ),
              children: [
                /* @__PURE__ */ jsx(TrendIcon, { className: "size-3" }),
                data.trend === "flat" ? "0%" : `${Math.abs(data.deltaPct)}%`
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold tabular-nums", children: data.hours }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "h this week" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          data.pctOfWaking.toFixed(0),
          "% of waking hours"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex h-8 items-end gap-1", children: data.sparkline.map((v, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex-1 rounded-sm transition-all",
            style: {
              height: `${Math.max(4, v / max * 100)}%`,
              backgroundColor: def.colour,
              opacity: v > 0 ? 0.85 : 0.2
            },
            title: `${v.toFixed(1)}h`
          },
          i
        )) })
      ]
    }
  );
}
function FeatureLock({ feature, description, requires = "pro", preview, children }) {
  const sub = useSubscription();
  const [open, setOpen] = useState(false);
  if (sub.loading || !sub.signedIn) return /* @__PURE__ */ jsx(Fragment, { children });
  const allowed = requires === "pro" ? sub.hasProAccess : sub.hasFullAccess;
  if (allowed) return /* @__PURE__ */ jsx(Fragment, { children });
  const expired = sub.tier === "expired" || !sub.isTrialing && sub.tier === "trial";
  const reason = expired ? "trial-expired" : "basic-locked";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative isolate overflow-hidden rounded-2xl border border-border bg-card", children: [
      preview ? /* @__PURE__ */ jsx("div", { className: "pointer-events-none select-none opacity-40 blur-[2px]", "aria-hidden": true, children: preview }) : null,
      /* @__PURE__ */ jsxs("div", { className: `${preview ? "absolute inset-0" : ""} flex flex-col items-center justify-center gap-3 bg-background/70 p-8 text-center backdrop-blur-sm`, children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(Lock, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-foreground", children: [
            feature,
            " is a Pro feature"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: description ?? (expired ? "Your free trial has ended. Upgrade to Pro to unlock this and more." : "Upgrade to Pro to unlock the full Kookaflow experience.") })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setOpen(true), className: "mt-1", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
          " Upgrade to Pro"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PaywallModal, { open, onOpenChange: setOpen, feature, reason })
  ] });
}
function DashboardPage() {
  const events2 = useEventsStore();
  const navigate = useNavigate();
  const sub = useSubscription();
  const now = /* @__PURE__ */ new Date();
  const week = useMemo(() => currentWeekRange(now), [events2]);
  const lastWeek = useMemo(() => previousWeekRange(now), [events2]);
  const month = useMemo(() => currentMonthRange(now), [events2]);
  const weekly = useMemo(() => weeklyByDay(events2, week), [events2, week]);
  const monthly = useMemo(() => monthlyTotals(events2, month), [events2, month]);
  const waking = useMemo(() => wakingHoursPerWeek(events2, week), [events2, week]);
  const cards = useMemo(() => DASHBOARD_CARD_CATEGORIES.map((c) => categoryCard(c, events2, week, lastWeek, waking)), [events2, week, lastWeek, waking]);
  const score = useMemo(() => balanceScore(events2, week), [events2, week]);
  const hour = now.getHours();
  const tod = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const greeting = `Good ${tod}`;
  if (!sub.loading && sub.signedIn && !sub.hasProAccess) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Dashboard", subtitle: "Life-balance insights", right: /* @__PURE__ */ jsx(ThemeToggle, {}) }),
      /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-3xl p-4 sm:p-6", children: /* @__PURE__ */ jsx(FeatureLock, { feature: "Life-balance dashboard", description: "Get weekly hour breakdowns, balance scores, and wellness nudges. Available on Pro and during your 14-day trial.", children: /* @__PURE__ */ jsx("div", {}) }) })
    ] });
  }
  if (events2.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
      /* @__PURE__ */ jsx(PageHeader, { title: greeting, subtitle: format(now, "EEEE, MMMM d"), right: /* @__PURE__ */ jsx(ThemeToggle, {}) }),
      /* @__PURE__ */ jsx("main", { className: "mx-auto flex max-w-7xl items-center justify-center p-4 sm:p-6 min-h-[60vh]", children: /* @__PURE__ */ jsx(EmptyState, { illustration: /* @__PURE__ */ jsx(BalanceScale, { className: "w-full h-auto" }), title: "No data yet", subtitle: "Add some events to see your life balance score", actionLabel: "Go to Calendar", onAction: () => navigate({
        to: "/calendar"
      }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: greeting, subtitle: format(now, "EEEE, MMMM d"), right: /* @__PURE__ */ jsx(ThemeToggle, {}) }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsx(BalanceScoreCard, { data: score }) }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(WellnessNudgePanel, {}) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(WeeklyStackedBarChart, { data: weekly }) }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsx(MonthlyDonutChart, { totals: monthly.totals, totalHours: monthly.totalHours }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-3", children: cards.map((c) => /* @__PURE__ */ jsx(CategoryCard, { data: c }, c.category)) })
    ] })
  ] });
}
export {
  DashboardPage as component
};
