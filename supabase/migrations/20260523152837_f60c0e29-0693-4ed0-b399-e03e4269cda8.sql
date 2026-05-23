
-- 1. google_events_cache: no client writes (service role bypasses RLS)
-- (No INSERT/UPDATE/DELETE policies exist; explicitly ensure none are added.)
-- Nothing to drop. Add an explicit deny-by-default note via comment.
COMMENT ON TABLE public.google_events_cache IS 'Server-managed cache. Writes only via service role; clients have SELECT-own only.';

-- 2. profiles: prevent users from updating subscription/stripe columns
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only enforce for end-user updates (service role has no auth.uid()).
  IF auth.uid() IS NOT NULL THEN
    NEW.subscription_tier        := OLD.subscription_tier;
    NEW.subscription_status      := OLD.subscription_status;
    NEW.subscription_end_date    := OLD.subscription_end_date;
    NEW.trial_starts_at          := OLD.trial_starts_at;
    NEW.trial_ends_at            := OLD.trial_ends_at;
    NEW.stripe_customer_id       := OLD.stripe_customer_id;
    NEW.stripe_subscription_id   := OLD.stripe_subscription_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privileged_updates ON public.profiles;
CREATE TRIGGER profiles_prevent_privileged_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privileged_updates();

-- 3. reminder_sends: remove client INSERT, rely on service role
DROP POLICY IF EXISTS reminder_sends_insert_own ON public.reminder_sends;
COMMENT ON TABLE public.reminder_sends IS 'Server-managed reminder send log. Writes only via service role; clients have SELECT-own only.';
