-- 1. Add subscription columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS trial_starts_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- 2. Constrain allowed values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('trial','basic','pro','lifetime','expired'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IS NULL OR subscription_status IN ('active','trialling','cancelled','expired'));

-- 3. Default status to 'trialling' for new rows when not provided
ALTER TABLE public.profiles
  ALTER COLUMN subscription_status SET DEFAULT 'trialling';

-- 4. Helpful indexes for webhook lookups + cron sweeps
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_stripe_subscription_id_idx
  ON public.profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_trial_ends_at_idx
  ON public.profiles (trial_ends_at)
  WHERE subscription_tier = 'trial';

-- 5. Update new-user trigger to start a 14-day trial automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (
    id,
    subscription_tier,
    subscription_status,
    trial_starts_at,
    trial_ends_at
  ) values (
    new.id,
    'trial',
    'trialling',
    now(),
    now() + interval '14 days'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$function$;

-- 6. Backfill existing users: give them a 14-day trial starting today
UPDATE public.profiles
SET
  subscription_tier = 'trial',
  subscription_status = 'trialling',
  trial_starts_at = now(),
  trial_ends_at = now() + interval '14 days'
WHERE subscription_tier IS NULL OR subscription_tier = 'trial';
