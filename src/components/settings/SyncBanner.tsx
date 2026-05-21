import { useSyncStatus } from "@/providers/SyncStatusProvider";
import { Loader2 } from "lucide-react";

export function SyncBanner() {
  const { isSyncing } = useSyncStatus();
  if (!isSyncing) return null;
  return (
    <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground backdrop-blur">
      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
      <span>
        Syncing your calendar — this may take a few minutes depending on how many events you have ☕
      </span>
    </div>
  );
}
