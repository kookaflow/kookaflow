export type CategoryId =
  | "work"
  | "rest"
  | "wellness"
  | "exercise"
  | "social"
  | "family"
  | "personal"
  | "travel";

export type ShiftType =
  | "morning"
  | "afternoon"
  | "night"
  | "oncall"
  | "split"
  | "sick_leave"
  | "annual_leave";

export interface SplitShiftMeta {
  firstStart: string; // "HH:mm"
  firstEnd: string;
  breakMinutes: number;
  secondStart: string;
  secondEnd: string;
}

export interface ShiftMeta {
  shiftType: ShiftType;
  role: string;
  location: string;
  split?: SplitShiftMeta;
}

export type GradientId =
  | "sunrise"
  | "ocean"
  | "forest"
  | "lavender"
  | "slate"
  | "coral";

export interface CalendarEvent {
  id: string;
  title: string;
  category: CategoryId;
  start: string; // ISO
  end: string; // ISO
  allDay: boolean;
  icon?: string;
  iconName?: string;
  iconGradient?: GradientId;
  colorTag?: string;
  notes?: string;
  shift?: ShiftMeta;
  isPayday?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventDraft = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">;