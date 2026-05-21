import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarHeart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — ShiftSync" }] }),
  component: OnboardingPage,
});

const JOB_ROLES = ["Nurse", "Paramedic", "Doctor", "Factory Worker", "Security Officer", "Retail Worker", "Hospitality Staff", "Transport Worker", "Teacher", "Other"];
const SHIFT_PATTERNS = [
  { id: "rotating", label: "Rotating", desc: "Mix of morning, afternoon and night" },
  { id: "fixed_morning", label: "Fixed Morning", desc: "Mostly morning shifts" },
  { id: "fixed_afternoon", label: "Fixed Afternoon", desc: "Mostly afternoon shifts" },
  { id: "fixed_night", label: "Fixed Night", desc: "Mostly night shifts" },
];
const THEMES = [
  { id: "slate", label: "Slate", swatch: "from-slate-500 to-slate-700" },
  { id: "midnight", label: "Midnight", swatch: "from-indigo-900 to-purple-700" },
  { id: "lavender", label: "Lavender", swatch: "from-purple-400 to-pink-400" },
  { id: "forest", label: "Forest", swatch: "from-emerald-600 to-green-800" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [shiftPattern, setShiftPattern] = useState("rotating");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [theme, setTheme] = useState("slate");
  const [saving, setSaving] = useState(false);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSaving(false);
      return navigate({ to: "/login" });
    }
    const userId = u.user.id;
    const [p1, p2] = await Promise.all([
      supabase.from("profiles").update({
        full_name: fullName || null,
        job_role: jobRole || null,
        shift_pattern: shiftPattern,
        onboarded_at: new Date().toISOString(),
      }).eq("id", userId),
      supabase.from("user_preferences").update({
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        currency,
        theme,
      }).eq("user_id", userId),
    ]);
    setSaving(false);
    if (p1.error || p2.error) {
      toast.error(p1.error?.message ?? p2.error?.message ?? "Failed to save");
      return;
    }
    toast.success("All set!");
    navigate({ to: "/calendar" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow">
            <CalendarHeart className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to ShiftSync</h1>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={cn("h-1.5 w-8 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">What's your name?</h2>
                <p className="text-sm text-muted-foreground">We'll use this to personalise your dashboard.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">What do you do?</h2>
                <p className="text-sm text-muted-foreground">Pick a role or type your own.</p>
              </div>
              <Input value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Your role" />
              <div className="flex flex-wrap gap-1.5">
                {JOB_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setJobRole(r)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      jobRole === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Your shift pattern</h2>
                <p className="text-sm text-muted-foreground">We can change this later.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SHIFT_PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setShiftPattern(p.id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition",
                      shiftPattern === p.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{p.label}</span>
                      {shiftPattern === p.id && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Default hourly rate</h2>
                <p className="text-sm text-muted-foreground">For tracking earnings. You can skip this.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5">
                  <Label>Rate</Label>
                  <Input type="number" step="0.01" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="42.50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["AUD", "USD", "GBP", "EUR", "NZD"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Pick a theme</h2>
                <p className="text-sm text-muted-foreground">You can change this in Settings any time.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "overflow-hidden rounded-xl border transition",
                      theme === t.id ? "border-primary ring-2 ring-primary/30" : "border-border",
                    )}
                  >
                    <div className={cn("h-16 bg-gradient-to-br", t.swatch)} />
                    <div className="flex items-center justify-between p-2">
                      <span className="text-xs font-semibold">{t.label}</span>
                      {theme === t.id && <Check className="size-3 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-2">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0 || saving}>Back</Button>
            {step < 4 ? (
              <Button type="button" onClick={next}>Next</Button>
            ) : (
              <Button type="button" onClick={finish} disabled={saving}>
                {saving ? "Saving…" : "Finish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}