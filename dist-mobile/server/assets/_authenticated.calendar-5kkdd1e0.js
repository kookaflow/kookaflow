import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect, useMemo, useState, useCallback, createContext, useContext } from "react";
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval, format, addDays, isSameMonth, isSameDay, isToday, startOfDay, differenceInMinutes, endOfDay, subDays, isWithinInterval, addMonths } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, Sparkles, Lightbulb, Sun, Sunset, Moon, Radio, GitBranch, Zap, Thermometer, Umbrella, MoreHorizontal, Trash2, TrendingUp, Plus, X, Settings2, PenLine, ChevronLeft, ChevronRight, CalendarIcon, CalendarDays } from "lucide-react";
import { c as cn, h as buttonVariants, B as Button, u as useServerFn, l as logo } from "./router-CfW6Ca5m.js";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { c as getShiftConfig, d as ICON_MAP, b as getCategoryConfig, e as ensureReadableBadgeColour, C as CATEGORY_LIST, S as SHIFT_CONFIG, a as getIcon, I as IconPicker } from "./shiftConfig-DpUyvYTp.js";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-DkTnvVPY.js";
import { I as Input } from "./input-BilhWrar.js";
import { L as Label } from "./label-BX49QBTb.js";
import { S as Switch, l as listGoogleEvents, g as getGoogleConnectionStatus, t as triggerGoogleSync } from "./google-calendar.functions-BISB_u9i.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BeYbcYrv.js";
import { u as useShiftTemplates } from "./ShiftTemplatesProvider-CDIagGig.js";
import { u as useEvents } from "./EventsProvider-CUezkWPz.js";
import { useQuery } from "@tanstack/react-query";
import { P as PageHeader } from "./PageHeader-6NzEF-tS.js";
import { T as ThemeToggle } from "./ThemeToggle-DkD6ct3r.js";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { S as SHIFT_STAMPS, L as LEAVE_STAMPS, I as ICON_STAMPS } from "./stamps-D29-jKGW.js";
import { E as EmptyState, K as KookaburraOnCalendar } from "./empty-illustrations-BvS5Lh-X.js";
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
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
import "@radix-ui/react-dialog";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-select";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx(ChevronRightIcon, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsx(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx("td", { ...props2, children: /* @__PURE__ */ jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
function MonthView({
  cursor,
  selected,
  events,
  onSelect,
  onCreate,
  onEventClick
}) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const headers = Array.from(
    { length: 7 },
    (_, i) => format(addDays(start, i), "EEE")
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-0 flex-col gap-1 overflow-hidden p-1 sm:p-2 animate-in fade-in duration-200", children: [
    /* @__PURE__ */ jsx("div", { className: "grid shrink-0 grid-cols-7 gap-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", style: { height: 24 }, children: headers.map((d) => /* @__PURE__ */ jsx("div", { className: "px-1 py-0.5", children: d }, d)) }),
    /* @__PURE__ */ jsx("div", { className: "grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-0.5 overflow-hidden", children: days.map((day) => {
      const inMonth = isSameMonth(day, cursor);
      const dayEvents = events.filter((e) => isSameDay(e.start, day));
      const shifts = dayEvents.filter(
        (e) => e.shiftType || e.category === "work" && !!e.iconColor && e.source !== "google"
      );
      const shiftIds = new Set(shifts.map((s) => s.id));
      const isSel = isSameDay(day, selected);
      const today = isToday(day);
      const googleEvents = dayEvents.filter((e) => e.source === "google");
      const otherEvents = dayEvents.filter(
        (e) => e.source !== "google" && !shiftIds.has(e.id)
      );
      const MAX_SHIFTS = 2;
      const shiftsToShow = shifts.slice(0, MAX_SHIFTS);
      const extraShifts = shifts.length - shiftsToShow.length;
      const MAX_OTHERS = 2;
      const othersToShow = otherEvents.slice(0, MAX_OTHERS);
      const extraOthers = otherEvents.length - othersToShow.length;
      return /* @__PURE__ */ jsxs(
        DayCell,
        {
          day,
          inMonth,
          isSel,
          onSelect,
          onCreate,
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-start justify-between gap-1", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                  today ? "bg-[#F59E0B] text-white" : "text-foreground"
                ),
                children: format(day, "d")
              }
            ) }),
            shiftsToShow.map((shift) => {
              const shiftStyle = shift.shiftType ? getShiftConfig(shift.shiftType) : null;
              const CustomIcon = !shiftStyle && shift.iconName ? ICON_MAP[shift.iconName] : null;
              const label = shiftStyle ? shiftStyle.label : shift.title;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: (ev) => {
                    ev.stopPropagation();
                    onEventClick?.(shift);
                  },
                  "aria-label": `Edit ${shift.title}`,
                  className: "flex w-full shrink-0 items-center justify-center gap-0.5 truncate rounded-sm px-1 py-0.5 text-[10px] sm:text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm min-h-[16px]",
                  style: { backgroundColor: shiftStyle?.colour ?? shift.iconColor },
                  title: `${label}${shiftStyle ? " shift" : ""}`,
                  children: [
                    shiftStyle ? /* @__PURE__ */ jsx(shiftStyle.Icon, { className: "size-3 sm:size-2.5" }) : CustomIcon ? /* @__PURE__ */ jsx(CustomIcon, { className: "size-3 sm:size-2.5" }) : null,
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: label.slice(0, 10) })
                  ]
                },
                shift.id
              );
            }),
            extraShifts > 0 && /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-[9px] font-medium text-muted-foreground", children: [
              "+",
              extraShifts,
              " more"
            ] }),
            othersToShow.map((e) => {
              const cat = getCategoryConfig(e.category);
              const CustomIcon = e.iconName ? ICON_MAP[e.iconName] : null;
              const Icon = CustomIcon ?? cat.Icon;
              const bg = ensureReadableBadgeColour(e.iconColor, cat.colour);
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: (ev) => {
                    ev.stopPropagation();
                    onEventClick?.(e);
                  },
                  "aria-label": `Edit ${e.title}`,
                  className: "flex w-full shrink-0 items-center gap-0.5 truncate rounded-sm px-1 py-0.5 text-[10px] sm:text-[9px] font-medium text-white shadow-sm min-h-[16px]",
                  style: { backgroundColor: bg },
                  title: e.title,
                  children: [
                    Icon && /* @__PURE__ */ jsx(Icon, { className: "size-3 sm:size-2.5 shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: e.title })
                  ]
                },
                e.id
              );
            }),
            extraOthers > 0 && /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-[9px] font-medium text-muted-foreground", children: [
              "+",
              extraOthers,
              " more"
            ] }),
            googleEvents.slice(0, 1).map((e) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: (ev) => {
                  ev.stopPropagation();
                  onEventClick?.(e);
                },
                className: "flex w-full shrink-0 items-center gap-1 truncate rounded-sm px-1 py-px text-[9px] font-medium text-white hover:brightness-110",
                style: { backgroundColor: "#94A3B8" },
                title: `${e.title} (Google Calendar)`,
                children: [
                  /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 shrink-0", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V8h14v13z" }) }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: e.title })
                ]
              },
              e.id
            )),
            googleEvents.length > 1 && /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-[9px] text-muted-foreground/70", children: [
              "+",
              googleEvents.length - 1,
              " Google"
            ] })
          ]
        },
        day.toISOString()
      );
    }) })
  ] });
}
function DayCell({
  day,
  inMonth,
  isSel,
  onSelect,
  onCreate,
  children
}) {
  const timerRef = useRef(null);
  const heldRef = useRef(false);
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onPointerDown: () => {
        heldRef.current = false;
        clearTimer();
        timerRef.current = setTimeout(() => {
          heldRef.current = true;
          onCreate?.(day);
        }, 500);
      },
      onPointerUp: clearTimer,
      onPointerLeave: clearTimer,
      onPointerCancel: clearTimer,
      onClick: () => {
        if (heldRef.current) {
          heldRef.current = false;
          return;
        }
        onSelect(day);
      },
      onDoubleClick: () => onCreate?.(day),
      className: cn(
        "group relative flex min-h-0 flex-col gap-0.5 overflow-hidden rounded-md border border-border/60 bg-card/40 p-0.5 text-left transition-all duration-200",
        "hover:border-primary/60 hover:bg-card/80 hover:shadow-sm",
        !inMonth && "opacity-40",
        isSel && "border-primary ring-2 ring-primary/30 bg-card"
      ),
      children
    }
  );
}
const HOUR_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
function TimeGrid({
  days,
  events,
  onEventClick,
  selected,
  onSelectDay,
  onCreate
}) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 6 * HOUR_HEIGHT;
    }
  }, []);
  const now = /* @__PURE__ */ new Date();
  const nowOffset = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col animate-in fade-in duration-200", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "grid border-b border-border bg-background/80 backdrop-blur",
        style: { gridTemplateColumns: `56px repeat(${days.length}, 1fr)` },
        children: [
          /* @__PURE__ */ jsx("div", {}),
          days.map((d) => {
            const today = isToday(d);
            const sel = isSameDay(d, selected);
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => onSelectDay?.(d),
                className: cn(
                  "flex flex-col items-center gap-0.5 border-l border-border py-2 text-xs transition-colors hover:bg-accent/50",
                  sel && "bg-accent/30"
                ),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider text-muted-foreground", children: format(d, "EEE") }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                        today && "bg-primary text-primary-foreground"
                      ),
                      children: format(d, "d")
                    }
                  )
                ]
              },
              d.toISOString()
            );
          })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative grid",
        style: {
          gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
          height: HOUR_HEIGHT * 24
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "relative border-r border-border", children: HOURS.map((h) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "relative text-[10px] text-muted-foreground",
              style: { height: HOUR_HEIGHT },
              children: /* @__PURE__ */ jsx("span", { className: "absolute -top-1.5 right-1.5", children: h === 0 ? "" : format(new Date(0, 0, 0, h), "h a") })
            },
            h
          )) }),
          days.map((day) => {
            const dayStart = startOfDay(day);
            const dayEvents = events.filter(
              (e) => isSameDay(e.start, day) || e.start < dayStart && e.end > dayStart
            );
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative border-l border-border",
                children: [
                  HOURS.map((h) => /* @__PURE__ */ jsx(
                    "div",
                    {
                      onClick: () => {
                        if (!onCreate) return;
                        const d = new Date(day);
                        d.setHours(h, 0, 0, 0);
                        onCreate(d);
                      },
                      className: "border-t border-border/40",
                      style: { height: HOUR_HEIGHT }
                    },
                    h
                  )),
                  isToday(day) && /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "pointer-events-none absolute left-0 right-0 z-10 flex items-center",
                      style: { top: nowOffset },
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "size-2 -ml-1 rounded-full bg-destructive" }),
                        /* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-destructive" })
                      ]
                    }
                  ),
                  dayEvents.map((e) => {
                    const startMin = Math.max(
                      0,
                      differenceInMinutes(e.start, dayStart)
                    );
                    const endMin = Math.min(
                      24 * 60,
                      differenceInMinutes(e.end, dayStart)
                    );
                    const top = startMin / 60 * HOUR_HEIGHT;
                    const height = Math.max(
                      20,
                      (endMin - startMin) / 60 * HOUR_HEIGHT - 2
                    );
                    const isGoogle = e.source === "google";
                    const cat = getCategoryConfig(e.category);
                    const sc = getShiftConfig(e.shiftType);
                    const customIcon = e.iconName ? ICON_MAP[e.iconName] : null;
                    const Icon = sc?.Icon ?? customIcon ?? (e.category === "work" && (e.shiftType || e.iconColor) ? null : cat.Icon);
                    const bg = isGoogle ? "#94A3B8" : sc?.colour ?? ensureReadableBadgeColour(e.iconColor, cat.colour);
                    return /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => onEventClick?.(e),
                        className: "absolute left-1 right-1 flex flex-col gap-0.5 overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-left text-[11px] text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md",
                        style: {
                          top,
                          height,
                          backgroundColor: bg,
                          borderLeftColor: "rgba(0,0,0,0.25)"
                        },
                        title: isGoogle ? `${e.title} (Google Calendar)` : e.title,
                        children: [
                          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 font-semibold leading-tight", children: [
                            isGoogle ? /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: cn("shrink-0", days.length === 1 ? "size-[18px]" : "size-4"), fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V8h14v13z" }) }) : Icon ? /* @__PURE__ */ jsx(Icon, { className: cn("shrink-0", days.length === 1 ? "size-[18px]" : "size-4") }) : null,
                            /* @__PURE__ */ jsx("span", { className: "truncate", children: e.title })
                          ] }),
                          height > 32 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] opacity-90", children: [
                            format(e.start, "h:mm a"),
                            " – ",
                            format(e.end, "h:mm a")
                          ] })
                        ]
                      },
                      e.id
                    );
                  })
                ]
              },
              day.toISOString()
            );
          })
        ]
      }
    ) })
  ] });
}
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx(ScrollBar, {}),
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
function greetingFor(d) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
function nudgeFor(opts) {
  const { shift, totalHours, workHours, restHours, isEmpty } = opts;
  if (shift === "night")
    return "Night shifts can disrupt your circadian rhythm — try to keep a consistent sleep window on your days off 🌙";
  if (shift === "morning")
    return "Early start ahead — a calm wind-down tonight protects tomorrow's energy ☀️";
  if (shift === "afternoon")
    return "Afternoon shift — fit in some light movement or sunlight before you clock in 🚶";
  if (shift === "oncall")
    return "On-call today — small recovery moments matter. Hydrate and breathe between calls 📞";
  if (isEmpty)
    return "A clear day. Rest is productive — protect it ❤️";
  if (workHours >= 9)
    return "A long work day. Block 10 minutes for yourself — it adds up 🌿";
  if (restHours < 7 && totalHours > 0)
    return "Aim for 7–9 hours of sleep tonight — Walker's research shows it sharpens mood and focus 😴";
  return "Small balanced choices compound. You've got this 🌟";
}
function TodayPanel({ date, events, onEventClick }) {
  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.start, date)).sort((a, b) => +a.start - +b.start),
    [events, date]
  );
  const chartData = useMemo(() => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    const totals = {};
    for (const e of dayEvents) {
      const s = e.start > start ? e.start : start;
      const en = e.end < end ? e.end : end;
      const mins = differenceInMinutes(en, s);
      if (mins <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + mins / 60;
    }
    return CATEGORY_LIST.map((c) => ({
      id: c.id,
      name: c.label,
      value: +(totals[c.id] || 0).toFixed(1),
      color: c.colour
    })).filter((d) => d.value > 0);
  }, [dayEvents, date]);
  const totalHours = chartData.reduce((a, b) => a + b.value, 0);
  const workHours = chartData.find((d) => d.id === "work")?.value ?? 0;
  const restHours = chartData.find((d) => d.id === "rest")?.value ?? 0;
  const shiftEvent = dayEvents.find((e) => e.shiftType);
  const shiftStyle = getShiftConfig(shiftEvent?.shiftType);
  const shiftMins = shiftEvent ? differenceInMinutes(shiftEvent.end, shiftEvent.start) : 0;
  const nudge = nudgeFor({
    shift: shiftEvent?.shiftType ?? null,
    totalHours,
    workHours,
    restHours,
    isEmpty: dayEvents.length === 0
  });
  return /* @__PURE__ */ jsx("aside", { className: "hidden h-full w-80 shrink-0 border-l border-border bg-card/30 lg:block", children: /* @__PURE__ */ jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 p-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-muted-foreground", children: [
        greetingFor(/* @__PURE__ */ new Date()),
        ", there!"
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl font-bold leading-tight", children: format(date, "EEEE") }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: format(date, "MMMM d, yyyy") })
    ] }),
    shiftStyle && shiftEvent && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-3 rounded-2xl p-4 text-white shadow-sm",
        style: {
          background: `linear-gradient(135deg, ${shiftStyle.colour}, ${shiftStyle.colour}cc)`
        },
        children: [
          /* @__PURE__ */ jsx("span", { className: "flex size-10 items-center justify-center rounded-xl bg-white/20", children: /* @__PURE__ */ jsx(shiftStyle.Icon, { className: "size-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs uppercase tracking-wider opacity-80", children: [
              shiftStyle.label,
              " shift"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "truncate text-sm font-semibold", children: [
              format(shiftEvent.start, "h:mm a"),
              " –",
              " ",
              format(shiftEvent.end, "h:mm a")
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold tabular-nums", children: [
            (shiftMins / 60).toFixed(1),
            "h"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-baseline justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Today's hours" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          totalHours.toFixed(1),
          "h"
        ] })
      ] }),
      chartData.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-3 overflow-hidden rounded-full bg-muted", children: chartData.map((d) => /* @__PURE__ */ jsx(
          "div",
          {
            title: `${d.name}: ${d.value}h`,
            className: "h-full transition-all",
            style: {
              width: `${d.value / totalHours * 100}%`,
              backgroundColor: d.color
            }
          },
          d.id
        )) }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 grid grid-cols-2 gap-1.5 text-[11px]", children: chartData.map((d) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "size-2 rounded-full",
              style: { backgroundColor: d.color }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: d.name }),
          /* @__PURE__ */ jsxs("span", { className: "ml-auto font-medium", children: [
            d.value,
            "h"
          ] })
        ] }, d.id)) })
      ] }) : /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-xs text-muted-foreground", children: "Nothing scheduled yet." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Events" }),
      dayEvents.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "mx-auto mb-1 size-4" }),
        "Free day. Time to rest."
      ] }) : /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: dayEvents.map((e) => {
        const cat = getCategoryConfig(e.category);
        const Icon = cat.Icon;
        const evShift = getShiftConfig(e.shiftType);
        return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => onEventClick?.(e),
            className: "group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
                  style: { backgroundColor: cat.colour },
                  children: /* @__PURE__ */ jsx(Icon, { className: "size-4" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "size-1.5 shrink-0 rounded-full",
                      style: { backgroundColor: cat.colour }
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium", children: e.title })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  format(e.start, "h:mm a"),
                  " – ",
                  format(e.end, "h:mm a")
                ] }),
                evShift && /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white",
                    style: { backgroundColor: evShift.colour },
                    children: [
                      /* @__PURE__ */ jsx(evShift.Icon, { className: "size-2.5" }),
                      evShift.label
                    ]
                  }
                )
              ] })
            ]
          }
        ) }, e.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4", children: [
      /* @__PURE__ */ jsx(Lightbulb, { className: "mt-0.5 size-4 shrink-0 text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-foreground/80", children: nudge })
    ] })
  ] }) }) });
}
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function toInputDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromInputDateTime(value) {
  return new Date(value).toISOString();
}
const BREAKS = [
  { v: 30, label: "30 min" },
  { v: 45, label: "45 min" },
  { v: 60, label: "1 hour" },
  { v: 90, label: "1.5 hours" },
  { v: 120, label: "2 hours" }
];
const DEFAULT_SPLIT = {
  firstStart: "06:00",
  firstEnd: "10:00",
  breakMinutes: 60,
  secondStart: "16:00",
  secondEnd: "20:00"
};
function gt(a, b) {
  return a > b;
}
function SplitShiftFields({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const workColour = getCategoryConfig("work").colour;
  const firstEndError = value.firstStart && value.firstEnd && !gt(value.firstEnd, value.firstStart) ? "First shift end must be after first shift start" : null;
  const secondStartError = value.firstEnd && value.secondStart && !gt(value.secondStart, value.firstEnd) ? "Second shift start must be after first shift end" : null;
  const secondEndError = value.secondStart && value.secondEnd && !gt(value.secondEnd, value.secondStart) ? "Second shift end must be after second shift start" : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "mt-3 space-y-4 rounded-lg border p-3",
      style: { borderColor: `${workColour}66`, backgroundColor: `${workColour}0D` },
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: workColour }, children: "Split shift details" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 mx-0 my-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "First shift" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "First shift start" }),
              /* @__PURE__ */ jsx(Input, { type: "time", value: value.firstStart, onChange: (e) => set({ firstStart: e.target.value }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "First shift end" }),
              /* @__PURE__ */ jsx(Input, { type: "time", value: value.firstEnd, onChange: (e) => set({ firstEnd: e.target.value }) }),
              firstEndError && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-destructive", children: firstEndError })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Break duration" }),
          /* @__PURE__ */ jsxs(Select, { value: String(value.breakMinutes), onValueChange: (v) => set({ breakMinutes: Number(v) }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: BREAKS.map((b) => /* @__PURE__ */ jsx(SelectItem, { value: String(b.v), children: b.label }, b.v)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 mx-0 my-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Second shift" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Second shift start" }),
              /* @__PURE__ */ jsx(Input, { type: "time", value: value.secondStart, onChange: (e) => set({ secondStart: e.target.value }) }),
              secondStartError && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-destructive", children: secondStartError })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Second shift end" }),
              /* @__PURE__ */ jsx(Input, { type: "time", value: value.secondEnd, onChange: (e) => set({ secondEnd: e.target.value }) }),
              secondEndError && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-destructive", children: secondEndError })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function useAllShiftTypes() {
  const { templates } = useShiftTemplates();
  return useMemo(() => {
    const system = Object.keys(SHIFT_CONFIG).map((key) => {
      const c = SHIFT_CONFIG[key];
      return {
        id: `sys_${key}`,
        kind: "system",
        systemKey: key,
        label: c.label,
        shortLabel: c.shortLabel,
        colour: c.colour,
        Icon: c.Icon,
        iconName: c.icon,
        category: c.category,
        defaultStart: c.defaultStart,
        defaultEnd: c.defaultEnd,
        isAllDay: c.isAllDay,
        overnight: c.overnight,
        isPayday: c.isPayday
      };
    });
    const custom = templates.map((t) => ({
      id: `tpl_${t.id}`,
      kind: "custom",
      templateId: t.id,
      label: t.name,
      shortLabel: t.name.slice(0, 8),
      colour: t.colour,
      Icon: getIcon(t.iconName) ?? Sparkles,
      iconName: t.iconName ?? void 0,
      category: t.category === "leave" ? "work" : t.category === "non_working" ? "rest" : "work",
      defaultStart: t.defaultStart,
      defaultEnd: t.defaultEnd,
      isAllDay: !t.defaultStart || !t.defaultEnd
    }));
    return { system, custom, all: [...system, ...custom] };
  }, [templates]);
}
const TYPES = [
  { value: "morning", label: "Morning (AM)", Icon: Sun, color: "#F59E0B" },
  { value: "afternoon", label: "Afternoon (PM)", Icon: Sunset, color: "#F97316" },
  { value: "night", label: "Night", Icon: Moon, color: "#6366F1" },
  { value: "oncall", label: "On-Call", Icon: Radio, color: "#14B8A6" },
  { value: "split", label: "Split Shift", Icon: GitBranch, color: "#A855F7" },
  { value: "side_hustle", label: "Side Hustle", Icon: Zap, color: "#F59E0B" },
  { value: "sick_leave", label: "Sick Leave", Icon: Thermometer, color: "#EF4444" },
  { value: "annual_leave", label: "Annual Leave", Icon: Umbrella, color: "#0EA5E9" },
  { value: "custom", label: "Other", Icon: MoreHorizontal, color: "#64748B" }
];
function ShiftFieldsGroup({ value, onChange, onPickTemplate, selectedTemplateId }) {
  const isSplit = value.shiftType === "split";
  const isCustom = value.shiftType === "custom";
  const workColour = getCategoryConfig("work").colour;
  const { custom: customTemplates } = useAllShiftTypes();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "space-y-3 rounded-lg border p-3",
      style: { borderColor: `${workColour}66`, backgroundColor: `${workColour}0D` },
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider", style: { color: workColour }, children: "Shift details" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Shift type" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: TYPES.map((t) => {
            const selected = value.shiftType === t.value;
            const Icon = t.Icon;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => onChange({ ...value, shiftType: t.value, customLabel: void 0 }),
                "aria-pressed": selected,
                className: cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-all",
                  "hover:border-foreground/30 active:scale-[0.98]",
                  selected ? "border-transparent bg-background shadow-sm ring-2" : "border-border bg-background/50"
                ),
                style: selected ? { boxShadow: `0 0 0 2px ${t.color}` } : void 0,
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "flex size-7 shrink-0 items-center justify-center rounded-md text-white",
                      style: { backgroundColor: t.color },
                      children: /* @__PURE__ */ jsx(Icon, { className: "size-4", strokeWidth: 2.25 })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-medium", children: t.label })
                ]
              },
              t.value
            );
          }) })
        ] }),
        customTemplates.length > 0 && onPickTemplate && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 border-t border-border/60 pt-3", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "My Custom Shifts" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: customTemplates.map((t) => {
            const TIcon = t.Icon;
            const selected = selectedTemplateId === t.templateId;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => onPickTemplate(t),
                "aria-pressed": selected,
                className: cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-all",
                  "hover:border-foreground/30 active:scale-[0.98]",
                  selected ? "border-transparent bg-background shadow-sm ring-2" : "border-border bg-background/50"
                ),
                style: selected ? { boxShadow: `0 0 0 2px ${t.colour}` } : void 0,
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "flex size-7 shrink-0 items-center justify-center rounded-md text-white",
                      style: { backgroundColor: t.colour },
                      children: /* @__PURE__ */ jsx(TIcon, { className: "size-4", strokeWidth: 2.25 })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-medium", children: t.label })
                ]
              },
              t.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "grid transition-all duration-300 ease-out",
              isSplit ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            ),
            children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: isSplit && /* @__PURE__ */ jsx(
              SplitShiftFields,
              {
                value: value.split ?? DEFAULT_SPLIT,
                onChange: (split) => onChange({ ...value, split })
              }
            ) })
          }
        ),
        isCustom && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Custom shift name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: value.customLabel ?? "",
              onChange: (e) => onChange({ ...value, customLabel: e.target.value }),
              placeholder: "e.g. Twilight, Weekend cover"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Role" }),
            /* @__PURE__ */ jsx(Input, { value: value.role, onChange: (e) => onChange({ ...value, role: e.target.value }), placeholder: "e.g. RN" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Location" }),
            /* @__PURE__ */ jsx(Input, { value: value.location, onChange: (e) => onChange({ ...value, location: e.target.value }), placeholder: "e.g. Ward 4B" })
          ] })
        ] })
      ]
    }
  );
}
const PRESETS = Object.keys(SHIFT_CONFIG).map((key) => {
  const c = SHIFT_CONFIG[key];
  return {
    id: key,
    label: c.label,
    Icon: c.Icon,
    color: c.colour,
    category: c.category,
    shiftType: key === "payday" ? void 0 : key,
    allDay: c.isAllDay,
    startTime: c.defaultStart ?? void 0,
    endTime: c.defaultEnd ?? void 0,
    overnight: c.overnight,
    iconName: c.icon,
    isPayday: c.isPayday,
    defaultTitle: c.label
  };
});
function QuickAddPresets({ onPick }) {
  return /* @__PURE__ */ jsxs("div", { className: "-mx-1", children: [
    /* @__PURE__ */ jsx("p", { className: "px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Quick add" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 px-1 pb-1", children: PRESETS.map((p) => {
      const Icon = p.Icon;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onPick(p),
          className: "group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95",
          style: {
            backgroundColor: `${p.color}26`,
            color: p.color
          },
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "size-4", strokeWidth: 2.5 }),
            /* @__PURE__ */ jsx("span", { children: p.label })
          ]
        },
        p.id
      );
    }) })
  ] });
}
function blankShift() {
  return { shiftType: "morning", role: "", location: "" };
}
function setTimeOnDate(base, hhmm, addDays2 = 0) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setDate(d.getDate() + addDays2);
  d.setHours(h, m, 0, 0);
  return d;
}
function defaultStartFor(base) {
  const now = /* @__PURE__ */ new Date();
  const d = new Date(base ?? now);
  d.setHours(now.getHours() + 1, 0, 0, 0);
  return d;
}
function EventForm({ initial, defaultStart, defaultCategory, onSubmit, onDelete, onCancel }) {
  const start0 = initial?.start ?? defaultStartFor(defaultStart).toISOString();
  const end0 = initial?.end ?? new Date(new Date(start0).getTime() + 8 * 60 * 60 * 1e3).toISOString();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? defaultCategory ?? "work");
  const [start, setStart] = useState(toInputDateTime(start0));
  const [end, setEnd] = useState(toInputDateTime(end0));
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [iconName, setIconName] = useState(initial?.iconName);
  const [iconGradient, setIconGradient] = useState(initial?.iconGradient);
  const [iconColor, setIconColor] = useState(initial?.iconColor);
  const [customTemplateId, setCustomTemplateId] = useState(null);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [shift, setShift] = useState(initial?.shift ?? blankShift());
  const [isPayday, setIsPayday] = useState(initial?.isPayday ?? false);
  const [recurrencePattern, setRecurrencePattern] = useState(
    initial?.recurrencePattern ?? null
  );
  const [recurrenceDays, setRecurrenceDays] = useState(
    initial?.recurrenceDays ?? []
  );
  const cat = getCategoryConfig(category);
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const invalidRange = endMs === startMs;
  const isOvernight = endMs < startMs;
  const startDate = start.slice(0, 10);
  const startTime = start.slice(11, 16);
  const endDate = end.slice(0, 10);
  const endTime = end.slice(11, 16);
  const dtInputCls = "h-12 w-full rounded-[12px] bg-[#F1F5F9] px-3 text-base text-foreground outline-none focus:ring-2 focus:ring-ring dark:bg-[#1A2456] dark:text-[#F0F4FF] dark:border dark:border-[#3D3DA0] [&::-webkit-calendar-picker-indicator]:dark:invert";
  const applyPreset = (p) => {
    if (!title.trim()) setTitle(p.defaultTitle);
    setCategory(p.category);
    setAllDay(!!p.allDay);
    if (p.iconName) {
      setIconName(p.iconName);
      if (!iconGradient) setIconGradient("ocean");
    }
    setIsPayday(!!p.isPayday);
    if (p.category === "work") {
      setShift((s) => ({ ...s, shiftType: p.shiftType ?? s.shiftType }));
    }
    if (!p.allDay && p.startTime && p.endTime) {
      const base = new Date(start);
      const ns = setTimeOnDate(base, p.startTime);
      const overnight = p.overnight || p.endTime <= p.startTime;
      const ne = setTimeOnDate(base, p.endTime, overnight ? 1 : 0);
      setStart(toInputDateTime(ns.toISOString()));
      setEnd(toInputDateTime(ne.toISOString()));
    }
  };
  const submit = () => {
    if (!title.trim()) return;
    if (invalidRange) return;
    let endISO = fromInputDateTime(end);
    if (isOvernight) {
      const d = new Date(end);
      d.setDate(d.getDate() + 1);
      endISO = d.toISOString();
    }
    const draft = {
      title: title.trim(),
      category,
      start: fromInputDateTime(start),
      end: endISO,
      allDay,
      iconName: iconName || void 0,
      iconGradient: iconName && !iconColor ? iconGradient ?? "ocean" : void 0,
      iconColor: iconColor || void 0,
      notes: notes || void 0,
      shift: category === "work" ? shift : void 0,
      isPayday: category === "work" ? isPayday : false,
      recurrencePattern,
      recurrenceDays: recurrencePattern === "custom" ? recurrenceDays : null,
      recurrenceEndDate: null
    };
    onSubmit(draft);
  };
  const applyCustomTemplate = (t) => {
    if (!title.trim()) setTitle(t.label);
    setCategory(t.category);
    setAllDay(t.isAllDay);
    setIconName(t.iconName);
    setIconColor(t.colour);
    setCustomTemplateId(t.templateId ?? null);
    setShift({ shiftType: "custom", role: "", location: "", customLabel: t.label });
    if (!t.isAllDay && t.defaultStart && t.defaultEnd) {
      const base = new Date(start);
      const ns = setTimeOnDate(base, t.defaultStart);
      const overnight = t.defaultEnd <= t.defaultStart;
      const ne = setTimeOnDate(base, t.defaultEnd, overnight ? 1 : 0);
      setStart(toInputDateTime(ns.toISOString()));
      setEnd(toInputDateTime(ne.toISOString()));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(QuickAddPresets, { onPick: applyPreset }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { children: "Title" }),
      /* @__PURE__ */ jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "What's happening?", autoFocus: true })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { children: "Category" }),
      /* @__PURE__ */ jsxs(Select, { value: category, onValueChange: (v) => setCategory(v), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "size-3 rounded-full", style: { backgroundColor: cat.colour } }),
          cat.label
        ] }) }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: CATEGORY_LIST.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id, children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "size-3 rounded-full", style: { backgroundColor: c.colour } }),
          c.label
        ] }) }, c.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border border-border p-2.5", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "allday", className: "cursor-pointer text-sm font-normal", children: "All-day event" }),
      /* @__PURE__ */ jsx(Switch, { id: "allday", checked: allDay, onCheckedChange: setAllDay })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { children: "Starts" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: startDate,
            onChange: (e) => setStart(`${e.target.value}T${startTime}`),
            className: cn(dtInputCls, "basis-3/5")
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "time",
            value: startTime,
            onChange: (e) => setStart(`${startDate}T${e.target.value}`),
            className: cn(dtInputCls, "basis-2/5")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { children: "Ends" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: endDate,
            onChange: (e) => setEnd(`${e.target.value}T${endTime}`),
            className: cn(dtInputCls, "basis-3/5")
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "time",
            value: endTime,
            onChange: (e) => setEnd(`${endDate}T${e.target.value}`),
            className: cn(dtInputCls, "basis-2/5")
          }
        )
      ] }),
      invalidRange && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Start and end time cannot be the same" }),
      !invalidRange && isOvernight && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "🌙 Ends next day" })
    ] }),
    /* @__PURE__ */ jsx(
      IconPicker,
      {
        value: iconName,
        gradient: iconGradient,
        onChange: (name, g) => {
          setIconName(name);
          setIconGradient(g);
        }
      }
    ),
    category === "work" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        ShiftFieldsGroup,
        {
          value: shift,
          onChange: (s) => {
            setShift(s);
            if (s.shiftType !== "custom") {
              setCustomTemplateId(null);
              setIconColor(void 0);
            }
          },
          onPickTemplate: applyCustomTemplate,
          selectedTemplateId: customTemplateId
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border border-border p-2.5", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "payday", className: "flex cursor-pointer items-center gap-2 text-sm font-normal", children: [
          /* @__PURE__ */ jsx("span", { children: "💰" }),
          " Payday"
        ] }),
        /* @__PURE__ */ jsx(Switch, { id: "payday", checked: isPayday, onCheckedChange: setIsPayday })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { children: "Notes" }),
      /* @__PURE__ */ jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, placeholder: "Optional notes" })
    ] }),
    /* @__PURE__ */ jsx(
      RecurrenceBlock,
      {
        pattern: recurrencePattern,
        days: recurrenceDays,
        onPatternChange: setRecurrencePattern,
        onDaysChange: setRecurrenceDays
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 pt-2", children: [
      /* @__PURE__ */ jsx("div", { children: onDelete && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: onDelete, className: "gap-1.5 text-destructive", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
        " Delete"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "button", onClick: submit, disabled: invalidRange, children: initial ? "Save" : "Create" })
      ] })
    ] })
  ] });
}
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function RecurrenceBlock({
  pattern,
  days,
  onPatternChange,
  onDaysChange
}) {
  const isOn = pattern !== null;
  const toggleDay = (key) => {
    if (days.includes(key)) {
      onDaysChange(days.filter((d) => d !== key));
    } else {
      onDaysChange([...days, key]);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-md border border-border p-2.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(Label, { className: "cursor-pointer text-sm font-normal", children: "Recurring" }),
      /* @__PURE__ */ jsx(
        Switch,
        {
          checked: isOn,
          onCheckedChange: (v) => onPatternChange(v ? "weekly" : null)
        }
      )
    ] }),
    isOn && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: ["daily", "weekly", "fortnightly", "custom"].map(
        (k) => {
          const active = pattern === k;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => onPatternChange(k),
              className: cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"
              ),
              children: k
            },
            k
          );
        }
      ) }),
      pattern === "custom" && /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: WEEKDAY_LABELS.map((label, i) => {
        const key = WEEKDAY_KEYS[i];
        const active = days.includes(key);
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => toggleDay(key),
            className: cn(
              "flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition-all",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"
            ),
            children: label
          },
          i
        );
      }) })
    ] })
  ] });
}
function EventDialog({ open, onOpenChange, eventId, defaultStart, defaultCategory }) {
  const { getEvent, createEvent, updateEvent, deleteEvent } = useEvents();
  const initial = eventId ? getEvent(eventId) : void 0;
  const handleSubmit = (draft) => {
    if (initial) updateEvent(initial.id, draft);
    else createEvent(draft);
    onOpenChange(false);
  };
  const handleDelete = initial ? () => {
    deleteEvent(initial.id);
    onOpenChange(false);
  } : void 0;
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-lg", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: initial ? "Edit event" : "New event" }) }),
    /* @__PURE__ */ jsx(
      EventForm,
      {
        initial,
        defaultStart,
        defaultCategory,
        onSubmit: handleSubmit,
        onDelete: handleDelete,
        onCancel: () => onOpenChange(false)
      }
    )
  ] }) });
}
function WeekSummaryDialog({
  open,
  onOpenChange,
  weekAnchor,
  events
}) {
  const days = useMemo(
    () => eachDayOfInterval({
      start: startOfWeek(weekAnchor, { weekStartsOn: 1 }),
      end: endOfWeek(weekAnchor, { weekStartsOn: 1 })
    }),
    [weekAnchor]
  );
  const weekEvents = useMemo(
    () => events.filter((e) => days.some((d) => isSameDay(d, e.start))),
    [events, days]
  );
  const totalsByCat = useMemo(() => {
    const totals = {};
    for (const e of weekEvents) {
      const mins = differenceInMinutes(e.end, e.start);
      if (mins <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + mins / 60;
    }
    return CATEGORY_LIST.map((c) => ({
      id: c.id,
      name: c.label,
      value: +(totals[c.id] || 0).toFixed(1),
      color: c.colour
    }));
  }, [weekEvents]);
  const maxCat = Math.max(1, ...totalsByCat.map((t) => t.value));
  const dayTotals = useMemo(
    () => days.map((d) => {
      const evs = weekEvents.filter((e) => isSameDay(e.start, d));
      const hours = evs.reduce(
        (a, e) => a + differenceInMinutes(e.end, e.start) / 60,
        0
      );
      const shift = evs.find((e) => e.shiftType);
      return { date: d, hours, shift, events: evs };
    }),
    [days, weekEvents]
  );
  const busiest = dayTotals.reduce(
    (best, d) => d.hours > best.hours ? d : best,
    dayTotals[0]
  );
  const mostRested = dayTotals.reduce(
    (best, d) => d.hours < best.hours ? d : best,
    dayTotals[0]
  );
  const workHours = totalsByCat.find((t) => t.id === "work")?.value ?? 0;
  const restHours = totalsByCat.find((t) => t.id === "rest")?.value ?? 0;
  const exerciseHours = totalsByCat.find((t) => t.id === "exercise")?.value ?? 0;
  const socialHours = totalsByCat.find((t) => t.id === "social")?.value ?? 0;
  const insight = (() => {
    if (workHours > 45)
      return "You're logging more than 45 hours of work this week — schedule active recovery to protect long-term wellbeing.";
    if (exerciseHours < 2.5)
      return "WHO recommends at least 150 minutes of moderate movement per week. A short walk on a quiet day adds up.";
    if (restHours < 49)
      return "Aim for ~7 hours of sleep nightly. Consistent sleep windows ease the strain of rotating shifts.";
    if (socialHours < 2)
      return "Holt-Lunstad's research links social connection to longevity. Block in time with someone you trust.";
    return "Balanced week. Keep noticing what works — small rhythms beat big resets 🌟";
  })();
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-h-[90vh] max-w-2xl overflow-hidden p-0", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "border-b border-border px-6 pb-4 pt-6", children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: "Week summary" }),
      /* @__PURE__ */ jsxs(DialogDescription, { children: [
        format(days[0], "MMM d"),
        " – ",
        format(days[6], "MMM d, yyyy")
      ] })
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "max-h-[calc(90vh-6rem)]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 px-6 py-5", children: [
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Shift schedule" }),
        /* @__PURE__ */ jsx("ul", { className: "grid grid-cols-1 gap-1.5 sm:grid-cols-2", children: dayTotals.map((d) => {
          const shiftStyle = getShiftConfig(d.shift?.shiftType);
          return /* @__PURE__ */ jsxs(
            "li",
            {
              className: "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2",
              children: [
                /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
                  format(d.date, "EEE"),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: format(d.date, "d") })
                ] }) }),
                shiftStyle ? /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white",
                    style: { backgroundColor: shiftStyle.colour },
                    children: [
                      /* @__PURE__ */ jsx(shiftStyle.Icon, { className: "size-3" }),
                      shiftStyle.label
                    ]
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: "Off" })
              ]
            },
            +d.date
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Hours by category" }),
        /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: totalsByCat.map((t) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "w-20 shrink-0 text-xs text-muted-foreground", children: t.name }),
          /* @__PURE__ */ jsx("div", { className: "h-2.5 flex-1 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full transition-all",
              style: {
                width: `${t.value / maxCat * 100}%`,
                backgroundColor: t.color
              }
            }
          ) }),
          /* @__PURE__ */ jsxs("span", { className: "w-12 shrink-0 text-right text-xs font-medium tabular-nums", children: [
            t.value,
            "h"
          ] })
        ] }, t.id)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "size-3.5" }),
            " Busiest day"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-bold", children: format(busiest.date, "EEEE") }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            busiest.hours.toFixed(1),
            " planned hours"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Moon, { className: "size-3.5" }),
            " Most rested day"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-bold", children: format(mostRested.date, "EEEE") }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            mostRested.hours.toFixed(1),
            " planned hours"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "mt-0.5 size-4 shrink-0 text-primary" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-primary", children: "Wellness insight" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-foreground/80", children: insight })
        ] })
      ] }),
      weekEvents.length === 0 && /* @__PURE__ */ jsxs("p", { className: "flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "size-4" }),
        " Nothing scheduled this week yet."
      ] })
    ] }) })
  ] }) });
}
function DaySummaryDialog({ open, onOpenChange, date, events, onEventClick, onAddEvent }) {
  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.start, date)).sort((a, b) => +a.start - +b.start),
    [events, date]
  );
  const chart = useMemo(() => {
    const s = startOfDay(date), en = endOfDay(date);
    const totals = {};
    for (const e of dayEvents) {
      const a = e.start > s ? e.start : s;
      const b = e.end < en ? e.end : en;
      const m = differenceInMinutes(b, a);
      if (m <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + m / 60;
    }
    return CATEGORY_LIST.map((c) => ({
      id: c.id,
      name: c.label,
      value: +(totals[c.id] || 0).toFixed(1),
      color: c.colour
    })).filter((d) => d.value > 0);
  }, [dayEvents, date]);
  const total = chart.reduce((a, b) => a + b.value, 0);
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md p-0 gap-0", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "p-5 pb-3", children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: format(date, "EEEE, MMM d") }),
      /* @__PURE__ */ jsx(DialogDescription, { children: dayEvents.length === 0 ? "No events" : `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""} · ${total.toFixed(1)}h scheduled` })
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "max-h-[60vh] px-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 pb-4", children: [
      chart.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-2.5 overflow-hidden rounded-full bg-muted", children: chart.map((d) => /* @__PURE__ */ jsx(
          "div",
          {
            title: `${d.name}: ${d.value}h`,
            style: { width: `${d.value / total * 100}%`, backgroundColor: d.color }
          },
          d.id
        )) }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 grid grid-cols-2 gap-1 text-[11px]", children: chart.map((d) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full", style: { backgroundColor: d.color } }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: d.name }),
          /* @__PURE__ */ jsxs("span", { className: "ml-auto font-medium", children: [
            d.value,
            "h"
          ] })
        ] }, d.id)) })
      ] }),
      dayEvents.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "mx-auto mb-2 size-5" }),
        "Nothing scheduled. A clear day."
      ] }) : /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: dayEvents.map((e) => {
        const cat = getCategoryConfig(e.category);
        const shiftStyle = getShiftConfig(e.shiftType);
        const CustomIcon = e.iconName ? ICON_MAP[e.iconName] : null;
        const bg = shiftStyle?.colour ?? ensureReadableBadgeColour(e.iconColor, cat.colour);
        const Icon = shiftStyle?.Icon ?? CustomIcon ?? cat.Icon;
        return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              onOpenChange(false);
              onEventClick?.(e);
            },
            className: "group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm",
            children: [
              /* @__PURE__ */ jsx("span", { className: "flex size-10 shrink-0 items-center justify-center rounded-lg text-white", style: { backgroundColor: bg }, children: /* @__PURE__ */ jsx(Icon, { className: "size-5" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold", children: e.title }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  format(e.start, "h:mm a"),
                  " – ",
                  format(e.end, "h:mm a")
                ] }),
                e.location && /* @__PURE__ */ jsxs("p", { className: "mt-0.5 truncate text-[11px] text-muted-foreground", children: [
                  "📍 ",
                  e.location
                ] })
              ] })
            ]
          }
        ) }, e.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-border p-3", children: /* @__PURE__ */ jsxs(Button, { className: "w-full gap-1.5", onClick: () => {
      onOpenChange(false);
      onAddEvent?.(date);
    }, children: [
      /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
      " Add event"
    ] }) })
  ] }) });
}
const StampContext = createContext(null);
function setTimeOnDay(day, hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}
function startOfDayDate(day) {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDayDate(day) {
  const d = new Date(day);
  d.setHours(23, 59, 0, 0);
  return d;
}
function buildDraftFromStamp(stamp, day) {
  if (stamp.allDay || !stamp.startTime || !stamp.endTime) {
    const allDayDraft = {
      title: stamp.label,
      category: stamp.category ?? "personal",
      start: startOfDayDate(day).toISOString(),
      end: endOfDayDate(day).toISOString(),
      allDay: true,
      iconName: stamp.iconName,
      iconColor: stamp.colour,
      isPayday: !!stamp.isPayday,
      shift: stamp.shiftType ? {
        shiftType: stamp.shiftType,
        role: "",
        location: ""
      } : void 0
    };
    if (allDayDraft.category === "travel" || stamp.shiftType === "travel") {
      allDayDraft.travelDurationMinutes = 60;
    }
    return allDayDraft;
  }
  const start = setTimeOnDay(day, stamp.startTime);
  let end = setTimeOnDay(day, stamp.endTime);
  if (stamp.overnight || end <= start) end.setDate(end.getDate() + 1);
  const draft = {
    title: stamp.label,
    category: stamp.category ?? "work",
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false,
    iconName: stamp.iconName,
    iconColor: stamp.colour,
    isPayday: !!stamp.isPayday,
    shift: stamp.shiftType ? { shiftType: stamp.shiftType, role: "", location: "" } : void 0
  };
  if (stamp.shiftType === "split" && draft.shift) {
    draft.shift.split = {
      firstStart: "06:00",
      firstEnd: "10:00",
      breakMinutes: 240,
      secondStart: "14:00",
      secondEnd: "20:00"
    };
  }
  if (stamp.category === "travel") {
    draft.travelDurationMinutes = 60;
  }
  return draft;
}
function StampProvider({ children }) {
  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { events, createEvent, deleteEvent } = useEvents();
  const applyStamp = useCallback(
    async (day) => {
      if (!selected) return;
      try {
        const dayEvents = events.filter((e) => isSameDay(new Date(e.start), day));
        if (selected.kind === "clear") {
          const shiftEvent = dayEvents.find((e) => e.shift || e.category === "work" || e.category === "rest");
          if (shiftEvent) {
            await deleteEvent(shiftEvent.id);
            toast("Cleared");
          }
          return;
        }
        if (selected.kind === "icon") {
          const existing = dayEvents.find(
            (e) => e.iconName === selected.iconName && e.allDay && e.category === "personal"
          );
          if (existing) {
            await deleteEvent(existing.id);
            return;
          }
          await createEvent({
            title: selected.label,
            category: "personal",
            start: startOfDayDate(day).toISOString(),
            end: endOfDayDate(day).toISOString(),
            allDay: true,
            iconName: selected.iconName,
            iconColor: selected.colour
          });
          return;
        }
        const draft = buildDraftFromStamp(selected, day);
        const existingSame = dayEvents.find(
          (e) => e.category === draft.category && (e.shift?.shiftType ?? null) === (draft.shift?.shiftType ?? null) && (e.isPayday ?? false) === (draft.isPayday ?? false)
        );
        if (existingSame) {
          await deleteEvent(existingSame.id);
          return;
        }
        await createEvent(draft);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to apply";
        toast(msg);
      }
    },
    [selected, events, createEvent, deleteEvent]
  );
  const value = useMemo(
    () => ({ selected, setSelected, applyStamp, panelOpen, setPanelOpen }),
    [selected, applyStamp, panelOpen]
  );
  return /* @__PURE__ */ jsx(StampContext.Provider, { value, children });
}
function useStamp() {
  const ctx = useContext(StampContext);
  if (!ctx) throw new Error("useStamp must be used in StampProvider");
  return ctx;
}
function QuickAddFab() {
  const { panelOpen, setPanelOpen, setSelected } = useStamp();
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => {
        if (panelOpen) setSelected(null);
        setPanelOpen(!panelOpen);
      },
      "aria-label": "Quick add",
      className: cn(
        "fixed z-50 flex size-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105",
        "bg-gradient-to-br from-primary to-primary/80"
      ),
      style: {
        bottom: "max(20px, env(safe-area-inset-bottom))",
        right: "max(16px, env(safe-area-inset-right))"
      },
      children: panelOpen ? /* @__PURE__ */ jsx(X, { className: "size-6" }) : /* @__PURE__ */ jsxs("span", { className: "relative", children: [
        /* @__PURE__ */ jsx(Plus, { className: "size-6" }),
        /* @__PURE__ */ jsx(Zap, { className: "absolute -bottom-1 -right-1.5 size-3.5 fill-yellow-300 text-yellow-300" })
      ] })
    }
  );
}
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
function QuickAddPanel({ onOpenDetailedEvent }) {
  const { panelOpen, setPanelOpen, selected, setSelected } = useStamp();
  const { custom } = useAllShiftTypes();
  const [tab, setTab] = useState("shifts");
  if (!panelOpen) return null;
  const customStamps = custom.map((t) => ({
    id: t.id,
    kind: "shift",
    label: t.label,
    shortLabel: t.shortLabel,
    colour: t.colour,
    Icon: t.Icon,
    category: t.category,
    allDay: t.isAllDay,
    startTime: t.defaultStart ?? void 0,
    endTime: t.defaultEnd ?? void 0,
    iconName: t.iconName
  }));
  const shiftItems = [...SHIFT_STAMPS, ...customStamps];
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "fixed inset-x-0 bottom-0 z-40 h-[28vh] min-h-[220px] max-h-[28vh] rounded-t-2xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-1.5 border-b border-border", style: { height: 36 }, children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: selected ? `Tap days to apply "${selected.label}"` : "Select a shift, then tap days to apply" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setPanelOpen(false);
            setSelected(null);
          },
          "aria-label": "Close",
          className: "text-muted-foreground hover:text-foreground",
          children: /* @__PURE__ */ jsx(X, { className: "size-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: setTab, className: "flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mx-3 mt-1 h-8", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "shifts", children: "Shifts" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "leave", children: "Leave / Off" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "icons", children: "Icons" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "shifts", className: "flex-1 overflow-y-auto px-3 pb-1 max-h-[20vh]", children: /* @__PURE__ */ jsx(StampGrid, { items: shiftItems, selected, onPick: setSelected }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "leave", className: "flex-1 overflow-y-auto px-3 pb-1 max-h-[20vh]", children: /* @__PURE__ */ jsx(StampGrid, { items: LEAVE_STAMPS, selected, onPick: setSelected }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "icons", className: "flex-1 overflow-y-auto px-3 pb-1 max-h-[20vh]", children: /* @__PURE__ */ jsx(StampGrid, { items: ICON_STAMPS, selected, onPick: setSelected }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 border-t border-border px-3 py-1", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, className: "gap-1.5 text-xs", children: /* @__PURE__ */ jsxs(Link, { to: "/shifts", children: [
        /* @__PURE__ */ jsx(Settings2, { className: "size-3.5" }),
        "Manage shifts"
      ] }) }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: onOpenDetailedEvent, className: "gap-1.5 text-xs", children: [
        /* @__PURE__ */ jsx(PenLine, { className: "size-3.5" }),
        "Detailed event"
      ] })
    ] })
  ] }) });
}
function StampGrid({
  items,
  selected,
  onPick
}) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 pt-2 sm:grid-cols-4", children: items.map((s) => {
    const isActive = selected?.id === s.id;
    const Icon = s.Icon;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onPick(isActive ? null : s),
        className: cn(
          "flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-white shadow-sm transition-all",
          "hover:-translate-y-0.5 hover:shadow-md",
          isActive && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-[1.02]"
        ),
        style: { backgroundColor: s.colour },
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "size-5" }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold leading-none", children: s.shortLabel })
        ]
      },
      s.id
    );
  }) });
}
const PRIORITY = [
  "busy_stretch",
  "sleep_reminder",
  "exercise_reminder",
  "social_connection",
  "family_time"
];
const DISMISS_PREFIX = "kookaflow_nudge_";
const DISMISS_SUFFIX = "_dismissed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
function dismissKey(id) {
  return `${DISMISS_PREFIX}${id}${DISMISS_SUFFIX}`;
}
function isDismissed(id) {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(dismissKey(id));
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < SEVEN_DAYS_MS;
}
function dismissNudge(id) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(dismissKey(id), String(Date.now()));
}
function eventsInWeek(events, anchor) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return events.filter((e) => isWithinInterval(e.start, { start, end }));
}
function hasConsecutiveWorkStretch(events, anchor) {
  const week = eventsInWeek(events, anchor);
  const days = /* @__PURE__ */ new Set();
  const restDays = /* @__PURE__ */ new Set();
  for (const e of week) {
    const key = e.start.toDateString();
    if (e.category === "work") days.add(key);
    if (e.category === "rest" || e.category === "wellness") restDays.add(key);
  }
  const sorted = Array.from(days).map((s) => new Date(s)).sort((a, b) => a.getTime() - b.getTime());
  let run = 0;
  let prev = null;
  for (const d of sorted) {
    if (restDays.has(d.toDateString())) {
      run = 0;
      prev = d;
      continue;
    }
    if (prev && isSameDay(new Date(prev.getTime() + 864e5), d)) {
      run += 1;
    } else {
      run = 1;
    }
    if (run >= 3) return true;
    prev = d;
  }
  return false;
}
function hasCategoryThisWeek(events, anchor, cats) {
  return eventsInWeek(events, anchor).some((e) => cats.includes(e.category));
}
function hasCategoryLast7Days(events, anchor, cats) {
  const start = subDays(anchor, 7);
  return events.some(
    (e) => cats.includes(e.category) && isWithinInterval(e.start, { start, end: anchor })
  );
}
function useCalendarNudges(events, anchor = /* @__PURE__ */ new Date(), version = 0) {
  return useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    const dow = today.getDay();
    const triggered = /* @__PURE__ */ new Set();
    if (hasConsecutiveWorkStretch(events, anchor)) triggered.add("busy_stretch");
    if (!hasCategoryThisWeek(events, anchor, ["rest"]))
      triggered.add("sleep_reminder");
    if (!hasCategoryThisWeek(events, anchor, ["exercise"]) && (dow === 0 || dow >= 3))
      triggered.add("exercise_reminder");
    if (!hasCategoryThisWeek(events, anchor, ["social", "family"]))
      triggered.add("social_connection");
    if (!hasCategoryLast7Days(events, anchor, ["family"]))
      triggered.add("family_time");
    for (const id of PRIORITY) {
      if (!triggered.has(id)) continue;
      if (isDismissed(id)) continue;
      return NUDGE_DEFS[id];
    }
    return null;
  }, [events, anchor, version]);
}
const NUDGE_DEFS = {
  busy_stretch: {
    id: "busy_stretch",
    message: "You've got a busy stretch coming up. Want to block some recovery time? 💜",
    buttonLabel: "Add Rest Time",
    category: "rest",
    colour: "#8B5CF6"
  },
  sleep_reminder: {
    id: "sleep_reminder",
    message: "Matthew Walker's research shows sleep is your superpower. Protect your rest this week 🌙",
    buttonLabel: "Add Rest",
    category: "rest",
    colour: "#8B5CF6"
  },
  exercise_reminder: {
    id: "exercise_reminder",
    message: "The WHO recommends 150 min of movement a week. Want to add some? 🏃",
    buttonLabel: "Add Exercise",
    category: "exercise",
    colour: "#F59E0B"
  },
  social_connection: {
    id: "social_connection",
    message: "Research shows social connection is one of the strongest predictors of wellbeing. Any time for people this week? 👥",
    buttonLabel: "Add Social Time",
    category: "social",
    colour: "#10B981"
  },
  family_time: {
    id: "family_time",
    message: "Family connection recharges us in ways nothing else can. Any family time this week? 🏡",
    buttonLabel: "Add Family Time",
    category: "family",
    colour: "#EF4444"
  }
};
function hexAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function WellnessNudgeBanner({ events, anchor, onAction }) {
  const [dismissedTick, setDismissedTick] = useState(0);
  const nudge = useCalendarNudges(events, anchor, dismissedTick);
  if (!nudge) return null;
  const handleDismiss = (id) => {
    dismissNudge(id);
    setDismissedTick((t) => t + 1);
  };
  const handleAction = () => {
    onAction(nudge.category);
    handleDismiss(nudge.id);
  };
  return /* @__PURE__ */ jsx("div", { className: "px-5 pt-2 animate-in slide-in-from-top-2 duration-200", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-start justify-between gap-3",
      style: {
        background: hexAlpha(nudge.colour, 0.12),
        borderLeft: `3px solid ${nudge.colour}`,
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 8
      },
      children: [
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "text-foreground",
            style: { fontSize: 14, fontWeight: 400, lineHeight: 1.4 },
            children: nudge.message
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end shrink-0", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleAction,
              className: "font-bold text-white",
              style: {
                background: nudge.colour,
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 20,
                marginBottom: 4
              },
              children: nudge.buttonLabel
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => handleDismiss(nudge.id),
              "aria-label": "Dismiss nudge",
              className: "text-muted-foreground hover:text-foreground inline-flex items-center justify-center",
              style: { fontSize: 11, minHeight: 44, minWidth: 44 },
              children: "Dismiss"
            }
          )
        ] })
      ]
    }
  ) });
}
function CalendarPage() {
  return /* @__PURE__ */ jsx(StampProvider, { children: /* @__PURE__ */ jsx(CalendarPageInner, {}) });
}
function CalendarPageInner() {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(/* @__PURE__ */ new Date());
  const {
    events: rawEvents
  } = useEvents();
  const fetchGoogle = useServerFn(listGoogleEvents);
  const fetchStatus = useServerFn(getGoogleConnectionStatus);
  const runSync = useServerFn(triggerGoogleSync);
  const {
    data: googleEvents = []
  } = useQuery({
    queryKey: ["google-events"],
    queryFn: () => fetchGoogle({
      data: {}
    }),
    staleTime: 6e4
  });
  const {
    data: gStatus
  } = useQuery({
    queryKey: ["google-connection-status"],
    queryFn: () => fetchStatus(),
    staleTime: 6e4
  });
  const syncedOnceRef = useRef(false);
  useEffect(() => {
    if (!gStatus?.connected || syncedOnceRef.current) return;
    syncedOnceRef.current = true;
    runSync().catch(() => void 0);
  }, [gStatus?.connected, runSync]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dialogDefault, setDialogDefault] = useState(/* @__PURE__ */ new Date());
  const [dialogCategory, setDialogCategory] = useState(void 0);
  const [weekSummaryOpen, setWeekSummaryOpen] = useState(false);
  const [daySummaryOpen, setDaySummaryOpen] = useState(false);
  const [googleDetail, setGoogleDetail] = useState(null);
  const {
    selected: stamp,
    applyStamp,
    panelOpen
  } = useStamp();
  const events = useMemo(() => {
    const local = rawEvents.flatMap((e) => expandRecurring(toMockEvent(e), e.recurrenceEndDate ?? null));
    const google = googleEvents.map((g) => ({
      id: `google:${g.id}`,
      title: g.summary ?? "(no title)",
      category: "personal",
      start: new Date(g.start),
      end: new Date(g.end),
      location: g.location ?? void 0,
      source: "google",
      externalUrl: g.htmlLink ?? void 0
    }));
    return [...local, ...google];
  }, [rawEvents, googleEvents]);
  const handleDaySelect = (d) => {
    if (stamp) {
      void applyStamp(d);
      return;
    }
    setDate(d);
    setDaySummaryOpen(true);
  };
  const goPrev = () => {
    if (view === "month") setDate((d) => addMonths(d, -1));
    else if (view === "week") setDate((d) => addDays(d, -7));
    else setDate((d) => addDays(d, -1));
  };
  const openCreate = (d) => {
    setEditingId(null);
    setDialogDefault(d ?? /* @__PURE__ */ new Date());
    setDialogCategory(void 0);
    setDialogOpen(true);
  };
  const openCreateWithCategory = (category) => {
    setEditingId(null);
    setDialogDefault(/* @__PURE__ */ new Date());
    setDialogCategory(category);
    setDialogOpen(true);
  };
  const openEdit = (e) => {
    if (e.source === "google") {
      setGoogleDetail(e);
      return;
    }
    setEditingId(e.id);
    setDialogCategory(void 0);
    setDialogOpen(true);
  };
  const goNext = () => {
    if (view === "month") setDate((d) => addMonths(d, 1));
    else if (view === "week") setDate((d) => addDays(d, 7));
    else setDate((d) => addDays(d, 1));
  };
  const weekDays = useMemo(() => eachDayOfInterval({
    start: startOfWeek(date, {
      weekStartsOn: 1
    }),
    end: endOfWeek(date, {
      weekStartsOn: 1
    })
  }), [date]);
  const heading = view === "month" ? format(date, "MMMM yyyy") : view === "week" ? `${format(weekDays[0], "MMM d")} – ${format(weekDays[6], "MMM d, yyyy")}` : format(date, "EEEE, MMM d, yyyy");
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[100dvh] flex-col bg-background text-foreground overflow-hidden", children: [
    !panelOpen && /* @__PURE__ */ jsxs("header", { className: "md:hidden flex items-center justify-between gap-2 px-3 text-white shrink-0", style: {
      height: 44,
      background: "radial-gradient(ellipse at 80% 20%, #ffc338 0%, #fb862a 25%, #7e294d 60%, #251074 100%)"
    }, children: [
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Kookaflow", style: {
        height: 32,
        width: "auto"
      }, className: "object-contain" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-bold truncate", children: format(date, "MMM yyyy") }),
      /* @__PURE__ */ jsx(ThemeToggle, {})
    ] }),
    !panelOpen && /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs(PageHeader, { title: heading, subtitle: `${events.length} events this period`, right: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => openCreate(date), className: "gap-1.5 bg-white/20 text-white hover:bg-white/30", children: [
        /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Add event" })
      ] })
    ] }), children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur", children: ["month", "week", "day"].map((v) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setView(v), className: cn("rounded-full px-3 py-1 text-xs font-medium capitalize transition-all duration-200", view === v ? "bg-white/25 text-white shadow" : "text-white/80 hover:text-white"), children: v }, v)) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setDate(/* @__PURE__ */ new Date()), className: "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white", children: "Today" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center rounded-md border border-white/30 bg-white/10", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: goPrev, className: "flex h-11 w-11 items-center justify-center text-white transition-colors hover:bg-white/20", "aria-label": "Previous", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: goNext, className: "flex h-11 w-11 items-center justify-center border-l border-white/30 text-white transition-colors hover:bg-white/20", "aria-label": "Next", children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" }) })
      ] }),
      /* @__PURE__ */ jsxs(Popover, { children: [
        /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white", children: [
          /* @__PURE__ */ jsx(CalendarIcon, { className: "size-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: heading })
        ] }) }),
        /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: date, onSelect: (d) => d && setDate(d), initialFocus: true, className: cn("p-3 pointer-events-auto") }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "md:hidden flex items-center justify-between gap-2 border-b border-border px-2 shrink-0", style: {
      height: 44
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-0.5", children: ["month", "week", "day"].map((v) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setView(v), className: cn("rounded-full px-2.5 py-1 text-[12px] font-medium capitalize transition-colors", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"), children: v }, v)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: goPrev, "aria-label": "Previous", className: "flex size-8 items-center justify-center rounded-md border border-border hover:bg-muted", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setDate(/* @__PURE__ */ new Date()), className: "h-8 px-3 text-xs", children: "Today" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: goNext, "aria-label": "Next", className: "flex size-8 items-center justify-center rounded-md border border-border hover:bg-muted", children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center justify-between border-b border-border px-5 py-2.5", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold", children: heading }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        view === "week" && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => setWeekSummaryOpen(true), className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(CalendarDays, { className: "size-3.5" }),
          "Week summary"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          events.length,
          " events this period"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(WellnessNudgeBanner, { events, anchor: date, onAction: openCreateWithCategory }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden transition-[padding] duration-200", style: {
      paddingBottom: panelOpen ? "28vh" : 0
    }, children: [
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-hidden", children: events.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { illustration: /* @__PURE__ */ jsx(KookaburraOnCalendar, { className: "w-full h-auto" }), title: "Your calendar is empty", subtitle: "Add your first shift to get started 🦅", actionLabel: "Add Event", onAction: () => openCreate(date) }) : view === "month" ? /* @__PURE__ */ jsx(MonthView, { cursor: date, selected: date, events, onSelect: handleDaySelect, onCreate: openCreate, onEventClick: openEdit }) : view === "week" ? /* @__PURE__ */ jsx(TimeGrid, { days: weekDays, events, selected: date, onSelectDay: handleDaySelect, onCreate: openCreate, onEventClick: openEdit }) : /* @__PURE__ */ jsx(TimeGrid, { days: [date], events, selected: date, onSelectDay: handleDaySelect, onCreate: openCreate, onEventClick: openEdit }) }),
      /* @__PURE__ */ jsx(TodayPanel, { date, events, onEventClick: openEdit })
    ] }),
    /* @__PURE__ */ jsx(EventDialog, { open: dialogOpen, onOpenChange: setDialogOpen, eventId: editingId, defaultStart: dialogDefault, defaultCategory: dialogCategory }),
    /* @__PURE__ */ jsx(WeekSummaryDialog, { open: weekSummaryOpen, onOpenChange: setWeekSummaryOpen, weekAnchor: date, events }),
    /* @__PURE__ */ jsx(DaySummaryDialog, { open: daySummaryOpen, onOpenChange: setDaySummaryOpen, date, events, onEventClick: openEdit, onAddEvent: openCreate }),
    /* @__PURE__ */ jsx(Dialog, { open: !!googleDetail, onOpenChange: (o) => !o && setGoogleDetail(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4 text-muted-foreground", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V8h14v13z" }) }),
          googleDetail?.title || "(no title)"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "From Google Calendar · read-only" })
      ] }),
      googleDetail && /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Date:" }),
          " ",
          format(googleDetail.start, "EEEE, MMM d, yyyy")
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Time:" }),
          " ",
          format(googleDetail.start, "h:mm a"),
          " – ",
          format(googleDetail.end, "h:mm a")
        ] }),
        googleDetail.location && /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Location:" }),
          " ",
          googleDetail.location
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: googleDetail?.externalUrl && /* @__PURE__ */ jsx("a", { href: googleDetail.externalUrl, target: "_blank", rel: "noopener", className: "text-xs text-muted-foreground underline hover:text-foreground", children: "Open in Google Calendar ↗" }) })
    ] }) }),
    /* @__PURE__ */ jsx(QuickAddFab, {}),
    /* @__PURE__ */ jsx(QuickAddPanel, { onOpenDetailedEvent: () => {
      openCreate(date);
    } })
  ] });
}
function toMockEvent(e) {
  const rawShiftType = e.shift?.shiftType;
  const mockShiftType = rawShiftType && rawShiftType !== "custom" ? rawShiftType : void 0;
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    start: new Date(e.start),
    end: new Date(e.end),
    shiftType: mockShiftType,
    location: e.shift?.location,
    notes: e.notes,
    iconName: e.iconName,
    iconColor: e.iconColor,
    recurrence: e.recurrencePattern ? e.recurrencePattern === "custom" ? {
      kind: "custom",
      days: (e.recurrenceDays ?? []).map(weekdayKeyToIndex).filter((n) => n != null)
    } : {
      kind: e.recurrencePattern
    } : {
      kind: "none"
    }
  };
}
const WEEKDAY_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};
function weekdayKeyToIndex(k) {
  return WEEKDAY_INDEX[k] ?? null;
}
const MAX_RECURRING_OCCURRENCES = 60;
function expandRecurring(base, recurrenceEndDate) {
  const rec = base.recurrence;
  if (!rec || rec.kind === "none") return [base];
  const durationMs = base.end.getTime() - base.start.getTime();
  const endLimit = recurrenceEndDate ? /* @__PURE__ */ new Date(`${recurrenceEndDate}T23:59:59`) : addDays(base.start, 365);
  const out = [];
  const pushAt = (d, idx) => {
    const start = new Date(d);
    const end = new Date(start.getTime() + durationMs);
    out.push(idx === 0 ? {
      ...base,
      start,
      end
    } : {
      ...base,
      id: `${base.id}::rec-${idx}`,
      start,
      end
    });
  };
  if (rec.kind === "daily") {
    for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i++) {
      const d = addDays(base.start, i);
      if (d > endLimit) break;
      pushAt(d, i);
    }
  } else if (rec.kind === "weekly") {
    for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i++) {
      const d = addDays(base.start, i * 7);
      if (d > endLimit) break;
      pushAt(d, i);
    }
  } else if (rec.kind === "fortnightly") {
    for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i++) {
      const d = addDays(base.start, i * 14);
      if (d > endLimit) break;
      pushAt(d, i);
    }
  } else if (rec.kind === "custom") {
    const days = new Set(rec.days);
    if (days.size === 0) return [base];
    let count = 0;
    let idx = 0;
    for (let offset = 0; count < MAX_RECURRING_OCCURRENCES; offset++) {
      const d = addDays(base.start, offset);
      if (d > endLimit) break;
      if (!days.has(d.getDay())) continue;
      pushAt(d, idx);
      idx++;
      count++;
    }
  }
  return out.length > 0 ? out : [base];
}
export {
  CalendarPage as component
};
