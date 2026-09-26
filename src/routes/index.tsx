import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  MapPin,
  Search,
  ShieldCheck,
  Siren,
  Timer,
} from "lucide-react";
import heroImage from "@/assets/pharmacy-hero.jpg";
import { PublicLayout } from "@/components/PublicLayout";
import { LocationBar } from "@/components/LocationBar";
import { DemoNotice } from "@/components/DemoNotice";
import { PharmacyCard } from "@/components/PharmacyCard";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataSnapshot } from "@/hooks/useData";
import { useUserLocation } from "@/hooks/useUserLocation";
import { nearbyPharmacies } from "@/services/pharmacyService";
import { getStats, listMedicines } from "@/services/medicineService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIFE-LINE-TECH — Find medicines available near you" },
      {
        name: "description",
        content:
          "Search a medicine, see which nearby pharmacies have it in stock right now, with distance, opening status and last stock update.",
      },
      { property: "og:title", content: "LIFE-LINE-TECH — Find medicines available near you" },
      {
        property: "og:description",
        content:
          "Real-time medicine availability across nearby pharmacies, with an interactive map and emergency mode.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const snapshot = useDataSnapshot();
  const { location } = useUserLocation();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const stats = useMemo(() => getStats(snapshot), [snapshot]);
  const suggestions = useMemo(
    () => listMedicines(snapshot).slice(0, 6),
    [snapshot],
  );
  const nearby = useMemo(
    () =>
      nearbyPharmacies({ origin: location ?? undefined, maxDistanceKm: undefined }, snapshot).slice(
        0,
        3,
      ),
    [snapshot, location],
  );

  return (
    <PublicLayout>
      <section className="hero-grid border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Timer className="size-3.5" aria-hidden />
              Stock updated by pharmacies in real time
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Know which pharmacy actually has your medicine
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              LIFE-LINE-TECH connects patients with nearby medical stores and shows live
              stock levels, distance, opening hours and the last inventory update — so you
              stop calling shop after shop.
            </p>

            <form
              className="mt-7 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/search", search: { q: query.trim() } });
              }}
            >
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a medicine, e.g. Paracetamol"
                  aria-label="Search a medicine"
                  className="h-12 bg-card pl-9"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 gap-1.5">
                Check availability
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Common searches:</span>
              {suggestions.map((m) => (
                <Link
                  key={m.id}
                  to="/search"
                  search={{ q: m.genericName }}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary"
                >
                  {m.genericName}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="destructive" size="lg" className="gap-2">
                <Link to="/emergency">
                  <Siren className="size-4" aria-hidden />
                  Emergency mode
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/pharmacies">
                  <MapPin className="size-4" aria-hidden />
                  Nearby medical stores
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Pharmacist at a medical store counter"
              width={1600}
              height={1104}
              className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-lifted"
            />
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Pharmacies", value: stats.activePharmacies },
                { label: "Open now", value: stats.openNow },
                { label: "Medicines tracked", value: stats.totalMedicines },
                { label: "Low stock alerts", value: stats.lowStock },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card px-3 py-3 text-center shadow-card"
                >
                  <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-xl font-extrabold text-primary">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-12 sm:px-6">
        <LocationBar />
        <DemoNotice />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Search by name or salt",
              body: "Partial names work — type “para” and every matching brand or generic shows up with its stock level.",
            },
            {
              icon: MapPin,
              title: "Sorted by distance",
              body: "Allow location once and results reorder by how far each store is, on a map and in the list.",
            },
            {
              icon: ShieldCheck,
              title: "Transparent stock",
              body: "Every result shows the quantity on hand and exactly when the pharmacy last updated it.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-base font-bold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold">Medical stores near you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {location
                ? "Closest active stores based on your selected location."
                : "Set a location above to sort these stores by distance."}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/pharmacies">View all stores</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-4">
          {nearby.length === 0 ? (
            <EmptyState
              title="No active pharmacies yet"
              description="Add a pharmacy from the admin console to see it here."
              icon={<Building2 className="size-5" aria-hidden />}
              action={
                <Button asChild size="sm">
                  <Link to="/admin/pharmacies">Open admin console</Link>
                </Button>
              }
            />
          ) : (
            nearby.map((p) => <PharmacyCard key={p.id} pharmacy={p} />)
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 py-8">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-extrabold">Run a pharmacy?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your counter stock honest in seconds. The admin console tracks stock
              levels, minimum thresholds, expiry dates and flags every low or out-of-stock
              item automatically.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/admin">
              <ClipboardList className="size-4" aria-hidden />
              Open admin dashboard
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
