import { cn } from "@/lib/utils";
import { getCategory } from "@/lib/categories";
import type { CategoryId } from "@/types/event";

export function CategoryBadge({ category, className }: { category: CategoryId; className?: string }) {
  const c = getCategory(category);
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        c.bgClass,
        c.fgClass,
        className,
      )}
    >
      <Icon className="size-[18px]" />
      {c.label}
    </span>
  );
}