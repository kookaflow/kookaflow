import { CATEGORIES } from "@/lib/categories";
import type { CategoryBreakdown } from "@/lib/selectors";

export function WeeklyTotalsList({ breakdown }: { breakdown: CategoryBreakdown }) {
  const total = breakdown.totalHours || 1;
  return (
    <ul className="flex flex-col gap-2">
      {CATEGORIES.map((c) => {
        const hours = breakdown.totals[c.id];
        const pct = (hours / total) * 100;
        const Icon = c.icon;
        return (
          <li key={c.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Icon className={`size-3.5 ${c.textClass}`} />
                {c.label}
              </span>
              <span className="text-muted-foreground">{hours.toFixed(1)}h</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${c.bgClass}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}