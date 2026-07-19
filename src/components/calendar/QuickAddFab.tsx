import { Plus, Zap, X } from "lucide-react";
import { useStamp } from "@/providers/StampProvider";
import { cn } from "@/lib/utils";

export function QuickAddFab() {
  const { panelOpen, setPanelOpen, setSelected } = useStamp();
  return (
    <button
      type="button"
      onClick={() => {
        if (panelOpen) setSelected(null);
        setPanelOpen(!panelOpen);
      }}
      aria-label="Quick add"
      className={cn(
        "fixed z-50 flex size-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105",
        "bg-gradient-to-br from-primary to-primary/80",
        // Sit above the mobile bottom nav (~64px + safe-area); revert on md+.
        "bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-5",
      )}
      style={{
        right: "max(16px, env(safe-area-inset-right))",
      }}
    >
      {panelOpen ? (
        <X className="size-6" />
      ) : (
        <span className="relative">
          <Plus className="size-6" />
          <Zap className="absolute -bottom-1 -right-1.5 size-3.5 fill-yellow-300 text-yellow-300" />
        </span>
      )}
    </button>
  );
}