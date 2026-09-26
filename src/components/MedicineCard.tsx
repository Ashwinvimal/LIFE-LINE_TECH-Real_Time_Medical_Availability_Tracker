import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge, OpenStatusBadge } from "@/components/AvailabilityBadge";
import { directionsUrl } from "@/services/pharmacyService";
import { formatDistance, formatPrice, timeAgo } from "@/utils/format";
import type { AvailabilityResult } from "@/types";

export function MedicineCard({ result }: { result: AvailabilityResult }) {
  const { medicine, pharmacy } = result;
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lifted">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold">{medicine.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {medicine.genericName} · {medicine.form} · {medicine.category}
          </p>
        </div>
        <AvailabilityBadge status={result.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Quantity</dt>
          <dd className="text-sm font-semibold">
            {result.quantity > 0 ? `${result.quantity} units` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Price</dt>
          <dd className="text-sm font-semibold">{formatPrice(result.price)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Distance</dt>
          <dd className="text-sm font-semibold">{formatDistance(result.distanceKm)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Updated</dt>
          <dd className="flex items-center gap-1 text-sm font-semibold">
            <Clock className="size-3.5 text-muted-foreground" aria-hidden />
            {timeAgo(result.updatedAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="size-4 text-primary" aria-hidden />
            {pharmacy.name}
            <OpenStatusBadge isOpen={result.isOpenNow} className="ml-1" />
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {pharmacy.address}, {pharmacy.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href={`tel:${pharmacy.phone.replace(/\s/g, "")}`}>
              <Phone className="size-4" aria-hidden />
              Call
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href={directionsUrl(pharmacy)} target="_blank" rel="noreferrer">
              <Navigation className="size-4" aria-hidden />
              Directions
            </a>
          </Button>
          <Button asChild size="sm">
            <Link to="/pharmacy/$id" params={{ id: pharmacy.id }}>
              View store
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
