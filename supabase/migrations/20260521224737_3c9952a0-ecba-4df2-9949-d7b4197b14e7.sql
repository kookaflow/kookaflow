
CREATE TABLE IF NOT EXISTS public.reminder_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('daily','weekly')),
  sent_for_date date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, sent_for_date)
);

ALTER TABLE public.reminder_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_sends_select_own" ON public.reminder_sends
  FOR SELECT TO authenticated USING (user_id = auth.uid());
