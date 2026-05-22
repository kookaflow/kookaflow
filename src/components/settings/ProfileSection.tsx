import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { UserCircle2 } from "lucide-react";

const CURRENCIES = ["AUD", "USD", "GBP", "EUR", "NZD"] as const;

export function ProfileSection() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [currency, setCurrency] = useState<string>("AUD");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      const [{ data: profile }, { data: prefs }] = await Promise.all([
        supabase.from("profiles").select("full_name,job_role").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_preferences").select("hourly_rate,currency").eq("user_id", data.user.id).maybeSingle(),
      ]);
      setFullName(profile?.full_name ?? "");
      setJobRole(profile?.job_role ?? "");
      setHourlyRate(prefs?.hourly_rate != null ? String(prefs.hourly_rate) : "");
      setCurrency(prefs?.currency ?? "AUD");
    })();
  }, []);

  async function save() {
    if (!userId) return;
    setSaving(true);
    try {
      const rateNum = hourlyRate === "" ? null : Number(hourlyRate);
      if (rateNum !== null && (Number.isNaN(rateNum) || rateNum < 0)) {
        toast.error("Hourly rate must be a positive number");
        return;
      }
      const [{ error: pErr }, { error: prefErr }] = await Promise.all([
        supabase
          .from("profiles")
          .update({ full_name: fullName || null, job_role: jobRole || null })
          .eq("id", userId),
        supabase
          .from("user_preferences")
          .update({ hourly_rate: rateNum, currency: currency as never })
          .eq("user_id", userId),
      ]);
      if (pErr) throw pErr;
      if (prefErr) throw prefErr;
      toast.success("Profile saved");
    } catch (e) {
      toast.error((e as Error).message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle2 className="size-4 text-primary" /> Profile
        </CardTitle>
        <CardDescription>Your personal details and pay defaults.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} readOnly disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job_role">Job role</Label>
          <Input id="job_role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g. Nurse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rate">Hourly rate</Label>
            <Input
              id="rate"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}