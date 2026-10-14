import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types/api';
import { login as apiLogin, me as apiMe, logout as apiLogout } from '@/lib/api/auth';
import { onAccessTokenRefreshed, setAccessToken } from '@/lib/api/client';

const TOKEN_KEY = 'vivivu_access_token';

type AuthStatus = 'checking' | 'authenticated' | 'guest' | 'loading';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  /** ADMIN or MANAGER — can open the admin area. */
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Drop local session state without calling the BE (it already revoked it). */
  clearSession: () => void;
  /** Replace the cached user after a profile update. */
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function storeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode / blocked storage — the refresh cookie still restores the session.
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Controller for the auth slice: owns session state and talks to
 * `lib/api/auth`. The access token is cached in localStorage so a reload is
 * instant; once it expires `lib/api/client` swaps it via the refresh cookie
 * and tells us through `onAccessTokenRefreshed`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onAccessTokenRefreshed(storeToken);
    setAccessToken(readToken());
    // Even without a cached token the refresh cookie may still be valid —
    // `/auth/me` 401s, the client refreshes, and the retry succeeds.
    apiMe()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        storeToken(null);
        setAccessToken(null);
        setStatus('guest');
      });
  }, []);

  async function login(email: string, password: string): Promise<void> {
    setStatus('loading');
    setError(null);
    try {
      const session = await apiLogin(email, password);
      storeToken(session.accessToken);
      setUser(session.user);
      setStatus('authenticated');
    } catch (err) {
      setStatus('guest');
      setError(err instanceof Error ? err.message : 'Sign-in failed — is the API running?');
      throw err;
    }
  }

  const clearSession = useCallback(() => {
    storeToken(null);
    setAccessToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  function logout(): void {
    apiLogout().catch(() => undefined);
    clearSession();
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <AuthContext.Provider value={{ user, status, error, isStaff, login, logout, clearSession, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
