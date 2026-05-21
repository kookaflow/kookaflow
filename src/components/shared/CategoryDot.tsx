import { cn } from "@/lib/utils";
import { getCategory } from "@/lib/categories";
import type { CategoryId } from "@/types/event";

export function CategoryDot({ category, className }: { category: CategoryId; className?: string }) {
  const c = getCategory(category);
  return <span className={cn("inline-block size-2.5 rounded-full", c.dotClass, className)} />;
}