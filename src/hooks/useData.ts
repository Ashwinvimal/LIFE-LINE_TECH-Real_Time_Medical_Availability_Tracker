import { useEffect, useSyncExternalStore } from "react";
import { getSnapshot, hydrateStore, subscribe, type DataSnapshot } from "@/services/store";

const serverSnapshot = getSnapshot();

/**
 * Subscribes the component to the live data store. Any admin mutation
 * re-renders every consumer, which is what makes availability "real time".
 */
export function useDataSnapshot(): DataSnapshot {
  useEffect(() => {
    hydrateStore();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
