import { api } from './client';
import type { ShortlistItem } from '@/types/api';

export function listShortlist(): Promise<ShortlistItem[]> {
  return api.get<ShortlistItem[]>('/shortlists');
}

/** Idempotent on the BE: saving an already-saved place returns the existing row. */
export function addToShortlist(placeId: string): Promise<ShortlistItem> {
  return api.post<ShortlistItem>('/shortlists', { placeId });
}

export function updateShortlistNotes(id: string, notes: string): Promise<ShortlistItem> {
  return api.put<ShortlistItem>(`/shortlists/${id}`, { notes });
}

/** Persists the new order; the BE keys it by place id, not shortlist id. */
export function reorderShortlist(placeIds: string[]): Promise<ShortlistItem[]> {
  return api.post<ShortlistItem[]>('/shortlists/reorder', { placeIds });
}

export function removeFromShortlist(id: string): Promise<{ id: string }> {
  return api.delete<{ id: string }>(`/shortlists/${id}`);
}
