import { useCallback, useEffect, useState } from 'react';
import type { ShortlistItem } from '@/types/api';
import { listShortlist, removeFromShortlist, reorderShortlist, updateShortlistNotes } from '@/lib/api/shortlist';

interface UseShortlistResult {
  items: ShortlistItem[];
  loading: boolean;
  error: string | null;
  remove: (id: string) => Promise<void>;
  saveNotes: (id: string, notes: string) => Promise<void>;
  /** Swap an item with its neighbour; rolls back if the BE refuses. */
  move: (index: number, direction: -1 | 1) => Promise<void>;
}

export function useShortlist(): UseShortlistResult {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listShortlist()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load your shortlist.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeFromShortlist(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const saveNotes = useCallback(async (id: string, notes: string) => {
    await updateShortlistNotes(id, notes);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, notes } : item)));
  }, []);

  const move = useCallback(
    async (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= items.length) return;
      const previous = items;
      const next = [...items];
      const [moved] = next.splice(index, 1);
      if (!moved) return;
      next.splice(target, 0, moved);
      setItems(next);
      try {
        await reorderShortlist(next.map((item) => item.placeId));
      } catch (err) {
        setItems(previous);
        setError(err instanceof Error ? err.message : 'Could not reorder.');
      }
    },
    [items],
  );

  return { items, loading, error, remove, saveNotes, move };
}
