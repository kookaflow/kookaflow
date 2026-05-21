import { format } from "date-fns";

export function DateHero({ date }: { date: Date }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {format(date, "EEEE")}
      </span>
      <span className="text-3xl font-bold tracking-tight">{format(date, "MMM d")}</span>
      <span className="text-xs text-muted-foreground">{format(date, "yyyy")}</span>
    </div>
  );
}