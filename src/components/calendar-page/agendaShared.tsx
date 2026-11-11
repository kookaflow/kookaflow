import { format } from "date-fns";
import { getCategoryConfig, getShiftConfig, ensureReadableBadgeColour, badgeTextColour } from "@/lib/shiftConfig";
import { GOOGLE_DEFAULT_COLOR } from "@/lib/googleColors";
import { durationHours, formatHours, isOvernight, isShift, isTimed, isWorkedShift, shiftInitials } from "@/lib/calendarAgenda";
import type { MockEvent } from "./constants";
import { cn } from "@/lib/utils";

export interface Earnings {
  /** null = user's plan doesn't include earnings, or no hourly rate set */
  rate: number | null;
  currency: string;
}

export function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

export function itemName(e: MockEvent): string {
  const cfg = e.shiftType ? getShiftConfig(e.shiftType) : null;
  if (cfg && (!e.title || e.title.toLowerCase() === cfg.label.toLowerCase())) return `${cfg.label} shift`;
  return e.title || cfg?.label || "Untitled";
}

export function itemColour(e: MockEvent): string {
  if (e.source === "google") return e.googleColor ?? GOOGLE_DEFAULT_COLOR;
  const cfg = e.shiftType ? getShiftConfig(e.shiftType) : null;
  const cat = getCategoryConfig(e.category);
  return ensureReadableBadgeColour(e.iconColor ?? cfg?.colour, cfg?.colour ?? cat.colour);
}

export function ShiftBadge({ event, size = "md" }: { event: MockEvent; size?: "sm" | "md" }) {
  const bg = itemColour(event);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-bold leading-none tracking-tight",
        size === "sm" ? "h-4 min-w-[18px] px-0.5 text-[9px]" : "h-6 min-w-[28px] px-1 text-[11px]",
      )}
      style={{ backgroundColor: bg, color: badgeTextColour(bg) }}
      aria-hidden="true"
    >
      {shiftInitials(itemName(event))}
    </span>
  );
}

export function EventDot({ event, className }: { event: MockEvent; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: itemColour(event) }}
      aria-hidden="true"
    />
  );
}

export function timeLabel(e: MockEvent): string {
  return isTimed(e) ? format(e.start, "HH:mm") : "All day";
}

export function overnightSuffix(e: MockEvent): string | null {
  return isOvernight(e) ? `→ ${format(e.end, "HH:mm")} next day` : null;
}

export function durationLabel(e: MockEvent): string | null {
  return isTimed(e) ? formatHours(durationHours(e)) : null;
}

export function payFor(e: MockEvent, earn: Earnings): string | null {
  if (earn.rate == null || !isWorkedShift(e)) return null;
  return formatMoney(durationHours(e) * earn.rate, earn.currency);
}

export { isShift };

export function PeriodFooter({ label, hours, earnings, currency }: { label: string; hours: number; earnings: number | null; currency: string }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card/60 px-4 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">
        {formatHours(hours)} worked
        {earnings != null && <span className="text-muted-foreground"> · est. {formatMoney(earnings, currency)}</span>}
      </span>
    </div>
  );
}
