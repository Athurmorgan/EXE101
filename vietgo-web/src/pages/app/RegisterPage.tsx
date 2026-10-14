import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { register, resendVerification, verifyEmail } from '@/lib/api/auth';
import { AuthLayout } from '@/components/app-layout/AuthLayout';
import { Input } from '@/components/app-ui/Input';
import { Button } from '@/components/app-ui/Button';
import { Alert } from '@/components/app-ui/Alert';

// Mirrors the BE's RegisterDto rules (packages/shared: PASSWORD_MIN_LENGTH = 8,
// must contain a letter and a digit) so users see the error before submitting.
function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Include at least one letter and one number.';
  return null;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Two steps, matching the BE flow: register (account is PENDING) → enter the
 * 6-digit code → verified, then sign in with the same credentials.
 */
export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pwProblem = passwordProblem(password);

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (pwProblem || !fullName.trim() || !email) return;

    setBusy(true);
    setError(null);
    try {
      const result = await register({ fullName: fullName.trim(), email, password });
      // Dev only: the BE returns the code so the flow can be tested without an inbox.
      if (result.devVerificationCode) setCode(result.devVerificationCode);
      setStep('verify');
    } catch (err) {
      setError(messageOf(err, 'Could not create your account.'));
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      await login(email, password);
      navigate('/app/discover', { replace: true });
    } catch (err) {
      setError(messageOf(err, 'That code didn’t work.'));
      setBusy(false);
    }
  }

  async function onResend() {
    setError(null);
    try {
      const result = await resendVerification(email);
      if (result.devVerificationCode) setCode(result.devVerificationCode);
      setNotice('A new code is on its way.');
    } catch (err) {
      setError(messageOf(err, 'Could not resend the code.'));
    }
  }

  if (step === 'verify') {
    return (
      <AuthLayout>
        <MailCheck className="h-8 w-8 text-forest" aria-hidden />
        <h1 className="mt-5 font-serif text-3xl tracking-tight text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a 6-digit code to <span className="text-ink">{email}</span>.
        </p>

        <form onSubmit={onVerify} className="mt-8 flex flex-col gap-5">
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="h-12 text-center font-mono text-lg tracking-[0.5em]"
            hint={import.meta.env.DEV && code ? 'Dev mode: filled in from the API response.' : undefined}
          />
          {error && <Alert>{error}</Alert>}
          {notice && !error && <Alert tone="info">{notice}</Alert>}
          <Button type="submit" size="lg" disabled={busy || code.length !== 6} className="w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Verify and continue
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Didn’t get it?{' '}
          <button type="button" onClick={onResend} className="font-medium text-ink underline underline-offset-4">
            Send a new code
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-serif text-3xl tracking-tight text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Save places, build itineraries, share what you find.</p>

      <form onSubmit={onRegister} className="mt-8 flex flex-col gap-5" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={touched && !fullName.trim() ? 'Tell us what to call you.' : undefined}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={touched && !email ? 'Enter your email.' : undefined}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters, with a letter and a number."
          error={touched && pwProblem ? pwProblem : undefined}
        />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" disabled={busy} className="mt-1 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/app/login" className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
