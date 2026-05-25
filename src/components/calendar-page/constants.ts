import type { CategoryId, ShiftType } from "@/types/event";

export type IconName = string;

export interface MockEvent {
  id: string;
  title: string;
  category: CategoryId;
  start: Date;
  end: Date;
  shiftType?: ShiftType;
  location?: string;
  notes?: string;
  iconName?: IconName;
  iconColor?: string;
  recurrence?: Recurrence;
  isPayday?: boolean;
  source?: "shiftsync" | "google";
  externalUrl?: string;
}

export type Recurrence =
  | { kind: "none" }
  | { kind: "daily" }
  | { kind: "weekly" }
  | { kind: "fortnightly" }
  | { kind: "custom"; days: number[] }; // 0=Sun..6=Sat