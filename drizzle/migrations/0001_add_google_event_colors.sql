ALTER TABLE public.google_events_cache
  ADD COLUMN IF NOT EXISTS color_id text,
  ADD COLUMN IF NOT EXISTS color_hex text;