ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS time_format text NOT NULL DEFAULT '12h',
  ADD COLUMN IF NOT EXISTS show_week_numbers boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_public_holidays boolean NOT NULL DEFAULT true;

ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_time_format_check;
ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_time_format_check CHECK (time_format IN ('12h','24h'));