import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { useRegistration } from '@/hooks/useRegistration';
import { hasErrors, validateRegistration } from '@/lib/validation';
import { AuthLayout } from '@/components/app-layout/AuthLayout';
import { Input } from '@/components/app-ui/Input';
import { Button } from '@/components/app-ui/Button';
import { Alert } from '@/components/app-ui/Alert';

export function RegisterPage() {
  const navigate = useNavigate();
  const { step, code, setCode, busy, error, notice, submitDetails, verify, resend } = useRegistration();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = touched ? validateRegistration({ fullName, email, password }) : {};

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors(validateRegistration({ fullName, email, password }))) return;
    await submitDetails({ fullName: fullName.trim(), email, password });
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    if (await verify()) navigate('/app/discover', { replace: true });
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
          <button type="button" onClick={() => void resend()} className="font-medium text-ink underline underline-offset-4">
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
          error={errors.fullName}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters, with a letter and a number."
          error={errors.password}
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
