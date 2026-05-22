import { CATEGORY_LIST } from "@/lib/shiftConfig";
import type { CategoryBreakdown } from "@/lib/selectors";

export function CategoryBreakdownMini({ breakdown }: { breakdown: CategoryBreakdown }) {
  const total = breakdown.totalHours || 1;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {CATEGORY_LIST.map((c) => {
          const pct = (breakdown.totals[c.id] / total) * 100;
          if (pct <= 0) return null;
          return <div key={c.id} style={{ width: `${pct}%`, backgroundColor: c.colour }} />;
        })}
      </div>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        {CATEGORY_LIST.map((c) => {
          const hours = breakdown.totals[c.id];
          if (hours <= 0) return null;
          return (
            <li key={c.id} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: c.colour }} />
              <span className="text-muted-foreground">{c.label.split(" ")[0]}</span>
              <span className="ml-auto font-medium">{hours.toFixed(1)}h</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}