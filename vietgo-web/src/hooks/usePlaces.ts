import { useEffect, useState } from 'react';
import type { Place } from '@/types/api';
import { searchPlaces, type PlaceSearchParams } from '@/lib/api/places';
import { MOCK_PLACES } from '@/data/mockPlaces';

interface UsePlacesResult {
  places: Place[];
  loading: boolean;
  error: string | null;
  /** `mock` when the BE wasn't reachable and we fell back to sample data. */
  source: 'api' | 'mock';
}

/**
 * Same graceful-degrade pattern the BE itself uses for the AI service
 * (see `docs/PROJECT_STATUS.md` §11, lesson 13): never let an unreachable
 * dependency crash the view — fall back to something that still renders.
 */
export function usePlaces(params: PlaceSearchParams = {}): UsePlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'mock'>('api');
  const key = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    searchPlaces(params)
      .then((res) => {
        if (!active) return;
        setPlaces(res.data);
        setSource('api');
      })
      .catch(() => {
        if (!active) return;
        const q = params.q?.toLowerCase();
        setPlaces(
          MOCK_PLACES.filter(
            (p) =>
              (!q || p.name.toLowerCase().includes(q)) &&
              (!params.category || p.category === params.category) &&
              (params.isHiddenPlace === undefined || p.isHiddenPlace === params.isHiddenPlace),
          ),
        );
        setSource('mock');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // `params` is re-serialized into `key` on purpose — searchPlaces takes a
    // fresh object each render otherwise and this would refetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { places, loading, error, source };
}
