import { useMemo, useState } from 'react';
import { useAsync } from './useAsync';
import {
  applyOption,
  createItinerary,
  deleteItinerary,
  generateOptions,
  getItinerary,
  listItineraries,
  type NewItineraryPayload,
} from '@/lib/api/itineraries';
import { errorMessage } from '@/lib/api/client';
import { groupStops, summariseOption } from '@/lib/itinerary';

export function useTrips() {
  const { data, loading, error } = useAsync(listItineraries, []);
  return { trips: data ?? [], loading, error };
}

type TripAction = 'generate' | 'apply' | 'delete';

/** One trip, its AI options grouped by day, and every action on it. */
export function useTrip(id: string, initialError: string | null = null) {
  const { data: trip, loading, error, reload } = useAsync(() => getItinerary(id), [id]);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState<TripAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(initialError);

  const options = useMemo(() => groupStops(trip?.stops ?? []), [trip?.stops]);
  const optionNumbers = [...options.keys()];
  const current = picked && options.has(picked) ? picked : (trip?.selectedOption ?? optionNumbers[0] ?? null);
  const days = current ? options.get(current) : undefined;

  async function run(kind: TripAction, action: () => Promise<unknown>): Promise<boolean> {
    setBusy(kind);
    setActionError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setActionError(errorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  }

  return {
    trip,
    loading,
    error,
    applied: trip?.status === 'APPLIED',
    optionNumbers,
    current,
    days,
    summary: summariseOption(days),
    busy,
    actionError,
    pick: setPicked,
    /** Generate returns the trip without stops, so refetch afterwards. */
    generate: () =>
      run('generate', async () => {
        await generateOptions(id);
        setPicked(null);
        reload();
      }),
    apply: () =>
      run('apply', async () => {
        if (!current) return;
        await applyOption(id, current);
        reload();
      }),
    remove: () => run('delete', () => deleteItinerary(id)),
  };
}

/**
 * Creates a trip, then asks the AI for options. If the AI step fails the trip
 * still exists, so the result carries its id and the error to show there.
 */
export function useCreateTrip() {
  const [step, setStep] = useState<'idle' | 'creating' | 'generating'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function create(payload: NewItineraryPayload): Promise<{ tripId: string; generateError?: string } | null> {
    setError(null);
    setStep('creating');
    let tripId: string | null = null;
    try {
      const trip = await createItinerary(payload);
      tripId = trip.id;
      setStep('generating');
      await generateOptions(trip.id);
      return { tripId };
    } catch (err) {
      if (tripId) return { tripId, generateError: errorMessage(err) };
      setError(errorMessage(err, 'Could not create the trip.'));
      return null;
    } finally {
      setStep('idle');
    }
  }

  return { step, busy: step !== 'idle', error, create };
}
