import type { Coordinates, Pharmacy, PharmacyWithDistance } from "@/types";
import { createId, getSnapshot, mutate, type DataSnapshot } from "./store";
import { haversineKm, isOpenNow } from "@/utils/format";

export function listPharmacies(snapshot = getSnapshot()): Pharmacy[] {
  return [...snapshot.pharmacies];
}

export interface NearbyOptions {
  origin?: Coordinates | undefined;
  openOnly?: boolean | undefined;
  maxDistanceKm?: number | undefined;
  query?: string | undefined;
  includeInactive?: boolean | undefined;
}

export function nearbyPharmacies(
  { origin, openOnly, maxDistanceKm, query, includeInactive }: NearbyOptions,
  snapshot: DataSnapshot = getSnapshot(),
): PharmacyWithDistance[] {
  const q = query?.trim().toLowerCase();
  return snapshot.pharmacies
    .filter((p) => (includeInactive ? true : p.isActive))
    .filter((p) =>
      q ? p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) : true,
    )
    .map<PharmacyWithDistance>((p) => {
      const rows = snapshot.inventory.filter((i) => i.pharmacyId === p.id);
      const lastUpdatedAt = rows
        .map((r) => r.updatedAt)
        .sort((a, b) => +new Date(b) - +new Date(a))[0];
      return {
        ...p,
        distanceKm: origin ? haversineKm(origin, p) : undefined,
        isOpenNow: isOpenNow(p.openingHours),
        itemCount: rows.length,
        lastUpdatedAt,
      };
    })
    .filter((p) => (openOnly ? p.isOpenNow : true))
    .filter((p) =>
      maxDistanceKm && p.distanceKm !== undefined ? p.distanceKm <= maxDistanceKm : true,
    )
    .sort((a, b) => {
      const d = (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    });
}

export function getPharmacy(
  id: string,
  snapshot = getSnapshot(),
): Pharmacy | undefined {
  return snapshot.pharmacies.find((p) => p.id === id);
}

export type PharmacyDraft = Omit<Pharmacy, "id">;

export function addPharmacy(draftPharmacy: PharmacyDraft): void {
  mutate((draft) => {
    draft.pharmacies = [...draft.pharmacies, { ...draftPharmacy, id: createId("ph") }];
  });
}

export function updatePharmacy(id: string, patch: Partial<Pharmacy>): void {
  mutate((draft) => {
    draft.pharmacies = draft.pharmacies.map((p) => (p.id === id ? { ...p, ...patch } : p));
  });
}

export function deletePharmacy(id: string): void {
  mutate((draft) => {
    draft.pharmacies = draft.pharmacies.filter((p) => p.id !== id);
    draft.inventory = draft.inventory.filter((i) => i.pharmacyId !== id);
  });
}

export function directionsUrl(p: { latitude: number; longitude: number }): string {
  return `https://www.openstreetmap.org/directions?to=${p.latitude},${p.longitude}`;
}
