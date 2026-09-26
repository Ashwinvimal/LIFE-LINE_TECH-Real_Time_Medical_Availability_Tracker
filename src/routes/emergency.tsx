import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Search, Siren } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { LocationBar } from "@/components/LocationBar";
import { DemoNotice } from "@/components/DemoNotice";
import { MedicineCard } from "@/components/MedicineCard";
import { PharmacyMap } from "@/components/PharmacyMap";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataSnapshot } from "@/hooks/useData";
import { useUserLocation } from "@/hooks/useUserLocation";
import { searchEmergency } from "@/services/medicineService";
import { nearbyPharmacies } from "@/services/pharmacyService";
import { DEFAULT_CENTER } from "@/data/mockData";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency mode — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Emergency mode shows only open pharmacies that currently have the medicine in stock, nearest first, with call and directions shortcuts.",
      },
      { property: "og:title", content: "Emergency mode — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Open pharmacies with the medicine in stock, nearest first.",
      },
    ],
  }),
  component: EmergencyPage,
});

const quickPicks = ["Adrenaline", "Salbutamol", "ORS", "Paracetamol"];

function EmergencyPage() {
  const snapshot = useDataSnapshot();
  const { location } = useUserLocation();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchEmergency(query, location ?? undefined, snapshot),
    [query, location, snapshot],
  );

  const openStores = useMemo(
    () => nearbyPharmacies({ origin: location ?? undefined, openOnly: true }, snapshot),
    [snapshot, location],
  );

  return (
    <PublicLayout>
      <section className="border-b border-emergency/25 bg-emergency-soft">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emergency px-3 py-1 text-xs font-bold uppercase tracking-wide text-emergency-foreground">
            <Siren className="size-3.5" aria-hidden />
            Emergency mode
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-emergency">
            Open pharmacies with stock, nearest first
          </h1>
          <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-emergency" aria-hidden />
            LIFE-LINE-TECH is an information and discovery tool only. For a
            life-threatening emergency, call your local emergency number or go to the
            nearest hospital immediately — do not wait for a search result.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(term.trim());
          }}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Medicine needed right now"
              aria-label="Medicine needed"
              className="h-12 bg-card pl-9"
            />
          </div>
          <Button type="submit" variant="destructive" size="lg" className="h-12">
            Find it now
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {quickPicks.map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => {
                setTerm(p);
                setQuery(p);
              }}
            >
              {p}
            </Button>
          ))}
        </div>

        <LocationBar />
        <DemoNotice />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold">
              {query ? `Stock for “${query}”` : "Start by naming the medicine"}
            </h2>
            {!query ? (
              <EmptyState
                title="Tell us what you need"
                description="Emergency mode hides closed stores and out-of-stock items automatically."
                icon={<Siren className="size-5" aria-hidden />}
              />
            ) : results.length === 0 ? (
              <EmptyState
                title="No open store currently reports this medicine"
                description="Call the nearest open pharmacies listed here directly, or check the full search where closed stores are also shown."
                icon={<AlertTriangle className="size-5" aria-hidden />}
              />
            ) : (
              results.map((r) => <MedicineCard key={r.id} result={r} />)
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold">Open stores near you</h2>
            <PharmacyMap
              className="h-[300px] md:h-[300px]"
              center={location ?? DEFAULT_CENTER}
              userLocation={location}
              pharmacies={openStores}
            />
            <ul className="space-y-2">
              {openStores.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${p.phone.replace(/\s/g, "")}`}>Call</a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
