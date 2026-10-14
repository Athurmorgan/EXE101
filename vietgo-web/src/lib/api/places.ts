import { api, toQueryString } from './client';
import type { DaySchedule, Place, PlaceListResponse } from '@/types/api';

export interface PlaceSearchParams {
  q?: string;
  category?: string;
  regionId?: string;
  cuisineType?: string;
  mealType?: string;
  priceRange?: string;
  isHiddenPlace?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'googleRating';
  order?: 'asc' | 'desc';
}

export function searchPlaces(params: PlaceSearchParams = {}): Promise<PlaceListResponse> {
  return api.get<PlaceListResponse>(`/places${toQueryString(params)}`);
}

export function getPlace(id: string): Promise<Place> {
  return api.get<Place>(`/places/${id}`);
}

export interface NewPlacePayload {
  name: string;
  lat: number;
  lng: number;
  category: string;
  description?: string;
  address?: string;
  cuisineType?: string;
  mealType?: string;
  priceRange?: string;
  avgMealPrice?: number;
  regionId?: string;
  isHiddenPlace?: boolean;
}

/** User submissions land as `PENDING` and only show up after moderation. */
export function submitPlace(payload: NewPlacePayload): Promise<Place> {
  return api.post<Place>('/places', payload);
}

/** Orders places by nearest-neighbour and stamps times on them — a one-day plan. */
export function buildSchedule(placeIds: string[], startHour = 9): Promise<DaySchedule> {
  return api.post<DaySchedule>('/places/schedule/build', { placeIds, startHour });
}
