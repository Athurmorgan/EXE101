import { useState } from 'react';
import { useAuth } from './useAuth';
import { register, resendVerification, verifyEmail, type RegisterPayload } from '@/lib/api/auth';
import { errorMessage } from '@/lib/api/client';

/**
 * Two steps, matching the BE flow: register (account is PENDING) → enter the
 * 6-digit code → verified, then sign in with the same credentials.
 */
export function useRegistration() {
  const { login } = useAuth();
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [account, setAccount] = useState<{ email: string; password: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submitDetails(payload: RegisterPayload): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const result = await register(payload);
      // Dev only: the BE returns the code so the flow can be tested without an inbox.
      if (result.devVerificationCode) setCode(result.devVerificationCode);
      setAccount({ email: payload.email, password: payload.password });
      setStep('verify');
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account.'));
    } finally {
      setBusy(false);
    }
  }

  /** Resolves true once the user is verified and signed in. */
  async function verify(): Promise<boolean> {
    if (!account) return false;
    setBusy(true);
    setError(null);
    try {
      await verifyEmail(account.email, code);
      await login(account.email, account.password);
      return true;
    } catch (err) {
      setError(errorMessage(err, 'That code didn’t work.'));
      setBusy(false);
      return false;
    }
  }

  async function resend(): Promise<void> {
    if (!account) return;
    setError(null);
    try {
      const result = await resendVerification(account.email);
      if (result.devVerificationCode) setCode(result.devVerificationCode);
      setNotice('A new code is on its way.');
    } catch (err) {
      setError(errorMessage(err, 'Could not resend the code.'));
    }
  }

  return { step, email: account?.email ?? '', code, setCode, busy, error, notice, submitDetails, verify, resend };
}
