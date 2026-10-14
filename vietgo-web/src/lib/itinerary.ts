import type { Itinerary, ItineraryStop } from '@/types/api';
import { isoDate } from './format';
import type { FieldErrors } from './validation';

/** Business rules and derived data for trips; no React, no HTTP. */

export const MAX_TRIP_DAYS = 14;
const DAY_MS = 86_400_000;

export function addDays(date: Date | string, days: number): Date {
  return new Date(new Date(date).getTime() + days * DAY_MS);
}

/** Inclusive day count between two `YYYY-MM-DD` dates. */
export function tripLength(startDate: string, endDate: string): number {
  return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS) + 1;
}

export function defaultTripDates(): { startDate: string; endDate: string } {
  const now = new Date();
  return { startDate: isoDate(addDays(now, 7)), endDate: isoDate(addDays(now, 9)) };
}

export function validateTrip(input: { regionId: string; startDate: string; endDate: string }): FieldErrors {
  const errors: FieldErrors = {};
  const days = tripLength(input.startDate, input.endDate);
  if (!input.regionId) errors.regionId = 'Where are you going?';
  if (!input.startDate) errors.startDate = 'Pick a start date.';
  if (!input.endDate || !(days >= 1)) errors.endDate = 'The trip has to end on or after it starts.';
  else if (days > MAX_TRIP_DAYS) errors.endDate = `Keep it to ${MAX_TRIP_DAYS} days or fewer.`;
  return errors;
}

export function tripTitle(trip: Itinerary): string {
  return trip.title || `${trip.days} days in ${trip.region?.name ?? 'Vietnam'}`;
}

export function tripStatusLabel(trip: Itinerary): string {
  if (trip.status === 'APPLIED') return `Plan ${trip.selectedOption ?? ''} chosen`.trim();
  if (trip.stops && trip.stops.length > 0) return 'Pick a plan';
  return 'Draft';
}

/** day number → stops, in visiting order. */
export type TripDays = Map<number, ItineraryStop[]>;

/** option → day → stops, each level sorted. */
export function groupStops(stops: ItineraryStop[]): Map<number, TripDays> {
  const options = new Map<number, TripDays>();
  const sorted = [...stops].sort(
    (a, b) => a.optionNumber - b.optionNumber || a.dayNumber - b.dayNumber || a.orderInDay - b.orderInDay,
  );
  for (const stop of sorted) {
    const days = options.get(stop.optionNumber) ?? new Map<number, ItineraryStop[]>();
    days.set(stop.dayNumber, [...(days.get(stop.dayNumber) ?? []), stop]);
    options.set(stop.optionNumber, days);
  }
  return options;
}

export function summariseOption(days: TripDays | undefined): { stops: number; cost: number } {
  const all = days ? [...days.values()].flat() : [];
  return { stops: all.length, cost: all.reduce((sum, s) => sum + (s.estimatedCost ?? 0), 0) };
}
