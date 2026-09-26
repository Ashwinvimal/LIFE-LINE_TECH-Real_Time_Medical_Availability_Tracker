import { Crosshair, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { manualAreas } from "@/services/locationService";
import { useUserLocation } from "@/hooks/useUserLocation";

/** GPS detection plus a manual fallback so location refusal never blocks the app. */
export function LocationBar() {
  const { location, source, status, error, detect, setManual } = useUserLocation();

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {location ? location.label : "Location not set"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {location
                ? source === "gps"
                  ? "Using your device GPS — distances are approximate."
                  : "Using a manually selected area."
                : "Allow location or choose an area to sort results by distance."}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Select
            value={source === "manual" ? location?.label : undefined}
            onValueChange={(label) => {
              const area = manualAreas.find((a) => a.label === label);
              if (area) setManual(area);
            }}
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Choose an area manually">
              <SelectValue placeholder="Choose area manually" />
            </SelectTrigger>
            <SelectContent>
              {manualAreas.map((a) => (
                <SelectItem key={a.label} value={a.label}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={detect}
            disabled={status === "locating"}
            className="gap-1.5 whitespace-nowrap"
          >
            <Crosshair className="size-4" aria-hidden />
            {status === "locating" ? "Locating…" : "Use my location"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
          {error}
        </p>
      )}
    </div>
  );
}
