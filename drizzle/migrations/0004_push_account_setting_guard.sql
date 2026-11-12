CREATE TABLE public.push_devices (
  user_id uuid NOT NULL,
  subscription_id text NOT NULL,
  platform text,
  opted_in boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subscription_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_devices TO authenticated;
GRANT ALL ON public.push_devices TO service_role;
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_devices_select_own ON public.push_devices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY push_devices_insert_own ON public.push_devices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY push_devices_update_own ON public.push_devices FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY push_devices_delete_own ON public.push_devices FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_push_account_setting()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.push_notifications_enabled IS DISTINCT FROM OLD.push_notifications_enabled
     AND coalesce(current_setting('app.push_toggle', true), '') <> 'on' THEN
    NEW.push_notifications_enabled := OLD.push_notifications_enabled;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_guard_push_setting BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_push_account_setting();

CREATE OR REPLACE FUNCTION public.set_push_enabled(_enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  PERFORM set_config('app.push_toggle', 'on', true);
  UPDATE public.profiles SET push_notifications_enabled = _enabled WHERE id = auth.uid();
  PERFORM set_config('app.push_toggle', '', true);
END;
$$;
REVOKE ALL ON FUNCTION public.set_push_enabled(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_push_enabled(boolean) TO authenticated;

ALTER TABLE public.profiles ALTER COLUMN push_notifications_enabled SET DEFAULT true;

DO $$
DECLARE n integer;
BEGIN
  UPDATE public.profiles SET push_notifications_enabled = true WHERE push_notifications_enabled = false;
  GET DIAGNOSTICS n = ROW_COUNT;
  RAISE NOTICE 'push opt-out backfill: % accounts switched on', n;
END $$;