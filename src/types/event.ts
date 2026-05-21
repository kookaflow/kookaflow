export type CategoryId =
  | "work"
  | "rest"
  | "wellness"
  | "exercise"
  | "social"
  | "family"
  | "personal";

export type ShiftType = "morning" | "afternoon" | "night" | "rotating";

export interface ShiftMeta {
  shiftType: ShiftType;
  role: string;
  location: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: CategoryId;
  start: string; // ISO
  end: string; // ISO
  allDay: boolean;
  icon?: string;
  colorTag?: string;
  notes?: string;
  shift?: ShiftMeta;
  createdAt: string;
  updatedAt: string;
}

export type EventDraft = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">;