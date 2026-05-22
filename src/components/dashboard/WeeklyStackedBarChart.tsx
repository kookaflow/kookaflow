import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CATEGORY_LIST } from "@/lib/shiftConfig";
import type { WeekDayBucket } from "./lib/metrics";

export function WeeklyStackedBarChart({ data }: { data: WeekDayBucket[] }) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Hours this week
        </h2>
        <span className="text-xs text-muted-foreground">
          Stacked by life category
        </span>
      </div>
      <div className="h-64 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.3 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => [`${v.toFixed(1)}h`, name]}
            />
            {CATEGORY_LIST.map((c, i) => (
              <Bar
                key={c.id}
                dataKey={c.id}
                name={c.label}
                stackId="a"
                fill={c.colour}
                radius={i === CATEGORY_LIST.length - 1 ? [6, 6, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        {CATEGORY_LIST.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: c.colour }} />
            <span className="text-muted-foreground">{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}