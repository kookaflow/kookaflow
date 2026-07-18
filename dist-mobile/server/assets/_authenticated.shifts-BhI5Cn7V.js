import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { X, ArrowLeft, Plus, Search, Sparkles, Pencil, Trash2 } from "lucide-react";
import { c as cn, B as Button } from "./router-BND-OwId.js";
import { I as Input } from "./input-COyQ-O9p.js";
import { u as useShiftTemplates } from "./ShiftTemplatesProvider-BXt4644x.js";
import { S as SHIFT_STAMPS, L as LEAVE_STAMPS } from "./stamps-x5eE3_NJ.js";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { L as Label } from "./label-DyyUUh84.js";
import { I as IconPicker, a as getIcon } from "./shiftConfig-Bs1pzrbu.js";
import { toast } from "sonner";
import { E as EmptyState, B as BriefcaseEmpty } from "./empty-illustrations-zct7lJA5.js";
import "@tanstack/react-query";
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
import "@lovable.dev/mcp-js/stacks/tanstack";
import "@lovable.dev/mcp-js";
import "./client.server-U_pH-Evd.js";
import "./google-calendar.server-B_7mIU_e.js";
import "crypto";
import "./stripe.server-DLwKer5H.js";
import "stripe";
import "@radix-ui/react-label";
const Sheet = DialogPrimitive.Root;
const SheetPortal = DialogPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(DialogPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = DialogPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
SheetFooter.displayName = "SheetFooter";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
const COLOURS = [
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#A855F7",
  "#6366F1",
  "#3B82F6",
  "#0EA5E9",
  "#14B8A6",
  "#10B981",
  "#22C55E",
  "#84CC16",
  "#FACC15",
  "#D4A017",
  "#64748B",
  "#94A3B8"
];
const CATEGORIES = [
  { value: "working", label: "Working" },
  { value: "leave", label: "Leave" },
  { value: "non_working", label: "Non-working" }
];
function ShiftEditorSheet({ open, onOpenChange, template }) {
  const { create, update } = useShiftTemplates();
  const [name, setName] = useState("");
  const [colour, setColour] = useState(COLOURS[0]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [category, setCategory] = useState("working");
  const [iconName, setIconName] = useState(void 0);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    if (template) {
      setName(template.name);
      setColour(template.colour);
      setStart(template.defaultStart?.slice(0, 5) ?? "09:00");
      setEnd(template.defaultEnd?.slice(0, 5) ?? "17:00");
      setCategory(template.category);
      setIconName(template.iconName ?? void 0);
    } else {
      setName("");
      setColour(COLOURS[0]);
      setStart("09:00");
      setEnd("17:00");
      setCategory("working");
      setIconName(void 0);
    }
  }, [open, template]);
  const duration = (() => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let m = eh * 60 + em - (sh * 60 + sm);
    if (m <= 0) m += 24 * 60;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  })();
  const isOvernight = !!start && !!end && end <= start;
  const sameTimeError = !!start && !!end && start === end;
  const onSave = async () => {
    if (!name.trim()) {
      toast("Name required");
      return;
    }
    if (sameTimeError) {
      toast("Start and end cannot be the same");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        colour,
        iconName: iconName ?? null,
        defaultStart: start || null,
        defaultEnd: end || null,
        category,
        baseType: null
      };
      if (template) {
        await update(template.id, payload);
      } else {
        await create({ ...payload });
      }
      onOpenChange(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxs(SheetContent, { side: "bottom", className: "max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(SheetHeader, { children: /* @__PURE__ */ jsx(SheetTitle, { children: template ? "Edit shift" : "New shift" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "shift-name", children: "Name" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "shift-name",
            value: name,
            onChange: (e) => setName(e.target.value.slice(0, 12)),
            maxLength: 12,
            placeholder: "e.g. Long Day"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Colour" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-8 gap-2", children: COLOURS.map((c) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setColour(c),
            "aria-label": c,
            className: cn(
              "h-9 rounded-lg transition-transform",
              colour === c && "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-105"
            ),
            style: { backgroundColor: c }
          },
          c
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "shift-start", children: "Start" }),
          /* @__PURE__ */ jsx(Input, { id: "shift-start", type: "time", value: start, onChange: (e) => setStart(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "shift-end", children: "End" }),
          /* @__PURE__ */ jsx(Input, { id: "shift-end", type: "time", value: end, onChange: (e) => setEnd(e.target.value) }),
          isOvernight && !sameTimeError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "🌙 Ends next day" }),
          sameTimeError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-destructive", children: "Start and end cannot be the same" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Duration: ",
        duration
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Category" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-3 gap-2", children: CATEGORIES.map((c) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setCategory(c.value),
            className: cn(
              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              category === c.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            ),
            children: c.label
          },
          c.value
        )) })
      ] }),
      /* @__PURE__ */ jsx(
        IconPicker,
        {
          value: iconName,
          gradient: "ocean",
          onChange: (name2) => setIconName(name2)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(SheetFooter, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { onClick: onSave, disabled: saving, children: saving ? "Saving…" : "Save" })
    ] })
  ] }) });
}
function durationLabel(start, end) {
  if (!start || !end) return "All day";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}
function timeRange(start, end) {
  if (!start || !end) return "All day";
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}
function ShiftsPage() {
  const {
    templates,
    remove
  } = useShiftTemplates();
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filter = (label) => label.toLowerCase().includes(search.toLowerCase());
  const builtinWorking = SHIFT_STAMPS.filter((s) => s.category !== "travel" && filter(s.label));
  const builtinLeave = LEAVE_STAMPS.filter((s) => s.kind === "shift" && filter(s.label));
  const builtinNonWorking = LEAVE_STAMPS.filter((s) => s.kind === "clear" || s.kind === "rest").filter((s) => filter(s.label));
  const groupedCustom = useMemo(() => {
    const byCat = {
      working: [],
      leave: [],
      non_working: []
    };
    templates.filter((t) => filter(t.name)).forEach((t) => byCat[t.category]?.push(t));
    return byCat;
  }, [templates, search]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-3xl items-center gap-3 px-4 py-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/calendar", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-5" }) }) }),
        /* @__PURE__ */ jsx("h1", { className: "flex-1 text-lg font-semibold", children: "Shifts" }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setEditorOpen(true);
        }, className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
          " New"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-3xl px-4 pb-3", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search shifts", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl px-4 py-4 space-y-6", children: [
      templates.length === 0 && search.trim() === "" && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card", children: /* @__PURE__ */ jsx(EmptyState, { illustration: /* @__PURE__ */ jsx(BriefcaseEmpty, { className: "w-full h-auto" }), title: "No custom shifts yet", subtitle: "Create your first custom shift type", actionLabel: "Create Shift", onAction: () => {
        setEditing(null);
        setEditorOpen(true);
      } }) }),
      /* @__PURE__ */ jsxs(Section, { title: "WORKING", children: [
        builtinWorking.map((s) => /* @__PURE__ */ jsx(BuiltinRow, { stamp: s }, s.id)),
        groupedCustom.working.map((t) => /* @__PURE__ */ jsx(CustomRow, { template: t, onEdit: () => {
          setEditing(t);
          setEditorOpen(true);
        }, onDelete: () => remove(t.id) }, t.id))
      ] }),
      /* @__PURE__ */ jsxs(Section, { title: "LEAVE", children: [
        builtinLeave.map((s) => /* @__PURE__ */ jsx(BuiltinRow, { stamp: s }, s.id)),
        groupedCustom.leave.map((t) => /* @__PURE__ */ jsx(CustomRow, { template: t, onEdit: () => {
          setEditing(t);
          setEditorOpen(true);
        }, onDelete: () => remove(t.id) }, t.id))
      ] }),
      /* @__PURE__ */ jsxs(Section, { title: "NON-WORKING", children: [
        builtinNonWorking.map((s) => /* @__PURE__ */ jsx(BuiltinRow, { stamp: s }, s.id)),
        groupedCustom.non_working.map((t) => /* @__PURE__ */ jsx(CustomRow, { template: t, onEdit: () => {
          setEditing(t);
          setEditorOpen(true);
        }, onDelete: () => remove(t.id) }, t.id))
      ] })
    ] }),
    /* @__PURE__ */ jsx(ShiftEditorSheet, { open: editorOpen, onOpenChange: setEditorOpen, template: editing })
  ] });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: title }),
    /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-border bg-card divide-y divide-border", children })
  ] });
}
function BuiltinRow({
  stamp
}) {
  const Icon = stamp.Icon;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-10 w-14 items-center justify-center rounded-lg text-white text-[11px] font-semibold", style: {
      backgroundColor: stamp.colour
    }, children: /* @__PURE__ */ jsx(Icon, { className: "size-4" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate", children: stamp.label }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
        stamp.allDay ? "All day" : `${stamp.startTime} – ${stamp.endTime}`,
        !stamp.allDay && stamp.startTime && stamp.endTime && /* @__PURE__ */ jsxs(Fragment, { children: [
          " · ",
          durationLabel(stamp.startTime, stamp.endTime)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Built-in" })
  ] });
}
function CustomRow({
  template,
  onEdit,
  onDelete
}) {
  const Icon = getIcon(template.iconName) ?? Sparkles;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-10 w-14 items-center justify-center rounded-lg text-white text-[11px] font-semibold", style: {
      backgroundColor: template.colour
    }, children: /* @__PURE__ */ jsx(Icon, { className: "size-4" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate", children: template.name }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
        timeRange(template.defaultStart, template.defaultEnd),
        " · ",
        durationLabel(template.defaultStart, template.defaultEnd)
      ] })
    ] }),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: onEdit, "aria-label": "Edit", children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" }) }),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: onDelete, "aria-label": "Delete", children: /* @__PURE__ */ jsx(Trash2, { className: "size-4 text-destructive" }) })
  ] });
}
export {
  ShiftsPage as component
};
