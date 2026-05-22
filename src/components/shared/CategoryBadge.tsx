import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/shiftConfig";
import type { CategoryId } from "@/types/event";

export function CategoryBadge({ category, className }: { category: CategoryId; className?: string }) {
  const c = getCategoryConfig(category);
  const Icon = c.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white",
        className,
      )}
      style={{ backgroundColor: c.colour }}
    >
      <Icon className="size-[18px]" />
      {c.label}
    </span>
  );
}