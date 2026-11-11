import { useLayoutEffect, useRef, useState } from "react";
import { badgeTextColour } from "@/lib/shiftConfig";
import { fitLabel, labelCandidates } from "@/lib/calendarAgenda";
import { cn } from "@/lib/utils";

const FONT = "500 11px";
let ctx: CanvasRenderingContext2D | null = null;
function measurer(el: HTMLElement) {
  if (typeof document === "undefined") return null;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  const family = getComputedStyle(el).fontFamily || "sans-serif";
  ctx.font = `${FONT} ${family}`;
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = "-0.3px"; } catch { /* older engines */ }
  return (t: string) => ctx!.measureText(t).width;
}

interface Props {
  name: string;
  siblingNames: string[];
  override?: string | null;
  time: string;
  colour: string;
  className?: string;
}

/** Two-line month chip: width-fitted short label + start time, in the shift colour. */
export function ShiftChip({ name, siblingNames, override, time, colour, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const candidates = override ? [override] : labelCandidates(name, siblingNames);
  let label = candidates[candidates.length - 1];
  if (ref.current && width > 0) {
    const m = measurer(ref.current);
    if (m) label = fitLabel(candidates, (t) => m(t) <= width);
  }

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return (
    <span
      className={cn("flex w-full min-w-0 flex-col rounded-[3px] px-0.5 py-px text-[11px] leading-[1.15] tracking-[-0.3px]", className)}
      style={{ backgroundColor: colour, color: badgeTextColour(colour) }}
      title={name}
    >
      <span ref={ref} className="block w-full overflow-hidden whitespace-nowrap font-medium">{label}</span>
      <span className="block whitespace-nowrap tabular-nums opacity-90">{time}</span>
    </span>
  );
}
