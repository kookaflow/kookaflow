export function TimeGutter({ hourHeight }: { hourHeight: number }) {
  return (
    <div className="relative w-14 shrink-0 border-r border-border">
      {Array.from({ length: 24 }).map((_, h) => (
        <div
          key={h}
          style={{ height: hourHeight }}
          className="relative pr-2 text-right text-[10px] text-muted-foreground"
        >
          <span className="absolute -top-1.5 right-2">
            {h.toString().padStart(2, "0")}:00
          </span>
        </div>
      ))}
    </div>
  );
}