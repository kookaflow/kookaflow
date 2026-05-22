import { useEffect, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import {
  getOneSignalConfig,
  updatePushSubscription,
} from "@/lib/push.functions";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

let initialised = false;

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const persistFn = useServerFn(updatePushSubscription);
  const cfgFn = useServerFn(getOneSignalConfig);
  const lastPlayerId = useRef<string | null>(null);

  // Init SDK once on client
  useEffect(() => {
    if (typeof window === "undefined" || initialised) return;
    initialised = true;
    (async () => {
      try {
        const cfg = await cfgFn();
        if (!cfg.appId) return;
        await OneSignal.init({
          appId: cfg.appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
        });
        setReady(true);
      } catch (e) {
        console.error("OneSignal init failed", e);
      }
    })();
  }, [cfgFn]);

  // Track auth user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Link user to OneSignal external_id when both ready
  useEffect(() => {
    if (!ready || !userId) return;
    (async () => {
      try {
        await OneSignal.login(userId);
      } catch (e) {
        console.error("OneSignal login failed", e);
      }
    })();
  }, [ready, userId]);

  // Persist subscription id whenever it changes
  useEffect(() => {
    if (!ready || !userId) return;
    const handler = async () => {
      try {
        const playerId = OneSignal.User.PushSubscription.id ?? null;
        const optedIn = OneSignal.User.PushSubscription.optedIn ?? false;
        if (playerId === lastPlayerId.current) return;
        lastPlayerId.current = playerId;
        await persistFn({ data: { playerId, enabled: !!optedIn && !!playerId } });
      } catch (e) {
        console.error("Failed to persist OneSignal subscription", e);
      }
    };
    handler();
    OneSignal.User.PushSubscription.addEventListener("change", handler);
    return () => {
      OneSignal.User.PushSubscription.removeEventListener("change", handler);
    };
  }, [ready, userId, persistFn]);

  return (
    <>
      {children}
      {ready && userId ? <PushPermissionPrompt /> : null}
    </>
  );
}