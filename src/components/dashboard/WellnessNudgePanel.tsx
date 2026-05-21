import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tip {
  message: string;
  source: string;
}

const TIPS: Tip[] = [
  {
    message:
      "Aim for 7–9 hours of sleep. Each hour of lost sleep measurably impairs memory consolidation, mood, and immune response the next day.",
    source: "Matthew Walker, Why We Sleep",
  },
  {
    message:
      "After a run of night shifts, give yourself a 24-hour recovery window before stacking more. Circadian resets take time, not willpower.",
    source: "Walker, sleep & shift-work research",
  },
  {
    message:
      "Get morning light within 30 minutes of waking — even on cloudy days. Bright light is the single strongest cue to anchor your circadian rhythm.",
    source: "Matthew Walker, Why We Sleep",
  },
  {
    message:
      "Target at least 150 minutes of moderate physical activity per week, plus two muscle-strengthening sessions. Movement protects heart, mood, and sleep.",
    source: "WHO Physical Activity Guidelines",
  },
  {
    message:
      "Even short walking breaks count. Replacing sitting time with light activity is associated with lower all-cause mortality.",
    source: "WHO Physical Activity Guidelines",
  },
  {
    message:
      "Strong social connection is associated with a 50% increase in longevity — comparable in impact to quitting smoking.",
    source: "Holt-Lunstad et al., meta-analysis on social relationships",
  },
  {
    message:
      "Loneliness carries a health risk on par with smoking 15 cigarettes a day. A 10-minute call to someone you love is not a luxury — it's medicine.",
    source: "Holt-Lunstad, social connection research",
  },
  {
    message:
      "A short daily mindfulness practice changes brain regions tied to attention and emotion regulation in as little as eight weeks.",
    source: "Harvard / Sara Lazar, MBSR neuroimaging studies",
  },
  {
    message:
      "Protected, distraction-free time with family or close friends is one of the strongest predictors of life satisfaction across cultures.",
    source: "Seligman, PERMA model of positive psychology",
  },
  {
    message:
      "Savor one small good moment from your day before bed. People who regularly notice positive events report higher wellbeing within two weeks.",
    source: "Seligman, positive psychology interventions",
  },
];

export function WellnessNudgePanel(_props: { nudges?: unknown } = {}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TIPS.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [paused]);

  const tip = TIPS[idx];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/40 p-5"
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          ShiftSync Tip
        </h2>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-2 transition-opacity duration-400 ease-in-out",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="text-sm leading-relaxed text-foreground">{tip.message}</p>
        <p className="text-[11px] italic text-muted-foreground">— {tip.source}</p>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {TIPS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setVisible(false);
              setTimeout(() => {
                setIdx(i);
                setVisible(true);
              }, 200);
            }}
            aria-label={`Show tip ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}