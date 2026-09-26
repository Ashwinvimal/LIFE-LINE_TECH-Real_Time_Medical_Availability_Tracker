import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { stockLabel } from "@/utils/format";
import type { StockStatus } from "@/types";

const styles: Record<StockStatus, string> = {
  available: "bg-success-soft text-success border-success/25",
  low_stock: "bg-warning-soft text-warning border-warning/25",
  out_of_stock: "bg-muted text-muted-foreground border-border",
};

const icons: Record<StockStatus, typeof CheckCircle2> = {
  available: CheckCircle2,
  low_stock: AlertTriangle,
  out_of_stock: XCircle,
};

export function AvailabilityBadge({
  status,
  className,
}: {
  status: StockStatus;
  className?: string;
}) {
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {stockLabel[status]}
    </span>
  );
}

export function OpenStatusBadge({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        isOpen
          ? "border-success/25 bg-success-soft text-success"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", isOpen ? "bg-success" : "bg-muted-foreground")}
      />
      {isOpen ? "Open now" : "Closed"}
    </span>
  );
}
