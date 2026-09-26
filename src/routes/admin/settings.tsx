import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PublicLayout";
import { DemoNotice } from "@/components/DemoNotice";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDataSnapshot } from "@/hooks/useData";
import { resetStore } from "@/services/store";
import { getStats } from "@/services/medicineService";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Admin settings — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Data source details, stock classification thresholds and the option to restore the demo dataset.",
      },
      { property: "og:title", content: "Admin settings — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Data source, stock rules and demo data reset.",
      },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const snapshot = useDataSnapshot();
  const stats = getStats(snapshot);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Admin settings"
        description="How availability is calculated and where the data currently lives."
      />

      <DemoNotice />

      <section className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-base font-bold">Stock classification rules</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-success">Available</span> — quantity is
            greater than the minimum stock level.
          </li>
          <li>
            <span className="font-semibold text-warning">Low stock</span> — quantity is
            above zero but at or below the minimum stock level.
          </li>
          <li>
            <span className="font-semibold text-foreground">Out of stock</span> — quantity
            is zero; the item is hidden from in-stock searches.
          </li>
          <li>
            Items expiring within <strong>30 days</strong> are flagged, and expired items are
            excluded from patient results.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-base font-bold">Data source</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The app currently runs on a browser-local demo dataset served through a single
          service layer (<code>medicineService</code>, <code>pharmacyService</code>,{" "}
          <code>locationService</code>). Swapping in a PostgreSQL or REST backend only
          requires changing those service functions — no screen has to be rewritten.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Pharmacies</dt>
            <dd className="font-semibold">{stats.totalPharmacies}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Medicines</dt>
            <dd className="font-semibold">{stats.totalMedicines}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Inventory rows</dt>
            <dd className="font-semibold">{stats.inventoryRows}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Alerts</dt>
            <dd className="font-semibold">{stats.lowStock + stats.outOfStock}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-display text-base font-bold text-destructive">Reset demo data</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Restores the original demo pharmacies, medicines and stock levels. Every change you
          made in this browser is discarded.
        </p>
        <Button
          variant="destructive"
          className="mt-4 gap-1.5"
          onClick={() => setConfirming(true)}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset to demo dataset
        </Button>
      </section>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all data?</AlertDialogTitle>
            <AlertDialogDescription>
              Every pharmacy, medicine and stock edit made in this browser will be replaced
              by the original demo dataset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetStore();
                toast.success("Demo dataset restored");
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
