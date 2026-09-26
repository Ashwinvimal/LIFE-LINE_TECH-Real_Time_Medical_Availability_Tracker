import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import { PageHeader, PublicLayout } from "@/components/PublicLayout";
import { LocationBar } from "@/components/LocationBar";
import { DemoNotice } from "@/components/DemoNotice";
import { PharmacyCard } from "@/components/PharmacyCard";
import { PharmacyMap } from "@/components/PharmacyMap";
import { EmptyState } from "@/components/states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDataSnapshot } from "@/hooks/useData";
import { useUserLocation } from "@/hooks/useUserLocation";
import { nearbyPharmacies } from "@/services/pharmacyService";
import { DEFAULT_CENTER } from "@/data/mockData";

export const Route = createFileRoute("/pharmacies")({
  head: () => ({
    meta: [
      { title: "Nearby pharmacies — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Browse nearby medical stores on an interactive map with opening status, distance, contact details and stock update times.",
      },
      { property: "og:title", content: "Nearby pharmacies — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Interactive map of nearby medical stores with live stock update times.",
      },
    ],
  }),
  component: NearbyPharmaciesPage,
});

function NearbyPharmaciesPage() {
  const snapshot = useDataSnapshot();
  const { location } = useUserLocation();
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const pharmacies = useMemo(
    () => nearbyPharmacies({ origin: location ?? undefined, query, openOnly }, snapshot),
    [snapshot, location, query, openOnly],
  );

  const center = location ?? DEFAULT_CENTER;

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Nearby stores"
          title="Medical stores around you"
          description="Markers are colour-coded: teal for open stores, grey for closed, red for the store you selected."
        />

        <LocationBar />

        <PharmacyMap
          center={center}
          userLocation={location}
          pharmacies={pharmacies}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="relative min-w-56 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by store name or area"
              aria-label="Filter pharmacies"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="open-now" checked={openOnly} onCheckedChange={setOpenOnly} />
            <Label htmlFor="open-now" className="text-sm">
              Open now only
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {pharmacies.length} store{pharmacies.length === 1 ? "" : "s"}
          </p>
        </div>

        <DemoNotice />

        {pharmacies.length === 0 ? (
          <EmptyState
            title="No stores match this filter"
            description="Clear the search box or switch off “Open now only”."
            icon={<Building2 className="size-5" aria-hidden />}
          />
        ) : (
          <div className="grid gap-4">
            {pharmacies.map((p) => (
              <PharmacyCard
                key={p.id}
                pharmacy={p}
                selected={p.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
