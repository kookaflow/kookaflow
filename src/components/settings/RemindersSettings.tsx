import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Mail, Smartphone, Check } from "lucide-react";
import OneSignal from "react-onesignal";
import { useServerFn } from "@tanstack/react-start";
import { getPushStatus, updatePushPrefs } from "@/lib/push.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Channel = "email" | "push" | "both";
type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const WEEK_DAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHANNELS: { value: Channel; label: string; icon: React.ReactNode }[] = [
  { value: "email", label: "Email", icon: <Mail className="size-3.5" /> },
  { value: "push", label: "Push Notifications", icon: <Bell className="size-3.5" /> },
  { value: "both", label: "Both", icon: <Smartphone className="size-3.5" /> },
];

function ChannelSelector({
  value,
  onChange,
}: {
  value: Channel;
  onChange: (v: Channel) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHANNELS.map((ch) => (
        <button
          key={ch.value}
          type="button"
          onClick={() => onChange(ch.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
            value === ch.value
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-input bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground"
          )}
        >
          {ch.icon}
          {ch.label}
        </button>
      ))}
    </div>
  );
}

function DaySelector({
  selected,
  onChange,
}: {
  selected: WeekDay[];
  onChange: (days: WeekDay[]) => void;
}) {
  const toggle = useCallback(
    (day: WeekDay) => {
      onChange(
        selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]
      );
    },
    [selected, onChange]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {WEEK_DAYS.map((day) => {
        const isSelected = selected.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition-all",
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-input bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            )}
            aria-pressed={isSelected}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-auto pr-2"
      />
    </div>
  );
}

export function RemindersSettings() {
  // Daily reminder state
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyTime, setDailyTime] = useState("08:00");
  const [dailyChannel, setDailyChannel] = useState<Channel>("email");
  const [dailyEmail, setDailyEmail] = useState("");

  // Weekly reminder state
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState<WeekDay[]>(["Sun"]);
  const [weeklyTime, setWeeklyTime] = useState("18:00");
  const [weeklyChannel, setWeeklyChannel] = useState<Channel>("email");
  const [weeklyEmail, setWeeklyEmail] = useState("");

  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const showDailyEmail = dailyChannel === "email" || dailyChannel === "both";
  const showWeeklyEmail = weeklyChannel === "email" || weeklyChannel === "both";

  const sampleDailyMessage = `Good morning! Here's your day at a glance:

• Work: 8h shift (07:00–15:00)
• Rest: 7h sleep planned
• Exercise: 1h gym session
• Family: dinner at 18:00

Balance score yesterday: 72/100

Take a breath—you've got this.`;

  return (
    <div className="flex flex-col gap-6">
      <NotificationStatusCard />

      {/* Daily Reminder */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Daily Reminder</CardTitle>
                <CardDescription>Get a summary of your day every morning</CardDescription>
              </div>
            </div>
            <Switch checked={dailyEnabled} onCheckedChange={setDailyEnabled} />
          </div>
        </CardHeader>
        {dailyEnabled && (
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker value={dailyTime} onChange={setDailyTime} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Channel</Label>
              <ChannelSelector value={dailyChannel} onChange={setDailyChannel} />
            </div>

            {showDailyEmail && (
              <div className="space-y-2">
                <Label htmlFor="daily-email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="daily-email"
                  type="email"
                  placeholder="you@example.com"
                  value={dailyEmail}
                  onChange={(e) => setDailyEmail(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Weekly Reminder */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Weekly Reminder</CardTitle>
                <CardDescription>Review your week and plan ahead</CardDescription>
              </div>
            </div>
            <Switch checked={weeklyEnabled} onCheckedChange={setWeeklyEnabled} />
          </div>
        </CardHeader>
        {weeklyEnabled && (
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Day(s)</Label>
              <DaySelector selected={weeklyDays} onChange={setWeeklyDays} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker value={weeklyTime} onChange={setWeeklyTime} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Channel</Label>
              <ChannelSelector value={weeklyChannel} onChange={setWeeklyChannel} />
            </div>

            {showWeeklyEmail && (
              <div className="space-y-2">
                <Label htmlFor="weekly-email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="weekly-email"
                  type="email"
                  placeholder="you@example.com"
                  value={weeklyEmail}
                  onChange={(e) => setWeeklyEmail(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <ShiftAlertsCard />

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>A sample of what your daily reminder will look like</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
              {sampleDailyMessage}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className={cn("min-w-[140px] transition-all", saved && "bg-green-600 hover:bg-green-700")}>
          {saved ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}

function usePermissionState() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "default",
  );
  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
    const id = window.setInterval(() => setPerm(Notification.permission), 1500);
    return () => window.clearInterval(id);
  }, []);
  return perm;
}

function NotificationStatusCard() {
  const perm = usePermissionState();
  const enable = async () => {
    try {
      await OneSignal.Notifications.requestPermission();
    } catch (e) {
      console.error(e);
    }
  };

  if (perm === "granted") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <span className="inline-block size-2 rounded-full bg-emerald-500" />
        <span className="text-sm text-foreground">
          🔔 Push notifications are active on this device
        </span>
      </div>
    );
  }
  if (perm === "denied") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <span className="inline-block size-2 rounded-full bg-amber-500" />
        <span className="text-sm text-foreground">
          Notifications blocked — enable in your browser settings
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="inline-block size-2 rounded-full bg-muted-foreground/50" />
        <span className="text-sm text-foreground">🔕 Push notifications are off</span>
      </div>
      <Button size="sm" onClick={enable} disabled={perm === "unsupported"}>
        Enable notifications
      </Button>
    </div>
  );
}

function ShiftAlertsCard() {
  const perm = usePermissionState();
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getPushStatus);
  const persist = useServerFn(updatePushPrefs);

  const { data: status } = useQuery({
    queryKey: ["push-status"],
    queryFn: () => fetchStatus(),
  });

  const mut = useMutation({
    mutationFn: (v: boolean) =>
      persist({ data: { push_shift_alerts: v } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["push-status"] }),
  });

  if (perm !== "granted") return null;
  const enabled = status?.push_shift_alerts ?? true;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BellOff className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Shift Alerts</CardTitle>
              <CardDescription>
                Get a push notification before each shift starts
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={enabled}
            disabled={mut.isPending}
            onCheckedChange={(v) => mut.mutate(v)}
          />
        </div>
      </CardHeader>
    </Card>
  );
}
