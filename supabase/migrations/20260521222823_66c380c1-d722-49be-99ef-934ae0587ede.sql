ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS shift_alert_sound text NOT NULL DEFAULT 'triple_chime';