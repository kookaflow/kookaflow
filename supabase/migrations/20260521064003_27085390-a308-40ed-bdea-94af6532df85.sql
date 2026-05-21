
-- ============================================================
-- profiles: rename to spec'd names
-- ============================================================
ALTER TABLE public.profiles RENAME COLUMN display_name TO full_name;
ALTER TABLE public.profiles RENAME COLUMN role TO job_role;

-- ============================================================
-- user_preferences: explicit reminder/sound columns
-- ============================================================
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS daily_reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daily_reminder_time time,
  ADD COLUMN IF NOT EXISTS daily_reminder_channel text,
  ADD COLUMN IF NOT EXISTS weekly_reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weekly_reminder_day text,
  ADD COLUMN IF NOT EXISTS weekly_reminder_time time,
  ADD COLUMN IF NOT EXISTS weekly_reminder_channel text,
  ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_sound text NOT NULL DEFAULT 'soft_chime',
  ADD COLUMN IF NOT EXISTS reminder_minutes_before int NOT NULL DEFAULT 10;

ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_prefs_daily_channel_check;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_prefs_daily_channel_check
  CHECK (daily_reminder_channel IS NULL OR daily_reminder_channel IN ('email','sms','both'));

ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_prefs_weekly_channel_check;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_prefs_weekly_channel_check
  CHECK (weekly_reminder_channel IS NULL OR weekly_reminder_channel IN ('email','sms','both'));

ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_prefs_weekly_day_check;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_prefs_weekly_day_check
  CHECK (weekly_reminder_day IS NULL OR weekly_reminder_day IN ('mon','tue','wed','thu','fri','sat','sun'));

ALTER TABLE public.user_preferences ALTER COLUMN default_view SET DEFAULT 'month';

-- ============================================================
-- events: renames + new columns + drop recurrence jsonb
-- ============================================================
-- Drop the validate trigger first so renames don't fail
DROP TRIGGER IF EXISTS events_validate ON public.events;

ALTER TABLE public.events RENAME COLUMN starts_at TO start_time;
ALTER TABLE public.events RENAME COLUMN ends_at TO end_time;
ALTER TABLE public.events RENAME COLUMN all_day TO is_all_day;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS calculated_earnings numeric(10,2),
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_pattern text,
  ADD COLUMN IF NOT EXISTS recurrence_days text[],
  ADD COLUMN IF NOT EXISTS recurrence_end_date date,
  ADD COLUMN IF NOT EXISTS recurrence_group_id uuid,
  ADD COLUMN IF NOT EXISTS google_event_id text;

ALTER TABLE public.events DROP COLUMN IF EXISTS recurrence;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_recurrence_pattern_check;
ALTER TABLE public.events ADD CONSTRAINT events_recurrence_pattern_check
  CHECK (recurrence_pattern IS NULL OR recurrence_pattern IN ('daily','weekly','fortnightly','custom'));

-- Drop old indexes that referenced renamed columns
DROP INDEX IF EXISTS events_user_starts_idx;
CREATE INDEX IF NOT EXISTS events_user_start_idx ON public.events (user_id, start_time);
CREATE INDEX IF NOT EXISTS events_recurrence_group_idx ON public.events (recurrence_group_id) WHERE recurrence_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS events_google_id_idx ON public.events (user_id, google_event_id) WHERE google_event_id IS NOT NULL;

-- Recreate validate trigger using new column names
CREATE OR REPLACE FUNCTION public.validate_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.end_time < NEW.start_time THEN
    RAISE EXCEPTION 'events.end_time must be >= start_time';
  END IF;

  IF NEW.shift_type = 'split' THEN
    IF NEW.split_shift_first_start IS NULL
       OR NEW.split_shift_first_end IS NULL
       OR NEW.split_shift_break_duration IS NULL
       OR NEW.split_shift_second_start IS NULL
       OR NEW.split_shift_second_end IS NULL THEN
      RAISE EXCEPTION 'Split shift requires all five split_shift_* fields';
    END IF;
    IF NEW.split_shift_first_end >= NEW.split_shift_second_start THEN
      RAISE EXCEPTION 'Split shift first_end must be before second_start';
    END IF;
  END IF;

  IF NEW.shift_type IN ('sick_leave','annual_leave') AND NEW.is_all_day = false THEN
    RAISE EXCEPTION 'Sick leave and annual leave must be all_day';
  END IF;

  IF NEW.is_payday = true AND NEW.category <> 'work' THEN
    RAISE EXCEPTION 'Payday flag only allowed on work events';
  END IF;

  IF NEW.category = 'travel' AND NEW.travel_duration_minutes IS NULL THEN
    RAISE EXCEPTION 'Travel events require travel_duration_minutes';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER events_validate BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.validate_event();

-- ============================================================
-- categories: is_system flag
-- ============================================================
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT true;

-- ============================================================
-- nudge_dismissals (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nudge_dismissals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nudge_type text NOT NULL,
  dismissed_at timestamptz NOT NULL DEFAULT now(),
  reshow_after timestamptz,
  UNIQUE (user_id, nudge_type)
);

CREATE INDEX IF NOT EXISTS nudge_dismissals_user_idx
  ON public.nudge_dismissals (user_id);

ALTER TABLE public.nudge_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nudge_dismissals_select_own ON public.nudge_dismissals;
CREATE POLICY nudge_dismissals_select_own ON public.nudge_dismissals
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS nudge_dismissals_insert_own ON public.nudge_dismissals;
CREATE POLICY nudge_dismissals_insert_own ON public.nudge_dismissals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS nudge_dismissals_delete_own ON public.nudge_dismissals;
CREATE POLICY nudge_dismissals_delete_own ON public.nudge_dismissals
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- public_holidays: reshape to spec
-- ============================================================
ALTER TABLE public.public_holidays RENAME COLUMN country TO country_code;
ALTER TABLE public.public_holidays
  ADD COLUMN IF NOT EXISTS year int,
  ADD COLUMN IF NOT EXISTS fetched_at timestamptz NOT NULL DEFAULT now();

-- Backfill year from date for any existing rows then enforce NOT NULL
UPDATE public.public_holidays SET year = EXTRACT(YEAR FROM date)::int WHERE year IS NULL;
ALTER TABLE public.public_holidays ALTER COLUMN year SET NOT NULL;

CREATE INDEX IF NOT EXISTS public_holidays_country_year_idx
  ON public.public_holidays (country_code, year);

-- Tighten select to authenticated only
DROP POLICY IF EXISTS public_holidays_select_all ON public.public_holidays;
CREATE POLICY public_holidays_select_authenticated ON public.public_holidays
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Realtime: events
-- ============================================================
ALTER TABLE public.events REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'events'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.events';
  END IF;
END
$$;
