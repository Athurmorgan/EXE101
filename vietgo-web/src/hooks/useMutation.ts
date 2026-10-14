import { useState } from 'react';
import { errorMessage } from '@/lib/api/client';

export type Outcome<R> = { ok: true; data: R } | { ok: false };

export interface Mutation<A extends unknown[], R> {
  /** Never throws: failures land in `error` and resolve to `{ ok: false }`. */
  run: (...args: A) => Promise<Outcome<R>>;
  busy: boolean;
  error: string | null;
  setError: (message: string | null) => void;
}

/**
 * Generic controller for "do something that changes data": tracks busy and
 * error so views never touch try/catch or API error shapes.
 */
export function useMutation<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  fallback?: string,
): Mutation<A, R> {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(...args: A): Promise<Outcome<R>> {
    setBusy(true);
    setError(null);
    try {
      const data = await action(...args);
      return { ok: true, data };
    } catch (err) {
      setError(errorMessage(err, fallback));
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }

  return { run, busy, error, setError };
}
