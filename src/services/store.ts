import { demoInventory, demoMedicines, demoPharmacies } from "@/data/mockData";
import type { InventoryItem, Medicine, Pharmacy } from "@/types";

/**
 * Single in-memory source of truth with a subscribe/notify channel.
 * Admin writes notify every subscriber, so patient-facing availability
 * updates immediately. Swap the read/write bodies for API calls later —
 * the service layer signatures stay the same.
 */

export interface DataSnapshot {
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  inventory: InventoryItem[];
  revision: number;
}

const STORAGE_KEY = "lifelinetech.data.v1";

function seed(): DataSnapshot {
  return {
    pharmacies: structuredClone(demoPharmacies),
    medicines: structuredClone(demoMedicines),
    inventory: structuredClone(demoInventory),
    revision: 1,
  };
}

let snapshot: DataSnapshot = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage full or unavailable — the app keeps working in memory
  }
}

/** Called once on the client before the first render-driven read. */
export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DataSnapshot;
      if (parsed?.pharmacies?.length && parsed?.inventory) {
        snapshot = { ...parsed, revision: (parsed.revision ?? 0) + 1 };
        emit();
      }
    }
  } catch {
    // corrupt payload — fall back to the demo seed
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): DataSnapshot {
  return snapshot;
}

export function mutate(updater: (draft: DataSnapshot) => void) {
  const draft: DataSnapshot = {
    pharmacies: [...snapshot.pharmacies],
    medicines: [...snapshot.medicines],
    inventory: [...snapshot.inventory],
    revision: snapshot.revision + 1,
  };
  updater(draft);
  snapshot = draft;
  persist();
  emit();
}

export function resetStore() {
  snapshot = seed();
  persist();
  emit();
}

export const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
