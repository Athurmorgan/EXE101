import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/app-layout/AuthLayout';
import { Input } from '@/components/app-ui/Input';
import { Button } from '@/components/app-ui/Button';
import { Alert } from '@/components/app-ui/Alert';

// Seeded USER account on the BE (see PROJECT_STATUS.md §10) — dev only.
const DEMO_ACCOUNT = { email: 'user@vivivu.vn', password: 'Vivivu@2026' };

export function LoginPage() {
  const { login, status, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Where RequireAuth / ShortlistButton sent us from, if anywhere.
  const navState = location.state as { from?: Location; notice?: string } | null;
  const from = navState?.from?.pathname ?? '/app/discover';
  // e.g. "Password changed — sign in again" from the account page.
  const notice = navState?.notice;
  const submitting = status === 'loading';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // `error` from useAuth renders below
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-serif text-3xl tracking-tight text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Sign in to save places and plan your trip.</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        {notice && !error && <Alert tone="success">{notice}</Alert>}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" disabled={submitting || !email || !password} className="mt-1 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to vivivu?{' '}
        <Link to="/app/register" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>

      {import.meta.env.DEV && (
        <div className="mt-12 flex items-center justify-between gap-4 border border-dashed border-ink/20 px-4 py-3 text-xs text-muted">
          <span>
            Demo: <span className="text-ink">{DEMO_ACCOUNT.email}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO_ACCOUNT.email);
              setPassword(DEMO_ACCOUNT.password);
            }}
            className="font-medium text-ink underline underline-offset-4"
          >
            Fill in
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
