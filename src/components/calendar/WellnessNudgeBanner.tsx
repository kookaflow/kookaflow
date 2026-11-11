import { useState } from "react";
import { X } from "lucide-react";
import type { MockEvent } from "@/components/calendar-page/constants";
import type { CategoryId } from "@/types/event";
import {
  useCalendarNudges,
  dismissNudge,
  type NudgeId,
} from "@/hooks/useCalendarNudges";

interface Props {
  events: MockEvent[];
  anchor?: Date;
  onAction: (category: CategoryId) => void;
}


export function WellnessNudgeBanner({ events, anchor, onAction }: Props) {
  const [dismissedTick, setDismissedTick] = useState(0);
  const nudge = useCalendarNudges(events, anchor, dismissedTick);

  if (!nudge) return null;

  const handleDismiss = (id: NudgeId) => {
    dismissNudge(id);
    setDismissedTick((t) => t + 1);
  };

  const handleAction = () => {
    onAction(nudge.category);
    handleDismiss(nudge.id);
  };

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 border-b border-border px-3 py-1.5 text-xs sm:px-5 animate-in fade-in duration-200">
      <span className="size-2 shrink-0 rounded-full" style={{ background: nudge.colour }} aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate text-foreground" title={nudge.message}>{nudge.message}</p>
      <button type="button" onClick={handleAction} className="shrink-0 font-semibold text-primary hover:underline">
        {nudge.buttonLabel}
      </button>
      <button
        type="button"
        onClick={() => handleDismiss(nudge.id)}
        aria-label="Dismiss nudge"
        className="-mr-2 flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
