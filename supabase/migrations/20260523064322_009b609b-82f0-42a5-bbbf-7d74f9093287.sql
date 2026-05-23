ALTER TABLE public.reminder_sends DROP CONSTRAINT reminder_sends_kind_check;
ALTER TABLE public.reminder_sends ADD CONSTRAINT reminder_sends_kind_check
  CHECK (kind = ANY (ARRAY['daily'::text, 'weekly'::text, 'trial_4_days'::text, 'trial_1_day'::text, 'trial_expired'::text]));