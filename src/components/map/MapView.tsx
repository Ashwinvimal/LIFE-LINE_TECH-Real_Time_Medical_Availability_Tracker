import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { PharmacyWithDistance } from "@/types";
import { formatDistance, formatHours } from "@/utils/format";

export interface MapViewProps {
  center: { latitude: number; longitude: number };
  userLocation?: { latitude: number; longitude: number } | null;
  pharmacies: PharmacyWithDistance[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

function pin(color: string, ring: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:${color};box-shadow:0 0 0 4px ${ring},0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const openIcon = pin("oklch(0.52 0.113 202)", "oklch(0.52 0.113 202 / 25%)");
const closedIcon = pin("oklch(0.62 0.02 240)", "oklch(0.62 0.02 240 / 22%)");
const selectedIcon = pin("oklch(0.55 0.215 22)", "oklch(0.55 0.215 22 / 28%)");
const userIcon = pin("oklch(0.55 0.13 155)", "oklch(0.55 0.13 155 / 28%)");

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function MapView({
  center,
  userLocation,
  pharmacies,
  selectedId,
  onSelect,
}: MapViewProps) {
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={center.latitude} lng={center.longitude} />

      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userIcon}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {pharmacies.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={
            p.id === selectedId ? selectedIcon : p.isOpenNow ? openIcon : closedIcon
          }
          eventHandlers={{ click: () => onSelect?.(p.id) }}
        >
          <Popup>
            <div className="space-y-1 text-[13px]">
              <p className="font-semibold">{p.name}</p>
              <p className="text-muted-foreground">{p.address}</p>
              <p>
                {p.isOpenNow ? "Open now" : "Closed"} · {formatHours(p.openingHours)}
              </p>
              <p>
                {p.itemCount} medicines listed · {formatDistance(p.distanceKm)}
              </p>
              <p>
                <a href={`tel:${p.phone.replace(/\s/g, "")}`}>{p.phone}</a>
              </p>
              <p>
                <a
                  href={`https://www.openstreetmap.org/directions?to=${p.latitude},${p.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </a>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
