import { savedLocations } from "@/data/mockData";
import type { Coordinates, NamedLocation } from "@/types";

export type LocationErrorCode =
  | "unsupported"
  | "permission_denied"
  | "unavailable"
  | "timeout";

export interface LocationError {
  code: LocationErrorCode;
  message: string;
}

const messages: Record<LocationErrorCode, string> = {
  unsupported: "This browser does not support location access.",
  permission_denied:
    "Location permission was denied. Pick an area manually to keep searching.",
  unavailable: "Your location could not be determined right now.",
  timeout: "Locating you took too long. Try again or choose an area manually.",
};

/** Browser geolocation wrapped in a promise with normalised errors. */
export function requestCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({ code: "unsupported", message: messages.unsupported } satisfies LocationError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        const code: LocationErrorCode =
          err.code === err.PERMISSION_DENIED
            ? "permission_denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "unavailable";
        reject({ code, message: messages[code] } satisfies LocationError);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/** Offline "geocoder" over known demo areas — no external key required. */
export function searchAreas(query: string): NamedLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return savedLocations;
  return savedLocations.filter((l) => l.label.toLowerCase().includes(q));
}

export const manualAreas: NamedLocation[] = savedLocations;
