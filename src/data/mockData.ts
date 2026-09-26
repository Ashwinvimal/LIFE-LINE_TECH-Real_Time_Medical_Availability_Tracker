import type { InventoryItem, Medicine, Pharmacy } from "@/types";

/**
 * DEMO DATASET — not real medical availability data.
 * Coordinates are around Coimbatore, Tamil Nadu.
 */
export const DEMO_DATA_NOTICE =
  "Demo dataset — availability shown here is sample data, not live pharmacy stock.";

export const demoPharmacies: Pharmacy[] = [
  {
    id: "ph-1",
    name: "ABC Medicals",
    address: "12 Avinashi Road, Peelamedu",
    city: "Coimbatore",
    latitude: 11.0246,
    longitude: 76.9932,
    phone: "+91 98400 11223",
    openingHours: { opensAt: "08:00", closesAt: "22:30", alwaysOpen: false },
    isActive: true,
    licenseNo: "TN-CBE-0912",
  },
  {
    id: "ph-2",
    name: "LifeCare 24x7 Pharmacy",
    address: "Near Gandhipuram Bus Stand, Cross Cut Road",
    city: "Coimbatore",
    latitude: 11.0168,
    longitude: 76.9558,
    phone: "+91 98400 44556",
    openingHours: { opensAt: "00:00", closesAt: "23:59", alwaysOpen: true },
    isActive: true,
    licenseNo: "TN-CBE-1188",
  },
  {
    id: "ph-3",
    name: "Sri Venkateswara Medicals",
    address: "45 Trichy Road, Ramanathapuram",
    city: "Coimbatore",
    latitude: 10.9925,
    longitude: 76.9814,
    phone: "+91 90031 77889",
    openingHours: { opensAt: "09:00", closesAt: "21:00", alwaysOpen: false },
    isActive: true,
    licenseNo: "TN-CBE-0455",
  },
  {
    id: "ph-4",
    name: "MedPlus Saibaba Colony",
    address: "8 NSR Road, Saibaba Colony",
    city: "Coimbatore",
    latitude: 11.0245,
    longitude: 76.9439,
    phone: "+91 97910 33445",
    openingHours: { opensAt: "08:30", closesAt: "23:00", alwaysOpen: false },
    isActive: true,
    licenseNo: "TN-CBE-2231",
  },
  {
    id: "ph-5",
    name: "Kovai Health Point",
    address: "22 Mettupalayam Road, Thudiyalur",
    city: "Coimbatore",
    latitude: 11.0765,
    longitude: 76.9329,
    phone: "+91 93450 66778",
    openingHours: { opensAt: "07:00", closesAt: "13:00", alwaysOpen: false },
    isActive: true,
    licenseNo: "TN-CBE-3390",
  },
  {
    id: "ph-6",
    name: "Green Cross Pharmacy",
    address: "Sathy Road, Ganapathy",
    city: "Coimbatore",
    latitude: 11.0391,
    longitude: 77.0025,
    phone: "+91 96550 12398",
    openingHours: { opensAt: "10:00", closesAt: "20:00", alwaysOpen: false },
    isActive: false,
    licenseNo: "TN-CBE-4102",
  },
];

export const demoMedicines: Medicine[] = [
  {
    id: "md-1",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    category: "Analgesic",
    strength: "500 mg",
    form: "Tablet",
  },
  {
    id: "md-2",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    strength: "500 mg",
    form: "Capsule",
  },
  {
    id: "md-3",
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    category: "Antidiabetic",
    strength: "500 mg",
    form: "Tablet",
  },
  {
    id: "md-4",
    name: "Salbutamol Inhaler",
    genericName: "Salbutamol",
    category: "Respiratory",
    strength: "100 mcg",
    form: "Inhaler",
  },
  {
    id: "md-5",
    name: "Atorvastatin 10mg",
    genericName: "Atorvastatin",
    category: "Cardiac",
    strength: "10 mg",
    form: "Tablet",
  },
  {
    id: "md-6",
    name: "Pantoprazole 40mg",
    genericName: "Pantoprazole Sodium",
    category: "Gastro",
    strength: "40 mg",
    form: "Tablet",
  },
  {
    id: "md-7",
    name: "Adrenaline Injection",
    genericName: "Epinephrine",
    category: "Emergency",
    strength: "1 mg/ml",
    form: "Injection",
  },
  {
    id: "md-8",
    name: "ORS Solution",
    genericName: "Oral Rehydration Salts",
    category: "Emergency",
    strength: "21.8 g",
    form: "Syrup",
  },
  {
    id: "md-9",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine Dihydrochloride",
    category: "Analgesic",
    strength: "10 mg",
    form: "Tablet",
  },
  {
    id: "md-10",
    name: "Vitamin D3 60000 IU",
    genericName: "Cholecalciferol",
    category: "Vitamin",
    strength: "60000 IU",
    form: "Capsule",
  },
];

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

export const demoInventory: InventoryItem[] = [
  // ABC Medicals
  { id: "iv-1", pharmacyId: "ph-1", medicineId: "md-1", quantity: 24, minimumStock: 10, price: 28, expiryDate: inDays(420), updatedAt: minutesAgo(2) },
  { id: "iv-2", pharmacyId: "ph-1", medicineId: "md-2", quantity: 6, minimumStock: 12, price: 96, expiryDate: inDays(200), updatedAt: minutesAgo(35) },
  { id: "iv-3", pharmacyId: "ph-1", medicineId: "md-6", quantity: 0, minimumStock: 8, price: 112, expiryDate: inDays(300), updatedAt: minutesAgo(180) },
  { id: "iv-4", pharmacyId: "ph-1", medicineId: "md-9", quantity: 40, minimumStock: 10, price: 22, expiryDate: inDays(25), updatedAt: minutesAgo(90) },
  // LifeCare 24x7
  { id: "iv-5", pharmacyId: "ph-2", medicineId: "md-1", quantity: 60, minimumStock: 15, price: 26, expiryDate: inDays(500), updatedAt: minutesAgo(6) },
  { id: "iv-6", pharmacyId: "ph-2", medicineId: "md-7", quantity: 9, minimumStock: 4, price: 148, expiryDate: inDays(160), updatedAt: minutesAgo(14) },
  { id: "iv-7", pharmacyId: "ph-2", medicineId: "md-4", quantity: 3, minimumStock: 5, price: 232, expiryDate: inDays(240), updatedAt: minutesAgo(48) },
  { id: "iv-8", pharmacyId: "ph-2", medicineId: "md-8", quantity: 85, minimumStock: 20, price: 24, expiryDate: inDays(365), updatedAt: minutesAgo(22) },
  { id: "iv-9", pharmacyId: "ph-2", medicineId: "md-3", quantity: 32, minimumStock: 10, price: 45, expiryDate: inDays(280), updatedAt: minutesAgo(70) },
  // Sri Venkateswara
  { id: "iv-10", pharmacyId: "ph-3", medicineId: "md-1", quantity: 8, minimumStock: 10, price: 30, expiryDate: inDays(150), updatedAt: minutesAgo(120) },
  { id: "iv-11", pharmacyId: "ph-3", medicineId: "md-5", quantity: 18, minimumStock: 6, price: 88, expiryDate: inDays(310), updatedAt: minutesAgo(15) },
  { id: "iv-12", pharmacyId: "ph-3", medicineId: "md-10", quantity: 0, minimumStock: 5, price: 64, expiryDate: inDays(410), updatedAt: minutesAgo(600) },
  // MedPlus
  { id: "iv-13", pharmacyId: "ph-4", medicineId: "md-1", quantity: 15, minimumStock: 12, price: 27, expiryDate: inDays(330), updatedAt: minutesAgo(9) },
  { id: "iv-14", pharmacyId: "ph-4", medicineId: "md-2", quantity: 28, minimumStock: 10, price: 92, expiryDate: inDays(190), updatedAt: minutesAgo(31) },
  { id: "iv-15", pharmacyId: "ph-4", medicineId: "md-4", quantity: 12, minimumStock: 4, price: 228, expiryDate: inDays(260), updatedAt: minutesAgo(58) },
  { id: "iv-16", pharmacyId: "ph-4", medicineId: "md-6", quantity: 22, minimumStock: 8, price: 108, expiryDate: inDays(18), updatedAt: minutesAgo(140) },
  // Kovai Health Point
  { id: "iv-17", pharmacyId: "ph-5", medicineId: "md-3", quantity: 4, minimumStock: 10, price: 47, expiryDate: inDays(220), updatedAt: minutesAgo(210) },
  { id: "iv-18", pharmacyId: "ph-5", medicineId: "md-8", quantity: 30, minimumStock: 10, price: 25, expiryDate: inDays(340), updatedAt: minutesAgo(26) },
  { id: "iv-19", pharmacyId: "ph-5", medicineId: "md-9", quantity: 0, minimumStock: 6, price: 21, expiryDate: inDays(90), updatedAt: minutesAgo(400) },
  // Green Cross (inactive store)
  { id: "iv-20", pharmacyId: "ph-6", medicineId: "md-1", quantity: 11, minimumStock: 10, price: 29, expiryDate: inDays(270), updatedAt: minutesAgo(1440) },
];

/** Fallback map centre when the user has no location (Coimbatore city centre). */
export const DEFAULT_CENTER = { latitude: 11.0168, longitude: 76.9558 };

export const savedLocations = [
  { label: "Gandhipuram, Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  { label: "Peelamedu, Coimbatore", latitude: 11.0246, longitude: 76.9932 },
  { label: "Saibaba Colony, Coimbatore", latitude: 11.0245, longitude: 76.9439 },
  { label: "Thudiyalur, Coimbatore", latitude: 11.0765, longitude: 76.9329 },
  { label: "Ramanathapuram, Coimbatore", latitude: 10.9925, longitude: 76.9814 },
];
