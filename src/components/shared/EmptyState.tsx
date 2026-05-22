import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  illustration: ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({
  illustration,
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 py-12 text-center animate-in fade-in duration-300">
      <div className="w-48 max-w-full">{illustration}</div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        onClick={onAction}
        className="min-h-11 px-5"
      >
        {actionLabel}
      </Button>
    </div>
  );
}