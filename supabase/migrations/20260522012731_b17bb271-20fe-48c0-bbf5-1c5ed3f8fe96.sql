-- Extend shift_templates with new fields for custom shift system
ALTER TABLE public.shift_templates
  ADD COLUMN IF NOT EXISTS show_as text,
  ADD COLUMN IF NOT EXISTS life_category text NOT NULL DEFAULT 'work',
  ADD COLUMN IF NOT EXISTS is_all_day boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_split_shift boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_24_hour boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_hours numeric(5,2),
  ADD COLUMN IF NOT EXISTS unpaid_break_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_break_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS split_start_2 time,
  ADD COLUMN IF NOT EXISTS split_end_2 time,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Length constraints
ALTER TABLE public.shift_templates
  DROP CONSTRAINT IF EXISTS shift_templates_name_len,
  DROP CONSTRAINT IF EXISTS shift_templates_show_as_len,
  DROP CONSTRAINT IF EXISTS shift_templates_life_category_chk;

ALTER TABLE public.shift_templates
  ADD CONSTRAINT shift_templates_name_len CHECK (char_length(name) <= 20),
  ADD CONSTRAINT shift_templates_show_as_len CHECK (show_as IS NULL OR char_length(show_as) <= 6),
  ADD CONSTRAINT shift_templates_life_category_chk CHECK (life_category IN ('work','rest','wellness','exercise','social','family','personal','travel'));

-- Trigger to recompute total_hours from time fields
CREATE OR REPLACE FUNCTION public.compute_shift_template_hours()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  mins integer := 0;
  seg integer;
BEGIN
  IF NEW.is_24_hour THEN
    mins := 24 * 60;
  ELSIF NEW.is_all_day THEN
    mins := 24 * 60;
  ELSE
    IF NEW.default_start IS NOT NULL AND NEW.default_end IS NOT NULL THEN
      seg := EXTRACT(EPOCH FROM (NEW.default_end - NEW.default_start)) / 60;
      IF seg <= 0 THEN seg := seg + 24*60; END IF;
      mins := mins + seg;
    END IF;
    IF NEW.is_split_shift AND NEW.split_start_2 IS NOT NULL AND NEW.split_end_2 IS NOT NULL THEN
      seg := EXTRACT(EPOCH FROM (NEW.split_end_2 - NEW.split_start_2)) / 60;
      IF seg <= 0 THEN seg := seg + 24*60; END IF;
      mins := mins + seg;
    END IF;
  END IF;
  mins := GREATEST(mins - COALESCE(NEW.unpaid_break_minutes, 0), 0);
  NEW.total_hours := ROUND((mins::numeric) / 60.0, 2);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_shift_template_hours ON public.shift_templates;
CREATE TRIGGER trg_compute_shift_template_hours
  BEFORE INSERT OR UPDATE ON public.shift_templates
  FOR EACH ROW EXECUTE FUNCTION public.compute_shift_template_hours();

-- Add unpaid_break_minutes to events for earnings accuracy
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS unpaid_break_minutes integer;