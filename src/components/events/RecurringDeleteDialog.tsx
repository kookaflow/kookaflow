import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RecurringDeleteMode = "single" | "future" | "all";

const OPTIONS: { mode: RecurringDeleteMode; label: string; hint: string }[] = [
  {
    mode: "single",
    label: "This event only",
    hint: "Removes just this one occurrence.",
  },
  {
    mode: "future",
    label: "This and future events",
    hint: "Removes this occurrence and every one after it.",
  },
  {
    mode: "all",
    label: "All events in the series",
    hint: "Removes the entire recurring series.",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemLabel: string;
  onConfirm: (mode: RecurringDeleteMode) => void;
  busy?: boolean;
}

/**
 * Standard recurring-event delete picker (Google/Apple/Outlook pattern):
 * one occurrence, this-and-future, or the whole series.
 */
export function RecurringDeleteDialog({
  open,
  onOpenChange,
  itemLabel,
  onConfirm,
  busy = false,
}: Props) {
  const [mode, setMode] = useState<RecurringDeleteMode>("single");
  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {itemLabel}?</DialogTitle>
          <DialogDescription>
            This is a recurring event. Choose what to remove — this can't be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Delete scope">
          {OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={mode === opt.mode}
              disabled={busy}
              onClick={() => setMode(opt.mode)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left transition-colors",
                mode === opt.mode
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent/50",
              )}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(mode)}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
