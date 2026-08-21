ALTER TABLE public.profiles DISABLE TRIGGER profiles_prevent_privileged_updates;

UPDATE public.profiles
SET subscription_tier = 'lifetime',
    subscription_status = 'active',
    subscription_end_date = null,
    stripe_customer_id = null,
    stripe_subscription_id = null,
    trial_ends_at = now() + interval '100 years',
    updated_at = now()
WHERE full_name = 'Mumbi';

ALTER TABLE public.profiles ENABLE TRIGGER profiles_prevent_privileged_updates;