import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TimeFormat = "12h" | "24h";

export interface UserSettings {
  week_starts_on: 0 | 1;
  time_format: TimeFormat;
  show_week_numbers: boolean;
  show_public_holidays: boolean;
}

const DEFAULTS: UserSettings = {
  week_starts_on: 1,
  time_format: "12h",
  show_week_numbers: false,
  show_public_holidays: true,
};

/**
 * Lightweight client-side hook that reads/writes the user-level calendar &
 * display preferences directly against Supabase (RLS scopes to current user).
 */
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_preferences")
        .select("week_starts_on,time_format,show_week_numbers,show_public_holidays")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setSettings({
          week_starts_on: (data.week_starts_on === 0 ? 0 : 1) as 0 | 1,
          time_format: (data.time_format as TimeFormat) ?? "12h",
          show_week_numbers: !!data.show_week_numbers,
          show_public_holidays: data.show_public_holidays ?? true,
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function update(patch: Partial<UserSettings>) {
    setSettings((p) => ({ ...p, ...patch }));
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase
      .from("user_preferences")
      .update(patch as never)
      .eq("user_id", u.user.id);
  }

  return { settings, loading, update };
}