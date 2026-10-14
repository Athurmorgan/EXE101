import { api } from './client';
import type { Itinerary } from '@/types/api';

export function listItineraries(): Promise<Itinerary[]> {
  return api.get<Itinerary[]>('/itineraries');
}

export function getItinerary(id: string): Promise<Itinerary> {
  return api.get<Itinerary>(`/itineraries/${id}`);
}

export interface NewItineraryPayload {
  regionId: string;
  /** `YYYY-MM-DD` */
  startDate: string;
  endDate: string;
  title?: string;
  budgetVnd?: number;
}

export function createItinerary(payload: NewItineraryPayload): Promise<Itinerary> {
  return api.post<Itinerary>('/itineraries', payload);
}

/** Asks the AI for 5 alternative plans; replaces any previously generated stops. */
export function generateOptions(id: string): Promise<Itinerary> {
  return api.post<Itinerary>(`/itineraries/${id}/generate`);
}

/** Keeps one option and drops the other four. */
export function applyOption(id: string, optionNumber: number): Promise<Itinerary> {
  return api.post<Itinerary>(`/itineraries/${id}/apply`, { optionNumber });
}

export function deleteItinerary(id: string): Promise<{ id: string }> {
  return api.delete<{ id: string }>(`/itineraries/${id}`);
}
