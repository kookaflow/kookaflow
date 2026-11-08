import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import {
  getOneSignalConfig,
  updatePushSubscription,
} from "@/lib/push.functions";
import {
  getPushSubscription,
  initPush,
  loginPush,
  logoutPush,
  onPushClick,
  onPushSubscriptionChange,
} from "@/lib/pushClient";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

let started = false;

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const persistFn = useServerFn(updatePushSubscription);
  const cfgFn = useServerFn(getOneSignalConfig);
  const lastPlayerId = useRef<string | null | undefined>(undefined);
  const loggedInAs = useRef<string | null>(null);
  const router = useRouter();

  // Init SDK once on client
  useEffect(() => {
    if (typeof window === "undefined" || started) return;
    started = true;
    (async () => {
      try {
        const baked = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;
        const appId = baked || (await cfgFn()).appId;
        if (!appId) {
          console.warn("[push] no OneSignal app id");
          return;
        }
        if (await initPush(appId)) setReady(true);
      } catch (e) {
        console.error("[push] init failed", e);
      }
    })();
  }, [cfgFn]);

  // Notification taps (native): open the in-app screen
  useEffect(() => {
    return onPushClick((path) => {
      router.history.push(path);
    });
  }, [router]);

  // Track auth user
  useEffect(() => {
    // getSession is local (no network) and covers restored sessions at launch.
    setTimeout(() => {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          const id = data.session?.user?.id ?? null;
          console.log("[push] session user", id ? "present" : "none");
          setUserId(id);
        })
        .catch((e) => console.warn("[push] session read failed", e));
    }, 0);
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const id = session?.user?.id ?? null;
      setTimeout(() => setUserId(id), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Link user to OneSignal external_id; unlink on sign-out
  useEffect(() => {
    if (!ready) return;
    if (userId && loggedInAs.current !== userId) {
      loggedInAs.current = userId;
      void loginPush(userId);
    } else if (!userId && loggedInAs.current) {
      loggedInAs.current = null;
      lastPlayerId.current = undefined;
      void logoutPush();
    }
  }, [ready, userId]);

  // Persist subscription id whenever it changes
  useEffect(() => {
    if (!ready || !userId) return;
    const handler = async () => {
      try {
        const { id, optedIn } = await getPushSubscription();
        if (id === lastPlayerId.current) return;
        lastPlayerId.current = id;
        await persistFn({ data: { playerId: id, enabled: optedIn && !!id } });
        console.log("[push] subscription saved", id ? "present" : "none");
      } catch (e) {
        console.error("[push] failed to persist subscription", e);
      }
    };
    void handler();
    return onPushSubscriptionChange(() => void handler());
  }, [ready, userId, persistFn]);

  return (
    <>
      {children}
      {ready && userId ? <PushPermissionPrompt /> : null}
    </>
  );
}
