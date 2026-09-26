import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, Navigation, Phone, Search } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { DemoNotice } from "@/components/DemoNotice";
import { PharmacyMap } from "@/components/PharmacyMap";
import { AvailabilityBadge, OpenStatusBadge } from "@/components/AvailabilityBadge";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataSnapshot } from "@/hooks/useData";
import { useUserLocation } from "@/hooks/useUserLocation";
import { directionsUrl, nearbyPharmacies } from "@/services/pharmacyService";
import { inventoryForPharmacy } from "@/services/medicineService";
import {
  formatDate,
  formatDistance,
  formatHours,
  formatPrice,
  timeAgo,
} from "@/utils/format";

export const Route = createFileRoute("/pharmacy/$id")({
  head: () => ({
    meta: [
      { title: "Pharmacy details — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Opening hours, contact details, distance and the full medicine stock list for this medical store.",
      },
      { property: "og:title", content: "Pharmacy details — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Store hours, contact details and live medicine stock for this pharmacy.",
      },
    ],
  }),
  component: PharmacyDetailsPage,
});

function PharmacyDetailsPage() {
  const { id } = Route.useParams();
  const snapshot = useDataSnapshot();
  const { location } = useUserLocation();
  const [filter, setFilter] = useState("");

  const pharmacy = useMemo(
    () =>
      nearbyPharmacies({ origin: location ?? undefined, includeInactive: true }, snapshot).find(
        (p) => p.id === id,
      ),
    [snapshot, location, id],
  );

  const items = useMemo(() => {
    const rows = inventoryForPharmacy(id, snapshot);
    const q = filter.trim().toLowerCase();
    return q
      ? rows.filter(
          (r) =>
            r.medicine.name.toLowerCase().includes(q) ||
            r.medicine.genericName.toLowerCase().includes(q),
        )
      : rows;
  }, [snapshot, id, filter]);

  if (!pharmacy) {
    return (
      <PublicLayout>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <EmptyState
            title="This pharmacy is no longer listed"
            description="It may have been removed from the directory."
            action={
              <Button asChild size="sm">
                <Link to="/pharmacies">Back to nearby stores</Link>
              </Button>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <Link
          to="/pharmacies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All nearby stores
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-extrabold">{pharmacy.name}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden />
                  {pharmacy.address}, {pharmacy.city}
                </p>
              </div>
              <OpenStatusBadge isOpen={pharmacy.isOpenNow} />
            </div>

            {!pharmacy.isActive && (
              <p className="mt-4 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
                This store is marked inactive by the operator, so it is hidden from patient
                search results.
              </p>
            )}

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Distance</dt>
                <dd className="font-semibold">{formatDistance(pharmacy.distanceKm)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Opening hours</dt>
                <dd className="font-semibold">{formatHours(pharmacy.openingHours)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Licence</dt>
                <dd className="font-semibold">{pharmacy.licenseNo}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Stock updated</dt>
                <dd className="flex items-center gap-1 font-semibold">
                  <Clock className="size-3.5 text-muted-foreground" aria-hidden />
                  {pharmacy.lastUpdatedAt ? timeAgo(pharmacy.lastUpdatedAt) : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="gap-1.5">
                <a href={directionsUrl(pharmacy)} target="_blank" rel="noreferrer">
                  <Navigation className="size-4" aria-hidden />
                  Get directions
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-1.5">
                <a href={`tel:${pharmacy.phone.replace(/\s/g, "")}`}>
                  <Phone className="size-4" aria-hidden />
                  {pharmacy.phone}
                </a>
              </Button>
            </div>
          </div>

          <PharmacyMap
            className="h-[320px] md:h-full"
            center={pharmacy}
            userLocation={location}
            pharmacies={[pharmacy]}
            selectedId={pharmacy.id}
          />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold">Medicines at this store</h2>
              <p className="text-xs text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"} reported by the pharmacy
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter medicines"
                aria-label="Filter medicines at this store"
                className="pl-9"
              />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No medicines match"
                description="This store has not listed a medicine with that name."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">{r.medicine.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.medicine.genericName} · {r.medicine.form}
                        </p>
                      </TableCell>
                      <TableCell>
                        <AvailabilityBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">{r.quantity}</TableCell>
                      <TableCell className="text-right">{formatPrice(r.price)}</TableCell>
                      <TableCell className={r.expiringSoon ? "text-warning" : undefined}>
                        {formatDate(r.expiryDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {timeAgo(r.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DemoNotice />
      </div>
    </PublicLayout>
  );
}
