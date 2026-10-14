import { useCallback, useEffect, useState, type DependencyList, type Dispatch, type SetStateAction } from 'react';
import { errorMessage } from '@/lib/api/client';

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  /** Re-run the loader, e.g. after a mutation. */
  reload: () => void;
  /** Optimistically patch the cached result without refetching. */
  setData: Dispatch<SetStateAction<T | undefined>>;
}

/**
 * Generic controller for "load something from the API when these deps
 * change". Ignores responses that arrive after the deps moved on, so a slow
 * request can't overwrite a newer one.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(errorMessage(err, 'Could not load this — is the API running?'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller owns the dep list
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload, setData };
}
