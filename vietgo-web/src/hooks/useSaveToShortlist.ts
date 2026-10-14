import { useState } from 'react';
import { addToShortlist } from '@/lib/api/shortlist';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** Saves one place to the signed-in user's shortlist. */
export function useSaveToShortlist(placeId: string) {
  const [state, setState] = useState<SaveState>('idle');

  async function save(): Promise<void> {
    setState('saving');
    try {
      await addToShortlist(placeId);
      setState('saved');
    } catch {
      setState('error');
    }
  }

  return { state, save };
}
