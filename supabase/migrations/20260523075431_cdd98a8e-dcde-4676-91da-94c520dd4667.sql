
ALTER PUBLICATION supabase_realtime DROP TABLE public.events;

CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;

CREATE POLICY scheduled_push_alerts_insert_own
  ON public.scheduled_push_alerts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY scheduled_push_alerts_update_own
  ON public.scheduled_push_alerts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY scheduled_push_alerts_delete_own
  ON public.scheduled_push_alerts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY gcal_conn_insert_own
  ON public.google_calendar_connections FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reminder_sends_insert_own
  ON public.reminder_sends FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
