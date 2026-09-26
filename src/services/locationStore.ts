import type { NamedLocation } from "@/types";

export type LocationSource = "gps" | "manual" | "none";

export interface LocationState {
  location: NamedLocation | null;
  source: LocationSource;
  status: "idle" | "locating" | "ready" | "error";
  error: string | null;
}

let state: LocationState = {
  location: null,
  source: "none",
  status: "idle",
  error: null,
};

const listeners = new Set<() => void>();

export function subscribeLocation(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getLocationState(): LocationState {
  return state;
}

export function setLocationState(patch: Partial<LocationState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
