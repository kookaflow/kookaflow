import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

function initials(name?: string | null, email?: string | null) {
  const src = (name ?? email ?? "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function AccountSection() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setName(profile?.full_name ?? null);
    })();
  }, []);

  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Account
      </h2>
      <Card className="p-0 overflow-hidden">
        <Link
          to="/settings"
          className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">
            {initials(name, email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {name ?? "Add your name"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {email ?? "—"}
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <div className="mx-4 h-px bg-border" />
        <div className="flex items-center gap-3 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Subscription</p>
            <p className="text-xs text-muted-foreground">You're on the Free plan</p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            Free
          </span>
        </div>
      </Card>
    </section>
  );
}