import { Link } from "@tanstack/react-router";
import { ChevronRight, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ShiftsLinkRow() {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Shifts
      </h2>
      <Card className="overflow-hidden p-0">
        <Link
          to="/shifts"
          className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Manage Shift Templates</p>
            <p className="text-xs text-muted-foreground">
              Create and edit your custom shift types
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Card>
    </section>
  );
}