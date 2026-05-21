import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryTotal } from "./lib/metrics";

interface Props {
  totals: CategoryTotal[];
  totalHours: number;
}

export function MonthlyDonutChart({ totals, totalHours }: Props) {
  const visible = totals.filter((t) => t.hours > 0);

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          This month
        </h2>
        <span className="text-xs text-muted-foreground">By category</span>
      </div>
      <div className="relative h-56 flex-1">
        {visible.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visible}
                dataKey="hours"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={2}
                stroke="none"
                isAnimationActive
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {visible.map((d) => (
                  <Cell key={d.category} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v.toFixed(1)}h`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No events this month yet.
          </div>
        )}
        {visible.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">
              {totalHours.toFixed(0)}h
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              total
            </span>
          </div>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        {totals.map((t) => (
          <li key={t.category} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="text-muted-foreground">{t.label}</span>
            <span className="ml-auto font-medium tabular-nums">{t.hours}h</span>
          </li>
        ))}
      </ul>
    </div>
  );
}