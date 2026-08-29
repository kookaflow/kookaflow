import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  configureRevenueCat,
  identifyRevenueCatUser,
  logOutRevenueCatUser,
} from "@/lib/revenuecat";

/**
 * Runs RevenueCat init once for the signed-in app (native builds only) and
 * keeps the RevenueCat app user id in sync with the Supabase session.
 * Renders nothing and never throws.
 */
export function RevenueCatProvider() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const ok = await configureRevenueCat();
      if (!ok || cancelled) return;
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) await identifyRevenueCatUser(data.user.id);
    })();

    const { data: authSub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" && session?.user) {
        void identifyRevenueCatUser(session.user.id);
      } else if (event === "SIGNED_OUT") {
        void logOutRevenueCatUser();
      }
    });

    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
