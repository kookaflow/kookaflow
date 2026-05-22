import { useState } from "react";
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

function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    <div className="px-5 pt-2 animate-in slide-in-from-top-2 duration-200">
      <div
        className="flex items-start justify-between gap-3"
        style={{
          background: hexAlpha(nudge.colour, 0.12),
          borderLeft: `3px solid ${nudge.colour}`,
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 8,
        }}
      >
        <p
          className="text-foreground"
          style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.4 }}
        >
          {nudge.message}
        </p>
        <div className="flex flex-col items-end shrink-0">
          <button
            type="button"
            onClick={handleAction}
            className="font-bold text-white"
            style={{
              background: nudge.colour,
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 20,
              marginBottom: 4,
            }}
          >
            {nudge.buttonLabel}
          </button>
          <button
            type="button"
            onClick={() => handleDismiss(nudge.id)}
            aria-label="Dismiss nudge"
            className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
            style={{ fontSize: 11, minHeight: 44, minWidth: 44 }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}