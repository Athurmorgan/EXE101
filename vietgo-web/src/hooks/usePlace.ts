import { useEffect, useState } from 'react';
import type { Place } from '@/types/api';
import { getPlace } from '@/lib/api/places';
import { findMockPlace } from '@/data/mockPlaces';

interface UsePlaceResult {
  place: Place | null;
  loading: boolean;
  source: 'api' | 'mock';
}

export function usePlace(id: string): UsePlaceResult {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'mock'>('api');

  useEffect(() => {
    let active = true;
    setLoading(true);

    getPlace(id)
      .then((res) => {
        if (!active) return;
        setPlace(res);
        setSource('api');
      })
      .catch(() => {
        if (!active) return;
        setPlace(findMockPlace(id) ?? null);
        setSource('mock');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { place, loading, source };
}
