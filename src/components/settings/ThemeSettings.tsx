import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePreferences } from "@/providers/PreferencesProvider";
import { THEMES, type ThemeMode } from "@/lib/themes";
import { cn } from "@/lib/utils";

const MODES: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeSettings() {
  const { prefs, setThemeName, setMode } = usePreferences();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Pick a theme and mode. Changes apply instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => {
            const selected = prefs.themeName === t.name;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setThemeName(t.name)}
                aria-pressed={selected}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:border-primary/60 hover:shadow",
                  selected && "border-primary ring-2 ring-ring",
                )}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
                <div
                  className="flex h-14 overflow-hidden rounded-lg border border-border"
                  aria-hidden
                >
                  <div className="flex-1" style={{ background: t.preview.bgLight }} />
                  <div className="flex-1" style={{ background: t.preview.bgDark }} />
                  <div className="flex w-10 flex-col">
                    <div className="flex-1" style={{ background: t.preview.accent }} />
                    <div className="flex-1" style={{ background: t.preview.highlight }} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-card-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Mode</div>
          <div className="inline-flex rounded-full border border-border bg-muted p-1">
            {MODES.map(({ value, label, Icon }) => {
              const active = prefs.mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
