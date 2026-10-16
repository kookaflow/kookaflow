import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { c as cn, f as buttonVariants } from "./router-Cz9ZnHmk.js";
import { Flag, Clock3, Ban, BedDouble, DollarSign, Car, Dumbbell, Heart, Users, Home, Star, Coffee, Music, Book, Plane, Baby, Dog } from "lucide-react";
import { S as SHIFT_CONFIG } from "./shiftConfig-DYQKzsDI.js";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemLabel,
  onConfirm,
  warning,
  busy = false
}) {
  return /* @__PURE__ */ jsx(AlertDialog, { open, onOpenChange: (o) => !busy && onOpenChange(o), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
        "Delete ",
        itemLabel,
        "?"
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
        "Are you sure you want to delete ",
        itemLabel,
        "? This action cannot be undone.",
        warning ? /* @__PURE__ */ jsx("span", { className: "mt-1 block", children: warning }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: busy, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        AlertDialogAction,
        {
          onClick: (e) => {
            e.preventDefault();
            onConfirm();
          },
          disabled: busy,
          className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          children: busy ? "Deleting…" : "Delete"
        }
      )
    ] })
  ] }) });
}
function fromShiftConfig(key, idOverride) {
  const c = SHIFT_CONFIG[key];
  return {
    id: idOverride ?? key,
    kind: "shift",
    label: c.label,
    shortLabel: c.shortLabel,
    colour: c.colour,
    Icon: c.Icon,
    shiftType: key === "travel" || key === "payday" ? null : key,
    category: c.category,
    allDay: c.isAllDay,
    startTime: c.defaultStart ?? void 0,
    endTime: c.defaultEnd ?? void 0,
    overnight: c.overnight,
    iconName: c.icon,
    isPayday: c.isPayday
  };
}
const SHIFT_STAMPS = [
  fromShiftConfig("morning"),
  fromShiftConfig("afternoon"),
  fromShiftConfig("night"),
  fromShiftConfig("oncall"),
  fromShiftConfig("split"),
  fromShiftConfig("side_hustle"),
  fromShiftConfig("travel"),
  fromShiftConfig("payday")
];
const LEAVE_STAMPS = [
  fromShiftConfig("annual_leave"),
  fromShiftConfig("sick_leave"),
  { id: "public_holiday", kind: "shift", label: "Public Holiday", shortLabel: "Holiday", colour: "#22C55E", Icon: Flag, category: "personal", allDay: true, iconName: "Flag" },
  { id: "half_day", kind: "shift", label: "Half Day", shortLabel: "Half", colour: "#8B5CF6", Icon: Clock3, shiftType: "morning", category: "work", startTime: "09:00", endTime: "13:00", iconName: "Clock3" },
  { id: "no_shift", kind: "clear", label: "No Shift", shortLabel: "Clear", colour: "#94A3B8", Icon: Ban },
  { id: "rest_day", kind: "rest", label: "Rest Day", shortLabel: "Rest", colour: "#A78BFA", Icon: BedDouble, category: "rest", allDay: true, iconName: "Moon" }
];
const ICON_STAMPS = [
  { id: "icon_payday", kind: "icon", label: "Payday", shortLabel: "Payday", colour: "#10B981", Icon: DollarSign, iconName: "DollarSign" },
  { id: "icon_travel", kind: "icon", label: "Travel", shortLabel: "Travel", colour: "#64748B", Icon: Car, iconName: "Car" },
  { id: "icon_gym", kind: "icon", label: "Gym", shortLabel: "Gym", colour: "#F59E0B", Icon: Dumbbell, iconName: "Dumbbell" },
  { id: "icon_wellness", kind: "icon", label: "Wellness", shortLabel: "Wellness", colour: "#EC4899", Icon: Heart, iconName: "Heart" },
  { id: "icon_social", kind: "icon", label: "Social", shortLabel: "Social", colour: "#10B981", Icon: Users, iconName: "Users" },
  { id: "icon_family", kind: "icon", label: "Family", shortLabel: "Family", colour: "#EF4444", Icon: Home, iconName: "Home" },
  { id: "icon_star", kind: "icon", label: "Special", shortLabel: "Special", colour: "#FACC15", Icon: Star, iconName: "Star" },
  { id: "icon_coffee", kind: "icon", label: "Rest", shortLabel: "Coffee", colour: "#92400E", Icon: Coffee, iconName: "Coffee" },
  { id: "icon_music", kind: "icon", label: "Music", shortLabel: "Music", colour: "#A855F7", Icon: Music, iconName: "Music" },
  { id: "icon_book", kind: "icon", label: "Read", shortLabel: "Book", colour: "#0EA5E9", Icon: Book, iconName: "Book" },
  { id: "icon_plane", kind: "icon", label: "Travel", shortLabel: "Plane", colour: "#3B82F6", Icon: Plane, iconName: "Plane" },
  { id: "icon_baby", kind: "icon", label: "Kids", shortLabel: "Kids", colour: "#F472B6", Icon: Baby, iconName: "Baby" },
  { id: "icon_dog", kind: "icon", label: "Pet", shortLabel: "Pet", colour: "#A16207", Icon: Dog, iconName: "Dog" }
];
export {
  ConfirmDeleteDialog as C,
  ICON_STAMPS as I,
  LEAVE_STAMPS as L,
  SHIFT_STAMPS as S
};
