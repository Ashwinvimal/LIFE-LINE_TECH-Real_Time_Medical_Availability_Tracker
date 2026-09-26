import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PublicLayout";
import { DemoNotice } from "@/components/DemoNotice";
import { OpenStatusBadge } from "@/components/AvailabilityBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  addPharmacy,
  deletePharmacy,
  nearbyPharmacies,
  updatePharmacy,
} from "@/services/pharmacyService";
import { formatHours } from "@/utils/format";
import type { Pharmacy } from "@/types";

export const Route = createFileRoute("/admin/pharmacies")({
  head: () => ({
    meta: [
      { title: "Pharmacy management — LIFE-LINE-TECH" },
      {
        name: "description",
        content:
          "Register medical stores, edit their address, coordinates, phone number and opening hours, and control whether they appear to patients.",
      },
      { property: "og:title", content: "Pharmacy management — LIFE-LINE-TECH" },
      {
        property: "og:description",
        content: "Register and maintain the medical stores listed in the directory.",
      },
    ],
  }),
  component: AdminPharmaciesPage,
});

type FormState = {
  name: string;
  address: string;
  city: string;
  phone: string;
  licenseNo: string;
  latitude: string;
  longitude: string;
  opensAt: string;
  closesAt: string;
  alwaysOpen: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  address: "",
  city: "Coimbatore",
  phone: "",
  licenseNo: "",
  latitude: "11.0168",
  longitude: "76.9558",
  opensAt: "09:00",
  closesAt: "21:00",
  alwaysOpen: false,
  isActive: true,
};

function validate(f: FormState): string | null {
  if (f.name.trim().length < 3) return "Enter the store name.";
  if (f.address.trim().length < 5) return "Enter the full address.";
  if (!/^[+\d][\d\s-]{6,}$/.test(f.phone.trim())) return "Enter a valid phone number.";
  const lat = Number(f.latitude);
  const lng = Number(f.longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return "Latitude must be between -90 and 90.";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180)
    return "Longitude must be between -180 and 180.";
  return null;
}

function AdminPharmaciesPage() {
  const snapshot = useDataSnapshot();
  const pharmacies = useMemo(
    () => nearbyPharmacies({ includeInactive: true }, snapshot),
    [snapshot],
  );

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Pharmacy | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  };

  const openEdit = (p: Pharmacy) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      address: p.address,
      city: p.city,
      phone: p.phone,
      licenseNo: p.licenseNo,
      latitude: String(p.latitude),
      longitude: String(p.longitude),
      opensAt: p.openingHours.opensAt,
      closesAt: p.openingHours.closesAt,
      alwaysOpen: p.openingHours.alwaysOpen,
      isActive: p.isActive,
    });
    setError(null);
    setOpen(true);
  };

  const submit = () => {
    const err = validate(form);
    if (err) {
      setError(err);
      return;
    }
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      licenseNo: form.licenseNo.trim() || "—",
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      openingHours: {
        opensAt: form.opensAt,
        closesAt: form.closesAt,
        alwaysOpen: form.alwaysOpen,
      },
      isActive: form.isActive,
    };
    if (editingId) {
      updatePharmacy(editingId, payload);
      toast.success("Pharmacy updated", { description: payload.name });
    } else {
      addPharmacy(payload);
      toast.success("Pharmacy registered", {
        description: `${payload.name} is now in the directory.`,
      });
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deletePharmacy(deleting.id);
    toast.success("Pharmacy removed", {
      description: `${deleting.name} and its inventory were deleted.`,
    });
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Network"
        title="Pharmacy management"
        description="Inactive stores stay in the console but disappear from patient search and the map."
        actions={
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            Add pharmacy
          </Button>
        }
      />

      <DemoNotice />

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pharmacies.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.address}, {p.city}
                  </p>
                </TableCell>
                <TableCell className="text-sm">{formatHours(p.openingHours)}</TableCell>
                <TableCell>
                  <OpenStatusBadge isOpen={p.isOpenNow} />
                </TableCell>
                <TableCell className="text-sm">{p.phone}</TableCell>
                <TableCell className="text-right text-sm">{p.itemCount}</TableCell>
                <TableCell>
                  <Switch
                    checked={p.isActive}
                    aria-label={`Toggle visibility for ${p.name}`}
                    onCheckedChange={(v) => {
                      updatePharmacy(p.id, { isActive: v });
                      toast.success(v ? "Store is now visible" : "Store hidden from patients", {
                        description: p.name,
                      });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label={`Edit ${p.name}`}
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 text-destructive"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => setDeleting(p)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit pharmacy" : "Add pharmacy"}</DialogTitle>
            <DialogDescription>
              Coordinates place the store marker on the patient map.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="ph-name">Store name</Label>
              <Input
                id="ph-name"
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ph-address">Address</Label>
              <Input
                id="ph-address"
                className="mt-1.5"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ph-city">City</Label>
              <Input
                id="ph-city"
                className="mt-1.5"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ph-phone">Phone</Label>
              <Input
                id="ph-phone"
                className="mt-1.5"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98400 11223"
              />
            </div>
            <div>
              <Label htmlFor="ph-lat">Latitude</Label>
              <Input
                id="ph-lat"
                className="mt-1.5"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ph-lng">Longitude</Label>
              <Input
                id="ph-lng"
                className="mt-1.5"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ph-license">Licence number</Label>
              <Input
                id="ph-license"
                className="mt-1.5"
                value={form.licenseNo}
                onChange={(e) => setForm((f) => ({ ...f, licenseNo: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="ph-24"
                  checked={form.alwaysOpen}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, alwaysOpen: v }))}
                />
                <Label htmlFor="ph-24">Open 24x7</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ph-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
                <Label htmlFor="ph-active">Visible</Label>
              </div>
            </div>
            {!form.alwaysOpen && (
              <>
                <div>
                  <Label htmlFor="ph-open">Opens at</Label>
                  <Input
                    id="ph-open"
                    type="time"
                    className="mt-1.5"
                    value={form.opensAt}
                    onChange={(e) => setForm((f) => ({ ...f, opensAt: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ph-close">Closes at</Label>
                  <Input
                    id="ph-close"
                    type="time"
                    className="mt-1.5"
                    value={form.closesAt}
                    onChange={(e) => setForm((f) => ({ ...f, closesAt: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editingId ? "Save changes" : "Add pharmacy"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this pharmacy?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.name} and all of its inventory rows will be permanently removed.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
