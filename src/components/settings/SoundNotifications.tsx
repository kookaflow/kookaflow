import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume2, Play, Check, Waves, CloudRain, Trees } from "lucide-react";
import { updatePreferences } from "@/lib/preferences.functions";

type SoundId = "soft-chime" | "bell" | "nature" | "digital-ping" | "none";
type AmbientId = "off" | "rain" | "white-noise" | "forest";
type LeadMinutes = 5 | 10 | 15 | 30 | 60 | 120;
type ShiftAlertSoundId = "triple_chime" | "rising_alert" | "double_bell" | "gentle_pulse" | "none";

type Prefs = {
  masterEnabled: boolean;
  notificationSound: SoundId;
  eventAlertEnabled: boolean;
  eventAlertMinutes: LeadMinutes;
  shiftAlertEnabled: boolean;
  shiftAlertSound: ShiftAlertSoundId;
  ambient: AmbientId;
};

const STORAGE_KEY = "kookaflow.sound-prefs.v1";

const DEFAULT_PREFS: Prefs = {
  masterEnabled: true,
  notificationSound: "soft-chime",
  eventAlertEnabled: true,
  eventAlertMinutes: 10,
  shiftAlertEnabled: true,
  shiftAlertSound: "triple_chime",
  ambient: "off",
};

const SOUNDS: { value: SoundId; label: string }[] = [
  { value: "soft-chime", label: "Soft Chime" },
  { value: "bell", label: "Bell" },
  { value: "nature", label: "Nature (birds)" },
  { value: "digital-ping", label: "Digital Ping" },
  { value: "none", label: "None" },
];

const LEAD_OPTIONS: { value: LeadMinutes; label: string }[] = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
];

const SHIFT_ALERT_SOUNDS: { value: ShiftAlertSoundId; label: string }[] = [
  { value: "triple_chime", label: "Triple Chime (recommended)" },
  { value: "rising_alert", label: "Rising Alert" },
  { value: "double_bell", label: "Double Bell" },
  { value: "gentle_pulse", label: "Gentle Pulse" },
  { value: "none", label: "None" },
];

const AMBIENT_OPTIONS: { value: AmbientId; label: string; icon: React.ReactNode }[] = [
  { value: "off", label: "Off", icon: <Volume2 className="size-3.5" /> },
  { value: "rain", label: "Rain", icon: <CloudRain className="size-3.5" /> },
  { value: "white-noise", label: "White Noise", icon: <Waves className="size-3.5" /> },
  { value: "forest", label: "Forest", icon: <Trees className="size-3.5" /> },
];

// ---------- Audio engine ----------

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!sharedCtx) {
    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
    sharedCtx = new Ctor();
  }
  if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

function playTone(opts: {
  freq: number;
  type?: OscillatorType;
  duration?: number;
  startOffset?: number;
  gain?: number;
}) {
  const ctx = getCtx();
  const t0 = ctx.currentTime + (opts.startOffset ?? 0);
  const dur = opts.duration ?? 0.3;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  const peak = opts.gain ?? 0.18;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function playSound(id: SoundId) {
  if (id === "none") return;
  switch (id) {
    case "soft-chime":
      playTone({ freq: 880, type: "sine", duration: 0.45, gain: 0.15 });
      playTone({ freq: 1320, type: "sine", duration: 0.55, startOffset: 0.08, gain: 0.1 });
      break;
    case "bell":
      playTone({ freq: 660, type: "triangle", duration: 0.9, gain: 0.18 });
      playTone({ freq: 990, type: "sine", duration: 0.7, startOffset: 0.02, gain: 0.08 });
      break;
    case "nature": {
      // Bird-like chirps: quick frequency sweeps
      const ctx = getCtx();
      for (let i = 0; i < 3; i++) {
        const t0 = ctx.currentTime + i * 0.18;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1800, t0);
        osc.frequency.exponentialRampToValueAtTime(2600, t0 + 0.12);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      }
      break;
    }
    case "digital-ping":
      playTone({ freq: 1760, type: "square", duration: 0.12, gain: 0.1 });
      playTone({ freq: 2200, type: "square", duration: 0.12, startOffset: 0.1, gain: 0.08 });
      break;
  }
}

function playShiftAlertSound(id: ShiftAlertSoundId) {
  if (id === "none") return;
  const ctx = getCtx();
  switch (id) {
    case "triple_chime": {
      // Three ascending sine tones with brief gaps; gentle fade on last
      playTone({ freq: 440, type: "sine", duration: 0.3, startOffset: 0,    gain: 0.18 });
      playTone({ freq: 554, type: "sine", duration: 0.3, startOffset: 0.4,  gain: 0.18 });
      playTone({ freq: 659, type: "sine", duration: 0.5, startOffset: 0.8,  gain: 0.18 });
      break;
    }
    case "rising_alert": {
      const t0 = ctx.currentTime;
      const dur = 2.0;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, t0);
      osc.frequency.linearRampToValueAtTime(600, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
      break;
    }
    case "double_bell": {
      // Bell-like: sharp attack, slow exponential decay (triangle + sine partial)
      const ring = (offset: number) => {
        const t0 = ctx.currentTime + offset;
        const dur = 0.4;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(528, t0);
        osc2.frequency.setValueAtTime(1056, t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.005); // sharp attack
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc1.connect(g);
        osc2.connect(g);
        g.connect(ctx.destination);
        osc1.start(t0); osc2.start(t0);
        osc1.stop(t0 + dur + 0.05); osc2.stop(t0 + dur + 0.05);
      };
      ring(0);
      ring(0.6); // 0.4s bell + 0.2s gap
      break;
    }
    case "gentle_pulse": {
      for (let i = 0; i < 3; i++) {
        playTone({ freq: 392, type: "sine", duration: 0.2, startOffset: i * 0.3, gain: 0.1 });
      }
      break;
    }
  }
}

// ---------- Ambient engine ----------

type AmbientHandle = {
  stop: () => void;
};

function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function startAmbient(id: AmbientId): AmbientHandle | null {
  if (id === "off") return null;
  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.6);

  const nodes: { stop?: () => void; disconnect: () => void }[] = [];

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 2);
  noise.loop = true;

  if (id === "white-noise") {
    noise.connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop(), disconnect: () => noise.disconnect() });
  } else if (id === "rain") {
    // Filtered noise → rain-like hiss
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 600;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4000;
    noise.connect(hp).connect(lp).connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop(), disconnect: () => noise.disconnect() });
    nodes.push({ disconnect: () => hp.disconnect() });
    nodes.push({ disconnect: () => lp.disconnect() });
  } else if (id === "forest") {
    // Low rumble + filtered noise + intermittent bird chirps
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    const wind = ctx.createGain();
    wind.gain.value = 0.5;
    noise.connect(lp).connect(wind).connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop(), disconnect: () => noise.disconnect() });
    nodes.push({ disconnect: () => lp.disconnect() });
    nodes.push({ disconnect: () => wind.disconnect() });

    let stopped = false;
    const chirp = () => {
      if (stopped) return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1800 + Math.random() * 600, t0);
      osc.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 400, t0 + 0.1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      osc.connect(g).connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.18);
      setTimeout(chirp, 1500 + Math.random() * 3500);
    };
    setTimeout(chirp, 800);
    nodes.push({ disconnect: () => { stopped = true; } });
  }

  return {
    stop: () => {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      } catch {/* noop */}
      setTimeout(() => {
        nodes.forEach((n) => { try { n.stop?.(); } catch {/* noop */} });
        nodes.forEach((n) => { try { n.disconnect(); } catch {/* noop */} });
        try { master.disconnect(); } catch {/* noop */}
      }, 350);
    },
  };
}

// ---------- Component ----------

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function SoundNotifications() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const ambientRef = useRef<AmbientHandle | null>(null);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {/* noop */}
  }, [prefs, hydrated]);

  // Drive ambient playback off prefs
  useEffect(() => {
    if (!hydrated) return;
    ambientRef.current?.stop();
    ambientRef.current = null;
    if (prefs.masterEnabled && prefs.ambient !== "off") {
      ambientRef.current = startAmbient(prefs.ambient);
    }
    return () => {
      ambientRef.current?.stop();
      ambientRef.current = null;
    };
  }, [prefs.ambient, prefs.masterEnabled, hydrated]);

  const update = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [k]: v }));
  }, []);

  const handleSelectSound = (id: SoundId) => {
    update("notificationSound", id);
    if (prefs.masterEnabled) playSound(id);
  };

  const handleSave = async () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {/* noop */}
    try {
      await updatePreferences({
        data: {
          reminder_minutes_before: prefs.eventAlertMinutes,
          shift_alert_sound: prefs.shiftAlertSound,
        },
      });
    } catch {/* noop — keep local save even if remote fails */}
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const disabled = !prefs.masterEnabled;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Volume2 className="size-5 text-primary" />
          <CardTitle>Sound & Notifications</CardTitle>
        </div>
        <CardDescription>
          Choose alert sounds and ambient audio. All preferences are saved on this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
          <div>
            <Label className="text-base font-medium">Master sound</Label>
            <p className="text-xs text-muted-foreground">Turn all app sounds on or off.</p>
          </div>
          <Switch
            checked={prefs.masterEnabled}
            onCheckedChange={(v) => update("masterEnabled", v)}
          />
        </div>

        {/* Notification sound */}
        <div className={cn("space-y-2", disabled && "opacity-50 pointer-events-none")}>
          <Label>Notification sound</Label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={prefs.notificationSound}
              onChange={(e) => handleSelectSound(e.target.value as SoundId)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {SOUNDS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => playSound(prefs.notificationSound)}
            >
              <Play className="size-3.5 mr-1" /> Preview
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Plays a short tone when an alert fires.</p>
        </div>

        {/* Event reminder alert */}
        <div className={cn("space-y-3 rounded-lg border border-border p-4", disabled && "opacity-50")}>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Event reminder alert</Label>
              <p className="text-xs text-muted-foreground">
                Play a sound before an event starts.
              </p>
            </div>
            <Switch
              disabled={disabled}
              checked={prefs.eventAlertEnabled}
              onCheckedChange={(v) => update("eventAlertEnabled", v)}
            />
          </div>
          {prefs.eventAlertEnabled && (
            <div className="flex flex-wrap gap-2">
              {LEAD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update("eventAlertMinutes", m.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    prefs.eventAlertMinutes === m.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shift start alert */}
        <div className={cn("flex items-center justify-between rounded-lg border border-border p-4", disabled && "opacity-50")}>
          <div>
            <Label className="text-base font-medium">Shift start alert</Label>
            <p className="text-xs text-muted-foreground">
              A distinct sound right before a shift begins.
            </p>
          </div>
          <Switch
            disabled={disabled}
            checked={prefs.shiftAlertEnabled}
            onCheckedChange={(v) => update("shiftAlertEnabled", v)}
          />
        </div>

        {/* Shift start alert sound */}
        <div className={cn("space-y-3 rounded-lg border border-border p-4", disabled && "opacity-50")}>
          <div>
            <Label className="text-base font-medium">Shift start alert sound</Label>
            <p className="text-xs text-muted-foreground">
              Plays when your shift is about to begin.
            </p>
          </div>
          <div className="space-y-2">
            {SHIFT_ALERT_SOUNDS.map((s) => {
              const selected = prefs.shiftAlertSound === s.value;
              return (
                <div
                  key={s.value}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
                    selected ? "border-primary bg-primary/5" : "border-border bg-card",
                  )}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => update("shiftAlertSound", s.value)}
                    className="flex flex-1 items-center gap-2 text-left text-sm font-medium"
                  >
                    <span
                      className={cn(
                        "inline-flex size-4 items-center justify-center rounded-full border",
                        selected ? "border-primary" : "border-muted-foreground/40",
                      )}
                    >
                      {selected && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                    {s.label}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled || s.value === "none"}
                    onClick={() => playShiftAlertSound(s.value)}
                    aria-label={`Preview ${s.label}`}
                  >
                    <Play className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            💡 For the alert to play, ShiftSync must be open or running in the background. Enable push notifications for alerts when the app is closed.
          </p>
        </div>

        {/* Ambient focus mode */}
        <div className={cn("space-y-3 rounded-lg border border-border p-4", disabled && "opacity-50")}>
          <div>
            <Label className="text-base font-medium">Ambient focus mode</Label>
            <p className="text-xs text-muted-foreground">
              Soft looping background sound while the app is open.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {AMBIENT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                disabled={disabled}
                onClick={() => update("ambient", o.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  prefs.ambient === o.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent",
                )}
              >
                {o.icon}
                {o.label}
              </button>
            ))}
          </div>
          {prefs.ambient !== "off" && prefs.masterEnabled && (
            <p className="text-xs text-muted-foreground">
              Playing {AMBIENT_OPTIONS.find((o) => o.value === prefs.ambient)?.label.toLowerCase()} — toggle off to stop.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            {saved ? (
              <>
                <Check className="size-4 mr-1.5" /> Saved
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}