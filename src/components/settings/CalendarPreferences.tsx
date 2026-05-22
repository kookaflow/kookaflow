import { CalendarRange } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/hooks/use-user-settings";

export function CalendarPreferences() {
  const { settings, update, loading } = useUserSettings();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="size-4 text-primary" /> Calendar
        </CardTitle>
        <CardDescription>Tune how your calendar reads and counts time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Start week on */}
        <Row label="Start week on" help="Australian default is Monday.">
          <Segmented
            value={settings.week_starts_on === 0 ? "sun" : "mon"}
            onChange={(v) => update({ week_starts_on: v === "sun" ? 0 : 1 })}
            options={[
              { value: "mon", label: "Monday" },
              { value: "sun", label: "Sunday" },
            ]}
            disabled={loading}
          />
        </Row>

        {/* Time format */}
        <Row label="Time format" help="How times are shown throughout the app.">
          <Segmented
            value={settings.time_format}
            onChange={(v) => update({ time_format: v as "12h" | "24h" })}
            options={[
              { value: "12h", label: "12-hour" },
              { value: "24h", label: "24-hour" },
            ]}
            disabled={loading}
          />
        </Row>

        {/* Week numbers */}
        <ToggleRow
          label="Show week numbers"
          help="Display W## in the top-left of each week row."
          checked={settings.show_week_numbers}
          onChange={(v) => update({ show_week_numbers: v })}
          disabled={loading}
        />

        {/* Holidays */}
        <ToggleRow
          label="Show public holidays"
          help="Mark public holidays on your calendar."
          checked={settings.show_public_holidays}
          onChange={(v) => update({ show_public_holidays: v })}
          disabled={loading}
        />
      </CardContent>
    </Card>
  );
}

function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {help && <div className="text-xs text-muted-foreground">{help}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  help,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Row label={label} help={help}>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </Row>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-muted p-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
              disabled && "opacity-50",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}