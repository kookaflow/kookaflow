import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What is being deleted, e.g. "this shift" or "Morning Shift". */
  itemLabel: string;
  /** Called when the user confirms deletion. */
  onConfirm: () => void;
  /** Optional extra warning line. */
  warning?: string;
  busy?: boolean;
}

/**
 * Shared "Are you sure?" prompt shown before any destructive delete.
 * Prevents accidental data loss across events, shift templates, etc.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemLabel,
  onConfirm,
  warning,
  busy = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {itemLabel}? This action cannot be undone.
            {warning ? <span className="mt-1 block">{warning}</span> : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
