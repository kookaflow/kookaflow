import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const PATTERNS = [
  { id: "rotating", label: "Rotating", desc: "Mix of morning, afternoon and night" },
  { id: "fixed_morning", label: "Fixed Morning", desc: "Mostly morning shifts" },
  { id: "fixed_afternoon", label: "Fixed Afternoon", desc: "Mostly afternoon shifts" },
  { id: "fixed_night", label: "Fixed Night", desc: "Mostly night shifts" },
] as const;

export function ShiftPatternSection() {
  const [userId, setUserId] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string>("rotating");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("shift_pattern")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.shift_pattern) setPattern(profile.shift_pattern);
    })();
  }, []);

  async function choose(id: string) {
    setPattern(id);
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ shift_pattern: id })
      .eq("id", userId);
    if (error) toast.error(error.message);
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-4 text-primary" /> Shift Pattern
        </CardTitle>
        <CardDescription>How your work week usually looks.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {PATTERNS.map((p) => {
          const active = pattern === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent/40",
              )}
            >
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              {active && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}