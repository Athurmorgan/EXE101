import { useEffect, useState } from 'react';
import type { Region } from '@/types/api';
import { listRegions } from '@/lib/api/regions';

/** Regions barely change — fetch them once per page load and share the promise. */
let cache: Promise<Region[]> | null = null;

function loadRegions(): Promise<Region[]> {
  cache ??= listRegions({ limit: 100 })
    .then((page) => page.data)
    .catch((err: unknown) => {
      cache = null; // let the next mount retry
      throw err;
    });
  return cache;
}

/** Top-level provinces/cities (no districts), cities first, then A–Z. */
export function useRegions(): { regions: Region[]; loading: boolean } {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadRegions()
      .then((all) => {
        if (!active) return;
        const top = all.filter((r) => !r.parentId);
        top.sort((a, b) => Number(b.isCity) - Number(a.isCity) || a.name.localeCompare(b.name));
        setRegions(top);
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { regions, loading };
}
