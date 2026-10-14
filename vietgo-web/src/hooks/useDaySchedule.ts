import { useState } from 'react';
import { useMutation } from './useMutation';
import { buildSchedule } from '@/lib/api/places';
import type { DaySchedule } from '@/types/api';

/** One-day route through some places, ordered by the BE (nearest-neighbour + meal slots). */
export function useDaySchedule() {
  const [plan, setPlan] = useState<DaySchedule | null>(null);
  const build = useMutation(async (placeIds: string[], startHour: number) => {
    setPlan(await buildSchedule(placeIds, startHour));
  }, 'Could not build a plan.');
  return { plan, build };
}
