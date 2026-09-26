import type {
  AvailabilityResult,
  Coordinates,
  DashboardStats,
  InventoryInput,
  InventoryRecord,
  Medicine,
  StockStatus,
} from "@/types";
import { createId, getSnapshot, mutate, type DataSnapshot } from "./store";
import { daysUntil, haversineKm, isOpenNow, stockStatus } from "@/utils/format";

const EXPIRY_SOON_DAYS = 30;

function decorate(snapshot: DataSnapshot): InventoryRecord[] {
  const medicines = new Map(snapshot.medicines.map((m) => [m.id, m]));
  const pharmacies = new Map(snapshot.pharmacies.map((p) => [p.id, p]));
  return snapshot.inventory.flatMap((item) => {
    const medicine = medicines.get(item.medicineId);
    const pharmacy = pharmacies.get(item.pharmacyId);
    if (!medicine || !pharmacy) return [];
    const remaining = daysUntil(item.expiryDate);
    return [
      {
        ...item,
        medicine,
        pharmacy,
        status: stockStatus(item.quantity, item.minimumStock),
        isExpired: remaining < 0,
        expiringSoon: remaining >= 0 && remaining <= EXPIRY_SOON_DAYS,
      },
    ];
  });
}

/** All inventory rows joined with medicine + pharmacy (admin view). */
export function listInventory(snapshot = getSnapshot()): InventoryRecord[] {
  return decorate(snapshot).sort((a, b) =>
    a.medicine.name.localeCompare(b.medicine.name),
  );
}

export function listMedicines(snapshot = getSnapshot()): Medicine[] {
  return [...snapshot.medicines].sort((a, b) => a.name.localeCompare(b.name));
}

export interface SearchOptions {
  query: string;
  origin?: Coordinates;
  openOnly?: boolean;
  inStockOnly?: boolean;
  maxDistanceKm?: number;
}

/** Patient-facing medicine availability search (partial name / generic match). */
export function searchAvailability(
  { query, origin, openOnly, inStockOnly, maxDistanceKm }: SearchOptions,
  snapshot = getSnapshot(),
): AvailabilityResult[] {
  const q = query.trim().toLowerCase();
  const rows = decorate(snapshot)
    .filter((r) => r.pharmacy.isActive && !r.isExpired)
    .filter((r) => {
      if (!q) return true;
      const m = r.medicine;
      return (
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    })
    .map<AvailabilityResult>((r) => ({
      ...r,
      isOpenNow: isOpenNow(r.pharmacy.openingHours),
      distanceKm: origin ? haversineKm(origin, r.pharmacy) : undefined,
    }))
    .filter((r) => (openOnly ? r.isOpenNow : true))
    .filter((r) => (inStockOnly ? r.status !== "out_of_stock" : true))
    .filter((r) =>
      maxDistanceKm && r.distanceKm !== undefined ? r.distanceKm <= maxDistanceKm : true,
    );

  const rank: Record<StockStatus, number> = {
    available: 0,
    low_stock: 1,
    out_of_stock: 2,
  };
  return rows.sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    if (a.isOpenNow !== b.isOpenNow) return a.isOpenNow ? -1 : 1;
    return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
  });
}

/** Emergency mode: open stores first, in-stock only, nearest first. */
export function searchEmergency(
  query: string,
  origin?: Coordinates,
  snapshot = getSnapshot(),
): AvailabilityResult[] {
  return searchAvailability(
    { query, origin, openOnly: true, inStockOnly: true },
    snapshot,
  ).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

export function inventoryForPharmacy(
  pharmacyId: string,
  snapshot = getSnapshot(),
): InventoryRecord[] {
  return listInventory(snapshot).filter((r) => r.pharmacyId === pharmacyId);
}

export function getStats(snapshot = getSnapshot()): DashboardStats {
  const rows = decorate(snapshot);
  return {
    totalPharmacies: snapshot.pharmacies.length,
    activePharmacies: snapshot.pharmacies.filter((p) => p.isActive).length,
    openNow: snapshot.pharmacies.filter(
      (p) => p.isActive && isOpenNow(p.openingHours),
    ).length,
    totalMedicines: snapshot.medicines.length,
    inventoryRows: rows.length,
    lowStock: rows.filter((r) => r.status === "low_stock").length,
    outOfStock: rows.filter((r) => r.status === "out_of_stock").length,
    expiringSoon: rows.filter((r) => r.expiringSoon || r.isExpired).length,
  };
}

export function recentUpdates(limit = 6, snapshot = getSnapshot()): InventoryRecord[] {
  return decorate(snapshot)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, limit);
}

/** Creates the medicine when it does not exist yet, then the inventory row. */
export function addInventoryItem(input: InventoryInput): void {
  mutate((draft) => {
    const name = input.medicineName.trim();
    let medicine = draft.medicines.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
    if (!medicine) {
      medicine = {
        id: createId("md"),
        name,
        genericName: input.genericName.trim() || name,
        category: input.category,
        strength: input.strength,
        form: input.form,
      };
      draft.medicines = [...draft.medicines, medicine];
    }
    const existing = draft.inventory.find(
      (i) => i.pharmacyId === input.pharmacyId && i.medicineId === medicine!.id,
    );
    if (existing) {
      draft.inventory = draft.inventory.map((i) =>
        i.id === existing.id
          ? {
              ...i,
              quantity: input.quantity,
              minimumStock: input.minimumStock,
              price: input.price,
              expiryDate: input.expiryDate,
              updatedAt: new Date().toISOString(),
            }
          : i,
      );
      return;
    }
    draft.inventory = [
      ...draft.inventory,
      {
        id: createId("iv"),
        pharmacyId: input.pharmacyId,
        medicineId: medicine.id,
        quantity: input.quantity,
        minimumStock: input.minimumStock,
        price: input.price,
        expiryDate: input.expiryDate,
        updatedAt: new Date().toISOString(),
      },
    ];
  });
}

export function updateInventoryItem(
  id: string,
  patch: Partial<Pick<InventoryInput, "quantity" | "minimumStock" | "price" | "expiryDate">> & {
    medicineName?: string;
  },
): void {
  mutate((draft) => {
    draft.inventory = draft.inventory.map((i) =>
      i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
    );
    const row = draft.inventory.find((i) => i.id === id);
    if (row && patch.medicineName) {
      draft.medicines = draft.medicines.map((m) =>
        m.id === row.medicineId ? { ...m, name: patch.medicineName! } : m,
      );
    }
  });
}

export function adjustQuantity(id: string, delta: number): void {
  mutate((draft) => {
    draft.inventory = draft.inventory.map((i) =>
      i.id === id
        ? {
            ...i,
            quantity: Math.max(0, i.quantity + delta),
            updatedAt: new Date().toISOString(),
          }
        : i,
    );
  });
}

export function deleteInventoryItem(id: string): void {
  mutate((draft) => {
    draft.inventory = draft.inventory.filter((i) => i.id !== id);
  });
}
