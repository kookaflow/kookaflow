
-- ============================================================
-- categories: seed Travel + ensure all 8 life categories exist
-- ============================================================
INSERT INTO public.categories (id, label, color, icon, sort_order) VALUES
  ('work',     'Work',     '#3B82F6', 'Briefcase', 1),
  ('rest',     'Rest',     '#10B981', 'Moon',      2),
  ('wellness', 'Wellness', '#F59E0B', 'Heart',     3),
  ('exercise', 'Exercise', '#EF4444', 'Dumbbell',  4),
  ('social',   'Social',   '#A855F7', 'Users',     5),
  ('family',   'Family',   '#F97316', 'Home',      6),
  ('personal', 'Personal', '#94A3B8', 'Star',      7),
  ('travel',   'Travel',   '#64748B', 'Car',       8)
ON CONFLICT (id) DO UPDATE
  SET label = EXCLUDED.label,
      color = EXCLUDED.color,
      icon = EXCLUDED.icon,
      sort_order = EXCLUDED.sort_order;

-- ============================================================
-- user_preferences: new columns
-- ============================================================
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS accent_colour text,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(10,2),
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AUD',
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'AU';

-- ============================================================
-- events: new columns
-- ============================================================
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS shift_role text,
  ADD COLUMN IF NOT EXISTS split_shift_first_start time,
  ADD COLUMN IF NOT EXISTS split_shift_first_end time,
  ADD COLUMN IF NOT EXISTS split_shift_break_duration int,
  ADD COLUMN IF NOT EXISTS split_shift_second_start time,
  ADD COLUMN IF NOT EXISTS split_shift_second_end time,
  ADD COLUMN IF NOT EXISTS is_payday boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS icon_gradient text,
  ADD COLUMN IF NOT EXISTS travel_duration_minutes int,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(10,2);

-- Restrict shift_type to the known set (drop+add for idempotency)
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_shift_type_check;
ALTER TABLE public.events ADD CONSTRAINT events_shift_type_check
  CHECK (shift_type IS NULL OR shift_type IN (
    'morning','afternoon','night','oncall','split',
    'sick_leave','annual_leave','travel','payday'
  ));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS events_user_starts_idx
  ON public.events (user_id, starts_at);
CREATE INDEX IF NOT EXISTS events_user_category_idx
  ON public.events (user_id, category);
CREATE INDEX IF NOT EXISTS events_user_payday_idx
  ON public.events (user_id) WHERE is_payday;

-- ============================================================
-- updated_at triggers (idempotent)
-- ============================================================
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS user_preferences_set_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_set_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS events_set_updated_at ON public.events;
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- events validation trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ends_at < NEW.starts_at THEN
    RAISE EXCEPTION 'events.ends_at must be >= starts_at';
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

  IF NEW.shift_type IN ('sick_leave','annual_leave') AND NEW.all_day = false THEN
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

DROP TRIGGER IF EXISTS events_validate ON public.events;
CREATE TRIGGER events_validate BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.validate_event();

-- ============================================================
-- public_holidays
-- ============================================================
CREATE TABLE IF NOT EXISTS public.public_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  region text,
  date date NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country, region, date, name)
);

CREATE INDEX IF NOT EXISTS public_holidays_country_date_idx
  ON public.public_holidays (country, date);

ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_holidays_select_all ON public.public_holidays;
CREATE POLICY public_holidays_select_all ON public.public_holidays
  FOR SELECT TO anon, authenticated USING (true);
