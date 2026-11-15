import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { errorMessage } from '@/lib/api/client';
import { AuthLayout } from '@/components/app-layout/AuthLayout';
import { Alert } from '@/components/app-ui/Alert';
import { buttonClasses } from '@/components/app-ui/Button';
import { AFTER_GOOGLE_KEY } from '@/components/app-ui/GoogleButton';

function takeReturnPath(): string {
  try {
    const path = sessionStorage.getItem(AFTER_GOOGLE_KEY);
    sessionStorage.removeItem(AFTER_GOOGLE_KEY);
    // Only in-app paths — never bounce to whatever ended up in storage.
    if (path?.startsWith('/app/')) return path;
  } catch {
    // Blocked storage.
  }
  return '/app/discover';
}

/**
 * Landing spot for `GET /auth/google/callback`: the BE has already set the
 * refresh cookie and passes the short-lived access token in the query.
 */
export function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // StrictMode runs effects twice in dev; the token must only be adopted once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = params.get('access_token');
    if (!token) {
      setError('Google did not send a sign-in token back. Please try again.');
      return;
    }
    signInWithToken(token)
      .then(() => navigate(takeReturnPath(), { replace: true }))
      .catch((err: unknown) => setError(errorMessage(err, 'Google sign-in failed.')));
  }, [params, navigate, signInWithToken]);

  return (
    <AuthLayout>
      {error ? (
        <>
          <h1 className="font-serif text-3xl tracking-tight text-ink">Couldn't sign you in</h1>
          <Alert className="mt-6">{error}</Alert>
          <Link to="/app/login" className={buttonClasses('dark', 'lg', 'mt-6 w-full')}>
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="flex items-center gap-3 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Signing you in with Google…
        </p>
      )}
    </AuthLayout>
  );
}
