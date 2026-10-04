/**
 * Single HTTP client for the whole app.
 *
 * Every screen calls through this module instead of `fetch` directly, so auth,
 * error shape, locale and base URL are handled in exactly one place. New
 * resources get typed helpers in `endpoints.ts` rather than a new client.
 */

import { ApiError, type ApiErrorBody, type ApiResponse, type Locale } from '@/types/api';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'vivivu.accessToken';
const REFRESH_TOKEN_KEY = 'vivivu.refreshToken';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON body. `undefined` sends no payload. */
  body?: unknown;
  /** Query values; `undefined` and `null` entries are dropped. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Overrides the locale sent as `Accept-Language`. */
  locale?: Locale;
  /** Skips the automatic refresh-and-retry. Used to break refresh loops. */
  skipRetry?: boolean;
}

/** In-memory copy of the access token; the storage copy is the source of truth on reload. */
let accessToken: string | null = readStorage(ACCESS_TOKEN_KEY);

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private-mode Safari and some in-app webviews throw on storage access.
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage is a convenience, not a requirement — the cookie still refreshes.
  }
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set('Accept-Language', options.locale ?? detectLocale());
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return headers;
}

function detectLocale(): Locale {
  const stored = readStorage('vivivu.locale');
  if (stored === 'vi' || stored === 'en') return stored;
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

function parseError(status: number, raw: unknown): ApiError {
  const body = (raw ?? {}) as Partial<ApiErrorBody>;
  return new ApiError(
    status,
    body.code ?? 'UNKNOWN_ERROR',
    body.message ?? `Request failed with status ${status}`,
    body.details,
    body.requestId,
  );
}

/** Exchanges the refresh cookie for a new access token. Returns false when the session is over. */
async function tryRefresh(): Promise<boolean> {
  try {
    const response = await fetch(buildUrl('/auth/refresh', undefined), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) return false;

    const payload = (await response.json()) as ApiResponse<{ accessToken: string }>;
    const token = payload.data?.accessToken;
    if (!token) return false;

    accessToken = token;
    writeStorage(ACCESS_TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}

async function send<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    headers: buildHeaders(options),
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    // One silent retry after refreshing; `skipRetry` stops a refresh loop.
    if (response.status === 401 && !options.skipRetry && (await tryRefresh())) {
      return send<T>(path, { ...options, skipRetry: true });
    }
    throw parseError(response.status, payload);
  }

  // The backend always wraps payloads, but unwrap defensively so a raw 200
  // (health checks, proxies) still works.
  const body = payload as ApiResponse<T> | T;
  return (body && typeof body === 'object' && 'data' in body ? (body as ApiResponse<T>).data : body) as T;
}

/** GET returning a paginated list. Pass `onPage` to receive the pagination meta. */
export async function getList<T>(
  path: string,
  options: RequestOptions & { onPage?: (meta: ApiResponse<T>['meta']) => void } = {},
): Promise<T[]> {
  const { onPage, ...rest } = options;
  const url = buildUrl(path, rest.query);
  const response = await fetch(url, {
    headers: buildHeaders(rest),
    credentials: 'include',
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    if (response.status === 401 && !rest.skipRetry && (await tryRefresh())) {
      return getList<T>(path, { ...rest, skipRetry: true, onPage });
    }
    throw parseError(response.status, payload);
  }

  onPage?.(payload?.meta);
  return (payload?.data ?? []) as T[];
}

export const api = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> => send<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    send<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    send<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    send<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    send<T>(path, { ...options, method: 'DELETE' }),
  list: getList,
} as const;

/** Stores the tokens issued by `/auth/login` or `/auth/refresh`. */
export function setSession(tokens: { accessToken: string; refreshToken?: string }): void {
  accessToken = tokens.accessToken;
  writeStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) writeStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  return accessToken ?? readStorage(ACCESS_TOKEN_KEY);
}

export function clearSession(): void {
  accessToken = null;
  writeStorage(ACCESS_TOKEN_KEY, null);
  writeStorage(REFRESH_TOKEN_KEY, null);
}

/** Base URL in use, shown in the debug panel and error messages. */
export const API_BASE_URL = BASE_URL;
