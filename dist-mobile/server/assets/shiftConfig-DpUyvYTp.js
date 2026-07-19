import { Sun, Moon, Sunset, Car, Briefcase, Heart, Dumbbell, Users, Home, Coffee, Music, Book, Plane, Utensils, Bike, Leaf, Star, Bell, Zap, Thermometer, Umbrella, Radio, GitBranch, DollarSign, Baby, Dog, Gamepad2, ShoppingBag, Stethoscope, Bus, Clock3, Flag } from "lucide-react";
import { jsxs, jsx } from "react/jsx-runtime";
import { c as cn } from "./router-CfW6Ca5m.js";
const GRADIENTS = [
  { id: "sunrise", label: "Sunrise", from: "#F59E0B", to: "#EF4444", className: "bg-gradient-to-br from-[#F59E0B] to-[#EF4444]" },
  { id: "ocean", label: "Ocean", from: "#3B82F6", to: "#06B6D4", className: "bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]" },
  { id: "forest", label: "Forest", from: "#10B981", to: "#84CC16", className: "bg-gradient-to-br from-[#10B981] to-[#84CC16]" },
  { id: "lavender", label: "Lavender", from: "#8B5CF6", to: "#EC4899", className: "bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]" },
  { id: "slate", label: "Slate", from: "#64748B", to: "#475569", className: "bg-gradient-to-br from-[#64748B] to-[#475569]" },
  { id: "coral", label: "Coral", from: "#F43F5E", to: "#FB923C", className: "bg-gradient-to-br from-[#F43F5E] to-[#FB923C]" }
];
const GRADIENT_MAP = GRADIENTS.reduce(
  (a, g) => (a[g.id] = g, a),
  {}
);
function getGradient(id) {
  return id && GRADIENT_MAP[id] || GRADIENTS[0];
}
function nextGradient(id) {
  const i = GRADIENTS.findIndex((g) => g.id === id);
  return GRADIENTS[(i + 1) % GRADIENTS.length].id;
}
const ICONS = [
  { name: "Sun", Icon: Sun },
  { name: "Moon", Icon: Moon },
  { name: "Sunset", Icon: Sunset },
  { name: "Car", Icon: Car },
  { name: "Briefcase", Icon: Briefcase },
  { name: "Heart", Icon: Heart },
  { name: "Dumbbell", Icon: Dumbbell },
  { name: "Users", Icon: Users },
  { name: "Home", Icon: Home },
  { name: "Coffee", Icon: Coffee },
  { name: "Music", Icon: Music },
  { name: "Book", Icon: Book },
  { name: "Plane", Icon: Plane },
  { name: "Utensils", Icon: Utensils },
  { name: "Bike", Icon: Bike },
  { name: "Leaf", Icon: Leaf },
  { name: "Star", Icon: Star },
  { name: "Bell", Icon: Bell },
  { name: "Zap", Icon: Zap },
  { name: "Thermometer", Icon: Thermometer },
  { name: "Umbrella", Icon: Umbrella },
  { name: "Radio", Icon: Radio },
  { name: "GitBranch", Icon: GitBranch },
  { name: "DollarSign", Icon: DollarSign },
  { name: "Baby", Icon: Baby },
  { name: "Dog", Icon: Dog },
  { name: "Gamepad", Icon: Gamepad2 },
  { name: "ShoppingBag", Icon: ShoppingBag },
  { name: "Stethoscope", Icon: Stethoscope },
  { name: "Bus", Icon: Bus },
  { name: "Clock3", Icon: Clock3 },
  { name: "Flag", Icon: Flag }
];
const ICON_MAP = ICONS.reduce(
  (a, i) => (a[i.name] = i.Icon, a),
  {}
);
function getIcon(name) {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}
function IconPicker({ value, gradient, onChange }) {
  const activeGradient = gradient ?? "ocean";
  const handleTap = (name) => {
    if (value === name) {
      onChange(name, nextGradient(activeGradient));
    } else {
      onChange(name, activeGradient);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 mx-0 my-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Icon" }),
      value && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(void 0, activeGradient),
          className: "text-xs text-muted-foreground hover:text-foreground",
          children: "Clear"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: ICONS.map(({ name, Icon }) => {
      const selected = value === name;
      const g = selected ? getGradient(activeGradient) : GRADIENT_MAP.slate;
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => handleTap(name),
          "aria-label": name,
          "aria-pressed": selected,
          className: cn(
            "relative flex size-11 items-center justify-center rounded-2xl text-white transition-transform active:scale-95",
            g.className,
            !selected && "opacity-60 hover:opacity-100",
            selected && "ring-2 ring-white ring-offset-2 ring-offset-background shadow-md scale-[1.02]"
          ),
          children: /* @__PURE__ */ jsx(Icon, { className: "size-5", strokeWidth: 2.25 })
        },
        name
      );
    }) }),
    value && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Tap the selected icon again to cycle through colors." })
  ] });
}
const CATEGORY_CONFIG = {
  work: { label: "Work / Shifts", colour: "#3B82F6", icon: "Briefcase", Icon: Briefcase },
  business: { label: "Business", colour: "#0EA5E9", icon: "Briefcase", Icon: Briefcase },
  rest: { label: "Rest / Sleep", colour: "#8B5CF6", icon: "Moon", Icon: Moon },
  wellness: { label: "Wellness", colour: "#EC4899", icon: "Heart", Icon: Heart },
  exercise: { label: "Exercise", colour: "#10B981", icon: "Dumbbell", Icon: Dumbbell },
  social: { label: "Social", colour: "#F59E0B", icon: "Users", Icon: Users },
  family: { label: "Family", colour: "#EF4444", icon: "Home", Icon: Home },
  personal: { label: "Personal", colour: "#6366F1", icon: "Star", Icon: Star },
  travel: { label: "Travel", colour: "#06B6D4", icon: "Car", Icon: Car }
};
const SHIFT_CONFIG = {
  morning: { label: "Morning", shortLabel: "AM", colour: "#F59E0B", icon: "Sun", Icon: Sun, category: "work", defaultStart: "06:00", defaultEnd: "14:00", isAllDay: false },
  afternoon: { label: "Afternoon", shortLabel: "PM", colour: "#F97316", icon: "Sunset", Icon: Sunset, category: "work", defaultStart: "14:00", defaultEnd: "22:00", isAllDay: false },
  night: { label: "Night", shortLabel: "Night", colour: "#6366F1", icon: "Moon", Icon: Moon, category: "work", defaultStart: "22:00", defaultEnd: "06:00", isAllDay: false, overnight: true },
  oncall: { label: "On-Call", shortLabel: "Call", colour: "#14B8A6", icon: "Radio", Icon: Radio, category: "work", defaultStart: null, defaultEnd: null, isAllDay: true },
  split: { label: "Split Shift", shortLabel: "Split", colour: "#8B5CF6", icon: "GitBranch", Icon: GitBranch, category: "work", defaultStart: "08:00", defaultEnd: "20:00", isAllDay: false },
  side_hustle: { label: "Side Hustle", shortLabel: "Hustle", colour: "#D4A017", icon: "Zap", Icon: Zap, category: "work", defaultStart: "09:00", defaultEnd: "17:00", isAllDay: false },
  sick_leave: { label: "Sick Leave", shortLabel: "Sick", colour: "#EF4444", icon: "Thermometer", Icon: Thermometer, category: "work", defaultStart: null, defaultEnd: null, isAllDay: true },
  annual_leave: { label: "Annual Leave", shortLabel: "Leave", colour: "#0EA5E9", icon: "Umbrella", Icon: Umbrella, category: "work", defaultStart: null, defaultEnd: null, isAllDay: true },
  travel: { label: "Travel", shortLabel: "Travel", colour: "#64748B", icon: "Car", Icon: Car, category: "travel", defaultStart: null, defaultEnd: null, isAllDay: true, travelDurationMinutes: 60 },
  payday: { label: "Payday", shortLabel: "Pay", colour: "#10B981", icon: "DollarSign", Icon: DollarSign, category: "work", defaultStart: null, defaultEnd: null, isAllDay: true, isPayday: true }
};
function getCategoryConfig(id) {
  return CATEGORY_CONFIG[id] ?? CATEGORY_CONFIG.personal;
}
function ensureReadableBadgeColour(colour, fallback) {
  if (!colour) return fallback;
  const hex = colour.trim().replace(/^#/, "");
  const norm = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.length === 6 ? hex : null;
  if (!norm || !/^[0-9a-fA-F]{6}$/.test(norm)) return fallback;
  const r = parseInt(norm.slice(0, 2), 16) / 255;
  const g = parseInt(norm.slice(2, 4), 16) / 255;
  const b = parseInt(norm.slice(4, 6), 16) / 255;
  const lin = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.3 ? fallback : `#${norm}`;
}
function getShiftConfig(type) {
  if (!type) return null;
  return SHIFT_CONFIG[type] ?? null;
}
function getEventColour(event) {
  const sc = getShiftConfig(event.shift?.shiftType);
  if (sc) return sc.colour;
  if (event.isPayday) return SHIFT_CONFIG.payday.colour;
  return getCategoryConfig(event.category).colour;
}
const CATEGORY_LIST = Object.keys(CATEGORY_CONFIG).map((id) => ({
  id,
  label: CATEGORY_CONFIG[id].label,
  colour: CATEGORY_CONFIG[id].colour,
  Icon: CATEGORY_CONFIG[id].Icon
}));
export {
  CATEGORY_LIST as C,
  IconPicker as I,
  SHIFT_CONFIG as S,
  getIcon as a,
  getCategoryConfig as b,
  getShiftConfig as c,
  ICON_MAP as d,
  ensureReadableBadgeColour as e,
  getEventColour as g
};
