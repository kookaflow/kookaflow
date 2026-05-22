
CREATE TABLE public.google_calendar_connections (
  user_id uuid PRIMARY KEY,
  google_email text,
  google_calendar_id text NOT NULL DEFAULT 'primary',
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scope text,
  two_way_sync_enabled boolean NOT NULL DEFAULT false,
  sync_token text,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY gcal_conn_select_own ON public.google_calendar_connections
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY gcal_conn_update_own ON public.google_calendar_connections
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY gcal_conn_delete_own ON public.google_calendar_connections
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER gcal_conn_set_updated_at
  BEFORE UPDATE ON public.google_calendar_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.google_events_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  google_event_id text NOT NULL,
  google_calendar_id text NOT NULL DEFAULT 'primary',
  summary text,
  description text,
  location text,
  html_link text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_all_day boolean NOT NULL DEFAULT false,
  status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, google_event_id)
);

CREATE INDEX gec_user_time_idx ON public.google_events_cache (user_id, start_time);

ALTER TABLE public.google_events_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY gec_select_own ON public.google_events_cache
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER gec_set_updated_at
  BEFORE UPDATE ON public.google_events_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
