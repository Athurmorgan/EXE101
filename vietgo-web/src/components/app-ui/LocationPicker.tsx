import { useState } from 'react';
import { Loader2, LocateFixed } from 'lucide-react';
import { useGeolocation, type GeoFix } from '@/hooks/useSubmitPlace';
import { cn } from '@/lib/cn';
import { Alert } from './Alert';
import { Button } from './Button';
import { PlaceMap, type MapMarker } from './PlaceMap';

export interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  /** The pin the user is placing. */
  value: LatLng | null;
  onChange: (point: LatLng) => void;
  /** Where the browser said the user was when they pressed "Use my location". */
  checkin?: GeoFix | null;
  onCheckin?: (fix: GeoFix) => void;
  className?: string;
}

/**
 * Pick a coordinate: one press takes the browser's GPS fix (kept as check-in evidence),
 * then the pin can be nudged by dragging it or tapping the map.
 */
export function LocationPicker({
  value,
  onChange,
  checkin,
  onCheckin,
  className,
}: LocationPickerProps) {
  const { locating, locate } = useGeolocation();
  const [error, setError] = useState<string | null>(null);

  async function useMyLocation() {
    setError(null);
    try {
      const fix = await locate();
      onCheckin?.(fix);
      onChange({ lat: fix.lat, lng: fix.lng });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const markers: MapMarker[] = [];
  if (checkin) {
    markers.push({
      id: 'me',
      lat: checkin.lat,
      lng: checkin.lng,
      title: 'You are here',
      variant: 'dot',
    });
  }
  if (value) {
    markers.push({
      id: 'pin',
      lat: value.lat,
      lng: value.lng,
      title: 'The place',
      subtitle: 'Drag to adjust',
    });
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden />
          )}
          Use my location
        </Button>
        <p className="text-xs text-muted">
          {value
            ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
            : 'Tap the map or use your location.'}
          {checkin && ` · GPS accuracy ±${Math.round(checkin.accuracyM)} m`}
        </p>
      </div>
      {error && <Alert>{error}</Alert>}
      <PlaceMap
        className="h-72"
        markers={markers}
        draggable
        fitOnChange="ids"
        onMapClick={(lat, lng) => onChange({ lat, lng })}
        onMarkerDrag={(id, lat, lng) => {
          if (id === 'pin') onChange({ lat, lng });
        }}
      />
    </div>
  );
}
