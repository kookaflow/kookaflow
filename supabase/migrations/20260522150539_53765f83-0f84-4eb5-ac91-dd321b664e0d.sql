ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onesignal_player_id text,
  ADD COLUMN IF NOT EXISTS push_notifications_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_daily_reminder boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_weekly_reminder boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_shift_alerts boolean NOT NULL DEFAULT true;