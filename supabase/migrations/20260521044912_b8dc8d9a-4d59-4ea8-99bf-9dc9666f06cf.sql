
-- Drop any existing check on theme column
DO $$
DECLARE c text;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.user_preferences'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%theme%'
  LOOP
    EXECUTE format('ALTER TABLE public.user_preferences DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

-- Migrate legacy values: anything that isn't a theme name becomes 'slate'
UPDATE public.user_preferences
SET theme = 'slate'
WHERE theme NOT IN ('slate','midnight','lavender','forest');

ALTER TABLE public.user_preferences
  ALTER COLUMN theme SET DEFAULT 'slate';

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_theme_check
  CHECK (theme IN ('slate','midnight','lavender','forest'));

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS theme_mode text NOT NULL DEFAULT 'light';

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_theme_mode_check
  CHECK (theme_mode IN ('light','dark'));
