import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { cn } from '@/lib/cn';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Shown inside the pin; falls back to a dot. */
  label?: string | number;
  /** Popup title. */
  title: string;
  /** Popup subtitle (address, time slot…). */
  subtitle?: string;
  /** Link rendered in the popup. */
  href?: string;
  /** Markers that share a `group` get the same colour and are joined by a line. */
  group?: number;
}

interface PlaceMapProps {
  markers: MapMarker[];
  /** Draw a polyline through markers of each group, in array order. */
  connect?: boolean;
  /** Fit bounds padding in px. */
  padding?: number;
  className?: string;
  /** Called when a marker is clicked. */
  onMarkerClick?: (id: string) => void;
}

/** Colours cycle per `group` (day). Mirrors the app's @theme palette. */
const GROUP_COLOURS = ['#8a6a2e', '#37482f', '#b3382b', '#4d6b2f', '#b39a6a', '#443e2b', '#cfa559'];

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function pinIcon(label: string | number | undefined, colour: string): L.DivIcon {
  const text = label === undefined ? '' : String(label);
  return L.divIcon({
    className: 'vv-pin',
    html: `<span class="vv-pin__body" style="--pin:${colour}">${text ? `<i>${escapeHtml(text)}</i>` : ''}</span>`,
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -34],
  });
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

function popupHtml(m: MapMarker): string {
  const title = escapeHtml(m.title);
  const head = m.href
    ? `<a class="vv-popup__title" href="${escapeHtml(m.href)}">${title}</a>`
    : `<span class="vv-popup__title">${title}</span>`;
  const sub = m.subtitle ? `<span class="vv-popup__sub">${escapeHtml(m.subtitle)}</span>` : '';
  return `<div class="vv-popup">${head}${sub}</div>`;
}

/**
 * Plain Leaflet wrapper on OpenStreetMap tiles — no API key. Markers are numbered
 * pins coloured per group; `connect` joins each group with a dashed line.
 */
export function PlaceMap({
  markers,
  connect = false,
  padding = 40,
  className,
  onMarkerClick,
}: PlaceMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(
      m,
    );
    m.setView([16.05, 108.2], 5);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      layer.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const group = layer.current;
    if (!m || !group) return;
    group.clearLayers();

    const valid = markers.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (valid.length === 0) return;

    const byGroup = new Map<number, L.LatLngExpression[]>();
    for (const p of valid) {
      const g = p.group ?? 0;
      const colour = GROUP_COLOURS[g % GROUP_COLOURS.length] ?? GROUP_COLOURS[0]!;
      const marker = L.marker([p.lat, p.lng], { icon: pinIcon(p.label, colour), title: p.title });
      marker.bindPopup(popupHtml(p), { closeButton: false, maxWidth: 240 });
      if (onMarkerClick) marker.on('click', () => onMarkerClick(p.id));
      marker.addTo(group);
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g)!.push([p.lat, p.lng]);
    }

    if (connect) {
      for (const [g, pts] of byGroup) {
        if (pts.length < 2) continue;
        L.polyline(pts, {
          color: GROUP_COLOURS[g % GROUP_COLOURS.length],
          weight: 2.5,
          opacity: 0.8,
          dashArray: '6 6',
        }).addTo(group);
      }
    }

    const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number]));
    if (valid.length === 1) m.setView(bounds.getCenter(), 15);
    else m.fitBounds(bounds, { padding: [padding, padding], maxZoom: 15 });
  }, [markers, connect, padding, onMarkerClick]);

  // Leaflet measures its container once; resize when layout changes (tabs, grids).
  useEffect(() => {
    if (!el.current || !map.current) return;
    const ro = new ResizeObserver(() => map.current?.invalidateSize());
    ro.observe(el.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={el}
      role="region"
      aria-label="Map"
      className={cn(
        'vv-map h-80 w-full overflow-hidden rounded-lg border border-ink/15 bg-cream',
        className,
      )}
    />
  );
}
