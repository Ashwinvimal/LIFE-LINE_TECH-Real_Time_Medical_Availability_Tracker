/**
 * Core domain types for LIFE-LINE-TECH.
 * NOTE: the app currently runs on a local demo dataset (see src/data/mockData.ts).
 * Every read/write goes through src/services/* so a real API can replace the
 * store without touching the UI.
 */

export type MedicineForm =
  | "Tablet"
  | "Capsule"
  | "Syrup"
  | "Injection"
  | "Inhaler"
  | "Ointment"
  | "Drops";

export type MedicineCategory =
  | "Analgesic"
  | "Antibiotic"
  | "Antidiabetic"
  | "Cardiac"
  | "Respiratory"
  | "Gastro"
  | "Emergency"
  | "Vitamin";

export type StockStatus = "available" | "low_stock" | "out_of_stock";

export interface OpeningHours {
  /** 24h clock, e.g. "08:30" */
  opensAt: string;
  closesAt: string;
  /** true for 24x7 stores */
  alwaysOpen: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: OpeningHours;
  isActive: boolean;
  licenseNo: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  strength: string;
  form: MedicineForm;
}

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  minimumStock: number;
  /** unit price in INR */
  price: number;
  /** ISO date */
  expiryDate: string;
  /** ISO timestamp of the last stock change */
  updatedAt: string;
}

/** Inventory row joined with medicine + pharmacy + derived fields. */
export interface InventoryRecord extends InventoryItem {
  medicine: Medicine;
  pharmacy: Pharmacy;
  status: StockStatus;
  isExpired: boolean;
  expiringSoon: boolean;
}

/** A medicine availability hit for the patient-facing search. */
export interface AvailabilityResult extends InventoryRecord {
  /** kilometres from the user, undefined when no location is known */
  distanceKm?: number;
  isOpenNow: boolean;
}

export interface PharmacyWithDistance extends Pharmacy {
  distanceKm?: number;
  isOpenNow: boolean;
  itemCount: number;
  lastUpdatedAt?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NamedLocation extends Coordinates {
  label: string;
}

export interface DashboardStats {
  totalPharmacies: number;
  activePharmacies: number;
  openNow: number;
  totalMedicines: number;
  inventoryRows: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
}

export interface InventoryInput {
  pharmacyId: string;
  medicineName: string;
  genericName: string;
  category: MedicineCategory;
  strength: string;
  form: MedicineForm;
  quantity: number;
  minimumStock: number;
  price: number;
  expiryDate: string;
}
