import type { OpeningHours, StockStatus } from "@/types";

/** Great-circle distance in kilometres. */
export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km?: number): string {
  if (km === undefined || Number.isNaN(km)) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function isOpenNow(hours: OpeningHours, now = new Date()): boolean {
  if (hours.alwaysOpen) return true;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [oh = 0, om = 0] = hours.opensAt.split(":").map(Number);
  const [ch = 23, cm = 59] = hours.closesAt.split(":").map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  if (close <= open) return minutes >= open || minutes <= close; // spans midnight
  return minutes >= open && minutes <= close;
}

export function formatHours(hours: OpeningHours): string {
  return hours.alwaysOpen ? "Open 24x7" : `${hours.opensAt} – ${hours.closesAt}`;
}

export function stockStatus(quantity: number, minimumStock: number): StockStatus {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= minimumStock) return "low_stock";
  return "available";
}

export const stockLabel: Record<StockStatus, string> = {
  available: "Available",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function formatPrice(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000);
}
