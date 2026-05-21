import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { CATEGORY_MAP } from "@/components/calendar-page/constants";
import type { CategoryCardData } from "./lib/metrics";
import { cn } from "@/lib/utils";

export function CategoryCard({ data }: { data: CategoryCardData }) {
  const def = CATEGORY_MAP[data.category];
  const Icon = def.icon;
  const TrendIcon =
    data.trend === "up" ? ArrowUpRight : data.trend === "down" ? ArrowDownRight : Minus;

  const max = Math.max(0.5, ...data.sparkline);

  return (
    <div
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 pl-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeft: `4px solid ${def.color}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex size-9 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: def.color }}
          >
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-semibold">{def.label}</span>
        </div>
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            data.trend === "up" && "bg-emerald-500/15 text-emerald-500",
            data.trend === "down" && "bg-destructive/15 text-destructive",
            data.trend === "flat" && "bg-muted text-muted-foreground",
          )}
        >
          <TrendIcon className="size-3" />
          {data.trend === "flat" ? "0%" : `${Math.abs(data.deltaPct)}%`}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums">{data.hours}</span>
        <span className="text-xs text-muted-foreground">h this week</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {data.pctOfWaking.toFixed(0)}% of waking hours
      </p>
      <div className="flex h-8 items-end gap-1">
        {data.sparkline.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${Math.max(4, (v / max) * 100)}%`,
              backgroundColor: def.color,
              opacity: v > 0 ? 0.85 : 0.2,
            }}
            title={`${v.toFixed(1)}h`}
          />
        ))}
      </div>
    </div>
  );
}