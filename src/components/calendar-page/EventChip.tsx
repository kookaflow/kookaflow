import { useLayoutEffect, useRef, useState } from "react";
import { fitLabel, labelCandidates } from "@/lib/calendarAgenda";

let ctx: CanvasRenderingContext2D | null = null;
function measurer(el: HTMLElement) {
  if (typeof document === "undefined") return null;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.font = `400 11px ${getComputedStyle(el).fontFamily || "sans-serif"}`;
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = "-0.3px"; } catch { /* older engines */ }
  return (t: string) => ctx!.measureText(t).width;
}

interface Props { title: string; time: string | null; colour: string }

/** One-line light month chip for personal/Google events: dot, time, width-fitted title. Never solid. */
export function EventChip({ title, time, colour }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const [box, setBox] = useState(0);
  // Very narrow cells (small phones): the time would leave no room for the title, so drop it.
  const showTime = !!time && (box === 0 || box >= 64);
  const candidates = labelCandidates(title || "Event");
  let label = candidates[candidates.length - 1];
  if (ref.current && width > 0) {
    const m = measurer(ref.current);
    if (m) label = fitLabel(candidates, (t) => m(t) <= width);
  }
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bx = boxRef.current;
    const update = () => { setWidth(el.clientWidth); if (bx) setBox(bx.clientWidth); };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (bx) ro.observe(bx);
    update();
    return () => ro.disconnect();
  }, []);

  return (
    <span
      ref={boxRef}
      className="flex w-full min-w-0 items-center gap-0.5 rounded-[3px] border px-0.5 text-[11px] leading-[1.3] tracking-[-0.3px] text-foreground"
      style={{ backgroundColor: `color-mix(in oklab, ${colour} 14%, transparent)`, borderColor: `color-mix(in oklab, ${colour} 45%, transparent)` }}
      title={time ? `${time} ${title}` : title}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: colour }} aria-hidden="true" />
      {showTime && <span className="shrink-0 tabular-nums text-muted-foreground">{time}</span>}
      <span ref={ref} className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap">{label}</span>
    </span>
  );
}
