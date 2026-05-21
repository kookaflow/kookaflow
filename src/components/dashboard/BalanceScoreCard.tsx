import type { BalanceScore } from "./lib/metrics";
import { cn } from "@/lib/utils";

export function BalanceScoreCard({ data }: { data: BalanceScore }) {
  const score = data.score ?? 0;
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const ringColor =
    data.score === null
      ? "var(--muted-foreground)"
      : score < 40
        ? "#EF4444"
        : score < 70
          ? "#F59E0B"
          : score < 90
            ? "#10B981"
            : "#3B82F6";

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Balance Score
        </h2>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            data.band === "In flow" && "bg-primary/15 text-primary",
            data.band === "Balanced" && "bg-emerald-500/15 text-emerald-500",
            data.band === "Tilting" && "bg-amber-500/15 text-amber-500",
            data.band === "Skewed" && "bg-destructive/15 text-destructive",
            data.band === "Insufficient" && "bg-muted text-muted-foreground",
          )}
        >
          {data.band}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-5">
        <div className="relative size-32 shrink-0">
          <svg viewBox="0 0 140 140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="var(--border)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={ringColor}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 600ms ease, stroke 400ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">
              {data.score === null ? "—" : data.score}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              /100
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{data.copy}</p>
      </div>
    </div>
  );
}