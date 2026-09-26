import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PublicLayout";
import { DemoNotice } from "@/components/DemoNotice";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataSnapshot } from "@/hooks/useData";
import {
  addInventoryItem,
  adjustQuantity,
  deleteInventoryItem,
  listInventory,
  updateInventoryItem,
} from "@/services/medicineService";
import { listPharmacies } from "@/services/pharmacyService";
import { formatDate, formatPrice, timeAgo } from "@/utils/format";
import type {
  InventoryInput,
  InventoryRecord,
  MedicineCategory,
  MedicineForm,
} from "@/types";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory management — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Add, edit and remove medicines, adjust stock levels, set minimum thresholds and track expiry across every pharmacy.",
      },
      { property: "og:title", content: "Inventory management — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Full stock control for every pharmacy in the network.",
      },
    ],
  }),
  component: InventoryPage,
});

const categories: MedicineCategory[] = [
  "Analgesic",
  "Antibiotic",
  "Antidiabetic",
  "Cardiac",
  "Respiratory",
  "Gastro",
  "Emergency",
  "Vitamin",
];

const forms: MedicineForm[] = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Inhaler",
  "Ointment",
  "Drops",
];

type FormState = {
  pharmacyId: string;
  medicineName: string;
  genericName: string;
  category: MedicineCategory;
  strength: string;
  form: MedicineForm;
  quantity: string;
  minimumStock: string;
  price: string;
  expiryDate: string;
};

const emptyForm = (pharmacyId: string): FormState => ({
  pharmacyId,
  medicineName: "",
  genericName: "",
  category: "Analgesic",
  strength: "",
  form: "Tablet",
  quantity: "0",
  minimumStock: "5",
  price: "0",
  expiryDate: new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10),
});

function validate(f: FormState): string | null {
  if (!f.pharmacyId) return "Choose a pharmacy.";
  if (f.medicineName.trim().length < 2) return "Enter a medicine name.";
  const q = Number(f.quantity);
  const m = Number(f.minimumStock);
  const p = Number(f.price);
  if (!Number.isFinite(q) || q < 0) return "Quantity must be zero or more.";
  if (!Number.isFinite(m) || m < 0) return "Minimum stock must be zero or more.";
  if (!Number.isFinite(p) || p < 0) return "Price must be zero or more.";
  if (!f.expiryDate) return "Pick an expiry date.";
  return null;
}

function InventoryPage() {
  const snapshot = useDataSnapshot();
  const pharmacies = useMemo(() => listPharmacies(snapshot), [snapshot]);
  const rows = useMemo(() => listInventory(snapshot), [snapshot]);

  const [query, setQuery] = useState("");
  const [pharmacyFilter, setPharmacyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(pharmacies[0]?.id ?? ""));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<InventoryRecord | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (
        q &&
        !r.medicine.name.toLowerCase().includes(q) &&
        !r.medicine.genericName.toLowerCase().includes(q)
      )
        return false;
      if (pharmacyFilter !== "all" && r.pharmacyId !== pharmacyFilter) return false;
      if (categoryFilter !== "all" && r.medicine.category !== categoryFilter) return false;
      if (statusFilter === "expiring" && !(r.expiringSoon || r.isExpired)) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "expiring" &&
        r.status !== statusFilter
      )
        return false;
      return true;
    });
  }, [rows, query, pharmacyFilter, categoryFilter, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(pharmacies[0]?.id ?? ""));
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (r: InventoryRecord) => {
    setEditingId(r.id);
    setForm({
      pharmacyId: r.pharmacyId,
      medicineName: r.medicine.name,
      genericName: r.medicine.genericName,
      category: r.medicine.category,
      strength: r.medicine.strength,
      form: r.medicine.form,
      quantity: String(r.quantity),
      minimumStock: String(r.minimumStock),
      price: String(r.price),
      expiryDate: r.expiryDate.slice(0, 10),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const submit = () => {
    const error = validate(form);
    if (error) {
      setFormError(error);
      return;
    }
    const payload: InventoryInput = {
      pharmacyId: form.pharmacyId,
      medicineName: form.medicineName.trim(),
      genericName: form.genericName.trim(),
      category: form.category,
      strength: form.strength.trim(),
      form: form.form,
      quantity: Number(form.quantity),
      minimumStock: Number(form.minimumStock),
      price: Number(form.price),
      expiryDate: form.expiryDate,
    };
    if (editingId) {
      updateInventoryItem(editingId, {
        quantity: payload.quantity,
        minimumStock: payload.minimumStock,
        price: payload.price,
        expiryDate: payload.expiryDate,
        medicineName: payload.medicineName,
      });
      toast.success("Medicine updated", {
        description: `${payload.medicineName} now shows ${payload.quantity} units.`,
      });
    } else {
      addInventoryItem(payload);
      toast.success("Medicine added", {
        description: `${payload.medicineName} is live in patient search.`,
      });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteInventoryItem(deleting.id);
    toast.success("Removed from inventory", {
      description: `${deleting.medicine.name} at ${deleting.pharmacy.name}.`,
    });
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Medicine inventory"
        description="Stock status is derived automatically: above the minimum level is available, at or below it is low stock, zero is out of stock."
        actions={
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            Add medicine
          </Button>
        }
      />

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine"
            aria-label="Search medicine"
            className="pl-9"
          />
        </div>
        <Select value={pharmacyFilter} onValueChange={setPharmacyFilter}>
          <SelectTrigger aria-label="Filter by pharmacy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pharmacies</SelectItem>
            {pharmacies.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger aria-label="Filter by stock status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
            <SelectItem value="expiring">Expiring or expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DemoNotice />

      {filtered.length === 0 ? (
        <EmptyState
          title="No inventory rows match"
          description="Adjust the filters, or add a medicine to this pharmacy."
          action={
            <Button size="sm" onClick={openAdd}>
              Add medicine
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Qty / min</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium">{r.medicine.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.medicine.genericName} · {r.medicine.form} · {r.medicine.category}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{r.pharmacy.name}</TableCell>
                  <TableCell>
                    <AvailabilityBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        aria-label={`Decrease ${r.medicine.name} stock`}
                        onClick={() => adjustQuantity(r.id, -1)}
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </Button>
                      <span className="w-14 text-right text-sm font-semibold">
                        {r.quantity} / {r.minimumStock}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        aria-label={`Increase ${r.medicine.name} stock`}
                        onClick={() => adjustQuantity(r.id, 1)}
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatPrice(r.price)}
                  </TableCell>
                  <TableCell
                    className={
                      r.isExpired
                        ? "text-sm text-destructive"
                        : r.expiringSoon
                          ? "text-sm text-warning"
                          : "text-sm"
                    }
                  >
                    {formatDate(r.expiryDate)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {timeAgo(r.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label={`Edit ${r.medicine.name}`}
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 text-destructive"
                        aria-label={`Delete ${r.medicine.name}`}
                        onClick={() => setDeleting(r)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit medicine" : "Add medicine"}</DialogTitle>
            <DialogDescription>
              Changes appear in patient search results immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="pharmacy">Pharmacy</Label>
              <Select
                value={form.pharmacyId}
                onValueChange={(v) => setForm((f) => ({ ...f, pharmacyId: v }))}
              >
                <SelectTrigger id="pharmacy" className="mt-1.5" disabled={!!editingId}>
                  <SelectValue placeholder="Select pharmacy" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Medicine name</Label>
              <Input
                id="name"
                className="mt-1.5"
                value={form.medicineName}
                onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))}
                placeholder="Paracetamol 500mg"
              />
            </div>
            <div>
              <Label htmlFor="generic">Generic name</Label>
              <Input
                id="generic"
                className="mt-1.5"
                value={form.genericName}
                onChange={(e) => setForm((f) => ({ ...f, genericName: e.target.value }))}
                placeholder="Paracetamol"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as MedicineCategory }))
                }
              >
                <SelectTrigger id="category" className="mt-1.5" disabled={!!editingId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="form">Form</Label>
              <Select
                value={form.form}
                onValueChange={(v) => setForm((f) => ({ ...f, form: v as MedicineForm }))}
              >
                <SelectTrigger id="form" className="mt-1.5" disabled={!!editingId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strength">Strength</Label>
              <Input
                id="strength"
                className="mt-1.5"
                value={form.strength}
                onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value }))}
                placeholder="500 mg"
                disabled={!!editingId}
              />
            </div>
            <div>
              <Label htmlFor="expiry">Expiry date</Label>
              <Input
                id="expiry"
                type="date"
                className="mt-1.5"
                value={form.expiryDate}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                className="mt-1.5"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="minimum">Minimum stock level</Label>
              <Input
                id="minimum"
                type="number"
                min={0}
                className="mt-1.5"
                value={form.minimumStock}
                onChange={(e) => setForm((f) => ({ ...f, minimumStock: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
          </div>

          {formError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editingId ? "Save changes" : "Add medicine"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.medicine.name} will be removed from ${deleting.pharmacy.name} and will disappear from patient search results.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
