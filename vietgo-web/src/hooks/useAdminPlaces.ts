import { useState } from 'react';
import { useAsync } from './useAsync';
import { useMutation } from './useMutation';
import { deletePlace, getPlace, searchPlaces, updatePlace, type PlaceSearchParams } from '@/lib/api/places';
import { toPlacePayload, type PlaceDraft } from '@/lib/placeDraft';

const PAGE_SIZE = 20;

/**
 * Live (approved) places for the admin console. Unlike `usePlaces` there is
 * no mock fallback — an admin must see that the API is down.
 */
export function useAdminPlaces() {
  const [query, setQuery] = useState<PlaceSearchParams>({ page: 1, limit: PAGE_SIZE, sortBy: 'name', order: 'asc' });
  const { data, loading, error, reload } = useAsync(() => searchPlaces(query), [JSON.stringify(query)]);
  const total = data?.total ?? 0;
  const page = query.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const remove = useMutation(async (id: string) => {
    await deletePlace(id);
    reload();
  }, 'Could not delete this place.');

  return {
    query,
    places: data?.data ?? [],
    total,
    page,
    totalPages,
    loaded: Boolean(data),
    loading,
    error,
    remove,
    filter: (next: Partial<PlaceSearchParams>) => setQuery((q) => ({ ...q, page: 1, ...next })),
    goToPage: (next: number) => setQuery((q) => ({ ...q, page: next })),
  };
}

/** One place loaded for editing, plus the save action. */
export function useEditPlace(id: string) {
  const { data: place, loading, error } = useAsync(() => getPlace(id), [id]);
  const save = useMutation((draft: PlaceDraft) => updatePlace(id, toPlacePayload(draft)), 'Could not save this place.');
  return { place, loading, error, save };
}
