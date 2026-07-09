import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SignOutSection() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 text-sm font-medium text-destructive/80 transition-colors hover:text-destructive"
      >
        <LogOut className="size-4" />
        Sign Out
      </button>
    </div>
  );
}
