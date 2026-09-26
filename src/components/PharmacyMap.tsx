import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { cn } from "@/lib/utils";
import type { MapViewProps } from "./map/MapView";

/** Leaflet is browser-only: the module is imported after hydration. */
const MapView = lazy(() => import("./map/MapView"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

export function PharmacyMap({ className, ...props }: MapViewProps & { className?: string }) {
  return (
    <div
      className={cn(
        "h-[380px] overflow-hidden rounded-xl border border-border bg-card shadow-card md:h-[520px]",
        className,
      )}
    >
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <MapView {...props} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
