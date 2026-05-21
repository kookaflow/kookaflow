import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, Info, Heart } from "lucide-react";
import type { Nudge } from "./lib/nudges";
import { cn } from "@/lib/utils";

export function WellnessNudgePanel({ nudges }: { nudges: Nudge[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || nudges.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % nudges.length), 8000);
    return () => clearInterval(t);
  }, [paused, nudges.length]);

  useEffect(() => {
    if (idx >= nudges.length) setIdx(0);
  }, [nudges.length, idx]);

  const n = nudges[idx];
  if (!n) return null;

  const Icon =
    n.tone === "warning" ? AlertTriangle : n.tone === "info" ? Info : Heart;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/40 p-5"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Wellness nudge
        </h2>
      </div>

      <div key={n.id} className="flex flex-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            n.tone === "warning" && "bg-destructive/15 text-destructive",
            n.tone === "info" && "bg-primary/15 text-primary",
            n.tone === "affirm" && "bg-emerald-500/15 text-emerald-500",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-foreground">{n.message}</p>
          <p className="text-[11px] italic text-muted-foreground">— {n.source}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {nudges.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Show tip ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}