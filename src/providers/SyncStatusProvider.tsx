import { createContext, useCallback, useContext, useState } from "react";

interface Ctx {
  isSyncing: boolean;
  startSync: () => void;
  endSync: () => void;
}

const SyncContext = createContext<Ctx | null>(null);

export function SyncStatusProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const startSync = useCallback(() => setIsSyncing(true), []);
  const endSync = useCallback(() => setIsSyncing(false), []);
  return (
    <SyncContext.Provider value={{ isSyncing, startSync, endSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncStatus() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSyncStatus must be used inside SyncStatusProvider");
  return ctx;
}
