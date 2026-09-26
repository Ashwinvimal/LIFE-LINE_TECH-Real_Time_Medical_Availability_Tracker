import { Link } from "@tanstack/react-router";
import { Navigation, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenStatusBadge } from "@/components/AvailabilityBadge";
import { directionsUrl } from "@/services/pharmacyService";
import { cn } from "@/lib/utils";
import { formatDistance, formatHours, timeAgo } from "@/utils/format";
import type { PharmacyWithDistance } from "@/types";

export function PharmacyCard({
  pharmacy,
  selected,
  onSelect,
}: {
  pharmacy: PharmacyWithDistance;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <article
      onMouseEnter={() => onSelect?.(pharmacy.id)}
      className={cn(
        "rounded-xl border bg-card p-5 shadow-card transition-all",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:shadow-lifted",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold">{pharmacy.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pharmacy.address}, {pharmacy.city}
          </p>
        </div>
        <OpenStatusBadge isOpen={pharmacy.isOpenNow} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="font-semibold">{formatDistance(pharmacy.distanceKm)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hours</p>
          <p className="font-semibold">{formatHours(pharmacy.openingHours)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Medicines listed</p>
          <p className="flex items-center gap-1 font-semibold">
            <Package className="size-3.5 text-muted-foreground" aria-hidden />
            {pharmacy.itemCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Stock updated</p>
          <p className="font-semibold">
            {pharmacy.lastUpdatedAt ? timeAgo(pharmacy.lastUpdatedAt) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button asChild size="sm">
          <Link to="/pharmacy/$id" params={{ id: pharmacy.id }}>
            View details
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={`tel:${pharmacy.phone.replace(/\s/g, "")}`}>
            <Phone className="size-4" aria-hidden />
            {pharmacy.phone}
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={directionsUrl(pharmacy)} target="_blank" rel="noreferrer">
            <Navigation className="size-4" aria-hidden />
            Directions
          </a>
        </Button>
      </div>
    </article>
  );
}
