/**
 * Endpoint paths as constants.
 *
 * Keeping them here means a URL change is one edit instead of a search across
 * every screen, and it documents the API surface the app depends on.
 */

import { api, setSession, clearSession, type RequestOptions } from '@/lib/api';
import type { AuthSession, Locale, Region, User } from '@/types/api';

export const ENDPOINTS = {
  health: '/health',
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    logoutAll: '/auth/logout-all',
    me: '/auth/me',
    google: '/auth/google',
  },
  regions: '/regions',
  places: '/places',
  nearby: '/places/nearby',
  community: {
    posts: '/community/posts',
    comments: '/community/comments',
    reactions: '/community/reactions',
  },
  moderation: {
    queue: '/moderation/queue',
  },
  ai: {
    itineraryPreview: '/itinerary/preview',
  },
} as const;

export const authApi = {
  /** Email + password sign-in. Persists the returned session. */
  async login(email: string, password: string): Promise<AuthSession> {
    const session = await api.post<AuthSession>(ENDPOINTS.auth.login, { email, password });
    setSession(session);
    return session;
  },

  /** Self-service sign-up. The new account is always created with the USER role. */
  async register(input: {
    email: string;
    password: string;
    fullName: string;
    locale?: Locale;
  }): Promise<AuthSession> {
    const session = await api.post<AuthSession>(ENDPOINTS.auth.register, input);
    setSession(session);
    return session;
  },

  /** Current user. Resolves to null when the session has expired. */
  async me(): Promise<User | null> {
    try {
      return await api.get<User>(ENDPOINTS.auth.me);
    } catch {
      clearSession();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.auth.logout);
    } finally {
      clearSession();
    }
  },

  /** Revokes every refresh token of the account on all devices. */
  async logoutAll(): Promise<void> {
    try {
      await api.post(ENDPOINTS.auth.logoutAll);
    } finally {
      clearSession();
    }
  },

  /** Full-page redirect to Google's consent screen. */
  signInWithGoogle(): void {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}${ENDPOINTS.auth.google}`;
  },
} as const;

export const regionApi = {
  /** 63 provinces and cities of Vietnam. */
  list(locale: Locale = 'en'): Promise<Region[]> {
    return api.list<Region>(ENDPOINTS.regions, { locale, query: { limit: 100 } });
  },
} as const;

export interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  category?: string;
  regionId?: string;
  page?: number;
  limit?: number;
}

export const placeApi = {
  /**
   * Places near a point. Feeds the AI itinerary screen; the backend already
   * hides unapproved submissions from this result.
   */
  nearby(query: NearbyQuery, options?: RequestOptions) {
    return api.list<unknown>(ENDPOINTS.nearby, { ...options, query: { ...query } });
  },
} as const;

export const communityApi = {
  /** Public feed. Contains approved posts only. */
  feed(options?: RequestOptions) {
    return api.list<unknown>(ENDPOINTS.community.posts, options);
  },
} as const;
