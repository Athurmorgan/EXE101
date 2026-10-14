/**
 * Thin fetch wrapper — the one place that knows the API base URL, how to
 * attach the access token, how to refresh it, and how to unwrap errors.
 * Every `lib/api/*` module calls through this instead of `fetch` directly.
 *
 * Dev requests go through the Vite proxy configured in `vite.config.ts`
 * (`/api` -> `http://localhost:3000`), so the browser never hits CORS.
 */
const API_BASE = '/api/v1';

let accessToken: string | null = null;
let tokenListener: ((token: string | null) => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Lets the auth controller persist a token that was silently refreshed here. */
export function onAccessTokenRefreshed(listener: (token: string | null) => void): void {
  tokenListener = listener;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Auth endpoints whose 401 means "wrong credentials", not "token expired". */
const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/verify-email', '/auth/logout'];

let refreshing: Promise<string | null> | null = null;

/**
 * The access token lives 15 minutes; the refresh token is an httpOnly cookie
 * scoped to `/api/v1/auth`. Concurrent 401s share one in-flight refresh so
 * the BE's token rotation doesn't revoke itself.
 */
function refreshAccessToken(): Promise<string | null> {
  refreshing ??= fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (response) => {
      if (!response.ok) return null;
      const body = (await response.json()) as { data?: { accessToken?: string } };
      return body.data?.accessToken ?? null;
    })
    .catch(() => null)
    .then((token) => {
      accessToken = token;
      tokenListener?.(token);
      return token;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

interface RequestOptions extends RequestInit {
  /** Return the whole JSON body instead of unwrapping `data` — for `{ data, meta }` lists. */
  raw?: boolean;
}

async function request<T>(path: string, { raw = false, ...options }: RequestOptions = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    // Refresh token lives in an httpOnly cookie set by the BE — always send it.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && retry && !NO_REFRESH.includes(path)) {
    const token = await refreshAccessToken();
    if (token) return request<T>(path, { raw, ...options }, false);
  }

  if (response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const message = typeof record.message === 'string' ? record.message : `Request failed with ${response.status}`;
    throw new ApiError(message, response.status, typeof record.code === 'string' ? record.code : undefined);
  }

  if (raw) return body as T;

  // BE wraps success responses in `{ data, meta }` (see TransformInterceptor
  // in app.module.ts) — unwrap it so callers just get their payload.
  return (body && typeof body === 'object' && 'data' in body ? (body as { data: unknown }).data : body) as T;
}

function json(method: string, body?: unknown): RequestOptions {
  return { method, body: body === undefined ? undefined : JSON.stringify(body) };
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  getRaw: <T>(path: string): Promise<T> => request<T>(path, { raw: true }),
  post: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, json('POST', body)),
  put: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, json('PUT', body)),
  patch: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, json('PATCH', body)),
  delete: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, json('DELETE', body)),
};

export function toQueryString(params: object): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export function errorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
