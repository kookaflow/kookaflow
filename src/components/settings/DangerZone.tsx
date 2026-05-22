import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Trash2, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

export function DangerZone() {
  const navigate = useNavigate();
  const runDelete = useServerFn(deleteAccount);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const mut = useMutation({
    mutationFn: () => runDelete(),
    onSuccess: async () => {
      await supabase.auth.signOut();
      toast.success("Your account has been permanently deleted.");
      navigate({ to: "/login" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not delete account");
    },
  });

  const canDelete = confirmText.trim() === "DELETE" && !mut.isPending;

  return (
    <section className="mb-10">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-destructive">
        Danger Zone
      </h2>
      <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertOctagon size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Delete Account</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This permanently deletes your account and all your data including shifts,
              events, and preferences. This cannot be undone.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setConfirmText("");
                setOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete My Account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => !mut.isPending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-foreground/90">
              This will permanently delete:
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✗ All your shifts and events</li>
            <li>✗ Your life balance history</li>
            <li>✗ Your preferences and settings</li>
            <li>✗ Your account</li>
          </ul>
          <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
          <div className="space-y-2">
            <label htmlFor="confirm-delete" className="text-xs font-medium text-foreground">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              disabled={mut.isPending}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={mut.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canDelete}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Deleting…" : "Permanently Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}