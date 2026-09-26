import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  getLocationState,
  setLocationState,
  subscribeLocation,
  type LocationState,
} from "@/services/locationStore";
import { requestCurrentPosition, type LocationError } from "@/services/locationService";
import type { NamedLocation } from "@/types";

const serverState = getLocationState();

export function useUserLocation() {
  const state: LocationState = useSyncExternalStore(
    subscribeLocation,
    getLocationState,
    () => serverState,
  );

  const detect = useCallback(async () => {
    setLocationState({ status: "locating", error: null });
    try {
      const coords = await requestCurrentPosition();
      setLocationState({
        location: { ...coords, label: "Your current location" },
        source: "gps",
        status: "ready",
        error: null,
      });
      toast.success("Location detected", {
        description: "Pharmacies are now sorted by distance from you.",
      });
    } catch (err) {
      const e = err as LocationError;
      setLocationState({ status: "error", error: e.message });
      toast.error("Could not use your location", { description: e.message });
    }
  }, []);

  const setManual = useCallback((loc: NamedLocation) => {
    setLocationState({ location: loc, source: "manual", status: "ready", error: null });
  }, []);

  const clear = useCallback(() => {
    setLocationState({ location: null, source: "none", status: "idle", error: null });
  }, []);

  return { ...state, detect, setManual, clear };
}
