import { useState } from 'react';
import { useMutation } from './useMutation';
import { submitPlace } from '@/lib/api/places';
import { toPlacePayload, type PlaceDraft } from '@/lib/placeDraft';

/** Sends a place suggestion to the moderation queue. */
export function useSubmitPlace() {
  return useMutation((draft: PlaceDraft) => submitPlace(toPlacePayload(draft)), 'Could not submit this place.');
}

/** Browser geolocation as a promise, with a busy flag for the button. */
export function useGeolocation() {
  const [locating, setLocating] = useState(false);

  function locate(): Promise<{ lat: number; lng: number }> {
    if (!('geolocation' in navigator)) return Promise.reject(new Error('Your browser does not share location.'));
    setLocating(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setLocating(false);
          reject(new Error('Location permission was denied.'));
        },
        { timeout: 10_000 },
      );
    });
  }

  return { locating, locate };
}
