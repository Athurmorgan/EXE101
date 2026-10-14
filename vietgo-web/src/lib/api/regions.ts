import { api, toQueryString } from './client';
import type { Paged, Region } from '@/types/api';

/** The five centrally-run cities — good default for pickers. */
export function listCities(): Promise<Region[]> {
  return api.get<Region[]>('/regions/cities');
}

export function listRegions(params: { q?: string; limit?: number; isCity?: boolean } = {}): Promise<Paged<Region>> {
  return api.get<Paged<Region>>(`/regions${toQueryString({ sortBy: 'name', order: 'asc', ...params })}`);
}
