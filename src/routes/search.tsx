import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PillBottle, Search } from "lucide-react";
import { z } from "zod";
import { PageHeader, PublicLayout } from "@/components/PublicLayout";
import { LocationBar } from "@/components/LocationBar";
import { DemoNotice } from "@/components/DemoNotice";
import { MedicineCard } from "@/components/MedicineCard";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataSnapshot } from "@/hooks/useData";
import { useUserLocation } from "@/hooks/useUserLocation";
import { searchAvailability } from "@/services/medicineService";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Medicine search — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Search any medicine and see which nearby pharmacies have it in stock, with quantity, price, distance and last update time.",
      },
      { property: "og:title", content: "Medicine search — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Live medicine availability across nearby pharmacies.",
      },
    ],
  }),
  component: MedicineSearchPage,
});

const distanceOptions = [
  { value: "any", label: "Any distance" },
  { value: "2", label: "Within 2 km" },
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
];

function MedicineSearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const snapshot = useDataSnapshot();
  const { location } = useUserLocation();

  const [term, setTerm] = useState(q);
  const [openOnly, setOpenOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [maxDistance, setMaxDistance] = useState("any");

  const results = useMemo(
    () =>
      searchAvailability(
        {
          query: q,
          origin: location ?? undefined,
          openOnly,
          inStockOnly,
          maxDistanceKm: maxDistance === "any" ? undefined : Number(maxDistance),
        },
        snapshot,
      ),
    [q, location, openOnly, inStockOnly, maxDistance, snapshot],
  );

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Medicine search"
          title="Check medicine availability nearby"
          description="Partial names work. Results are ordered by availability, open status and distance."
        />

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: { q: term.trim() } });
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
              placeholder="Medicine name, salt or category"
              aria-label="Medicine name"
              className="h-11 bg-card pl-9"
            />
          </div>
          <Button type="submit" className="h-11">
            Search
          </Button>
        </form>

        <LocationBar />

        <div className="flex flex-wrap items-center gap-5 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="flex items-center gap-2">
            <Switch id="open-only" checked={openOnly} onCheckedChange={setOpenOnly} />
            <Label htmlFor="open-only" className="text-sm">
              Open stores only
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="stock-only"
              checked={inStockOnly}
              onCheckedChange={setInStockOnly}
            />
            <Label htmlFor="stock-only" className="text-sm">
              Hide out-of-stock
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="distance" className="text-sm">
              Radius
            </Label>
            <Select value={maxDistance} onValueChange={setMaxDistance}>
              <SelectTrigger id="distance" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {distanceOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="ml-auto text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
        </div>

        <DemoNotice />

        {!q ? (
          <EmptyState
            title="Search for a medicine to begin"
            description="Type a brand name, generic salt or category. Try “Paracetamol”, “Amoxicillin” or “Emergency”."
            icon={<PillBottle className="size-5" aria-hidden />}
          />
        ) : results.length === 0 ? (
          <EmptyState
            title={`No pharmacy currently lists “${q}”`}
            description="Try a shorter search term, widen the radius, or turn off the filters above."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpenOnly(false);
                  setInStockOnly(false);
                  setMaxDistance("any");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {results.map((r) => (
              <MedicineCard key={r.id} result={r} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
