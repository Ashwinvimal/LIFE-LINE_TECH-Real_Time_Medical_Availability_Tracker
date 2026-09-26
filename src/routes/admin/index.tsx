import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  DoorOpen,
  Package,
  PackageX,
  Pill,
} from "lucide-react";
import { PageHeader } from "@/components/PublicLayout";
import { DemoNotice } from "@/components/DemoNotice";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { Button } from "@/components/ui/button";
import { useDataSnapshot } from "@/hooks/useData";
import { getStats, listInventory, recentUpdates } from "@/services/medicineService";
import { timeAgo } from "@/utils/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Pharmacy operations overview: store count, stock health, low and out-of-stock alerts and recent inventory updates.",
      },
      { property: "og:title", content: "Admin dashboard — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Stock health and recent inventory activity across all pharmacies.",
      },
    ],
  }),
  component: AdminDashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: number;
  icon: typeof Package;
  tone?: "default" | "warning" | "danger" | "success";
  hint?: string;
}) {
  const tones = {
    default: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning",
    danger: "bg-emergency-soft text-emergency",
    success: "bg-success-soft text-success",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AdminDashboard() {
  const snapshot = useDataSnapshot();
  const stats = useMemo(() => getStats(snapshot), [snapshot]);
  const updates = useMemo(() => recentUpdates(6, snapshot), [snapshot]);
  const attention = useMemo(
    () =>
      listInventory(snapshot)
        .filter((r) => r.status !== "available" || r.expiringSoon || r.isExpired)
        .slice(0, 8),
    [snapshot],
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <PageHeader
        eyebrow="Operations"
        title="Pharmacy admin dashboard"
        description="Everything you change here is reflected instantly in patient-facing search results."
        actions={
          <Button asChild>
            <Link to="/admin/inventory">Manage inventory</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total pharmacies"
          value={stats.totalPharmacies}
          icon={Building2}
          hint={`${stats.activePharmacies} active`}
        />
        <StatCard label="Open right now" value={stats.openNow} icon={DoorOpen} tone="success" />
        <StatCard
          label="Medicines tracked"
          value={stats.totalMedicines}
          icon={Pill}
          hint={`${stats.inventoryRows} inventory rows`}
        />
        <StatCard
          label="Low stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          tone="warning"
          hint="At or below minimum level"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Out of stock"
          value={stats.outOfStock}
          icon={PackageX}
          tone="danger"
          hint="Hidden from in-stock searches"
        />
        <StatCard
          label="Expiring or expired"
          value={stats.expiringSoon}
          icon={CalendarClock}
          tone="warning"
          hint="Within the next 30 days"
        />
      </div>

      <DemoNotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card shadow-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-bold">Recent inventory updates</h2>
            <p className="text-xs text-muted-foreground">
              Latest stock edits across all stores
            </p>
          </header>
          <ul className="divide-y divide-border">
            {updates.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.medicine.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.pharmacy.name} · {r.quantity} units
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {timeAgo(r.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-display text-base font-bold">Needs attention</h2>
              <p className="text-xs text-muted-foreground">
                Low, out of stock, or nearing expiry
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/inventory">Open</Link>
            </Button>
          </header>
          <ul className="divide-y divide-border">
            {attention.length === 0 ? (
              <li className="px-5 py-6 text-sm text-muted-foreground">
                All stock levels are healthy.
              </li>
            ) : (
              attention.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.medicine.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.pharmacy.name}
                      {(r.expiringSoon || r.isExpired) &&
                        ` · ${r.isExpired ? "expired" : "expiring soon"}`}
                    </p>
                  </div>
                  <AvailabilityBadge status={r.status} />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
