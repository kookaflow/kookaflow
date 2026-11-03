
/**
 * Pure Pro-access rule shared by all Google Calendar server functions.
 * Mirrors useSubscription: trial active, lifetime, pro active/trialling,
 * or pro still paid-through (subscription_end_date in the future).
 */
export function profileHasProAccess(
  profile: {
    subscription_tier?: string | null;
    subscription_status?: string | null;
    trial_ends_at?: string | null;
    subscription_end_date?: string | null;
  } | null,
  now: number = Date.now(),
): boolean {
  const tier = profile?.subscription_tier ?? "trial";
  const status = profile?.subscription_status ?? null;
  const trialEnds = profile?.trial_ends_at ? Date.parse(profile.trial_ends_at) : 0;
  const endDate = profile?.subscription_end_date ? Date.parse(profile.subscription_end_date) : 0;
  if (tier === "trial" && trialEnds > now) return true;
  if (tier === "lifetime") return true;
  if (tier === "pro" && (status === "active" || status === "trialling")) return true;
  if (tier === "pro" && endDate > now) return true;
  return false;
}
