
CREATE TABLE IF NOT EXISTS public.scheduled_push_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  fire_at timestamptz NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  url text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scheduled_push_alerts_event_unique UNIQUE (event_id)
);

CREATE INDEX IF NOT EXISTS scheduled_push_alerts_due_idx
  ON public.scheduled_push_alerts (fire_at)
  WHERE sent_at IS NULL;

ALTER TABLE public.scheduled_push_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scheduled_push_alerts_select_own ON public.scheduled_push_alerts;
CREATE POLICY scheduled_push_alerts_select_own
  ON public.scheduled_push_alerts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS set_scheduled_push_alerts_updated_at ON public.scheduled_push_alerts;
CREATE TRIGGER set_scheduled_push_alerts_updated_at
  BEFORE UPDATE ON public.scheduled_push_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
