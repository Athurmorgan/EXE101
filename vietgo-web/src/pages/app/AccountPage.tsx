import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChangePassword, useSignOutEverywhere, useUpdateProfile } from '@/hooks/useAccount';
import { formatDate, initials } from '@/lib/format';
import { hasErrors, validatePasswordChange, validateProfile, type FieldErrors } from '@/lib/validation';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { Alert } from '@/components/app-ui/Alert';
import { Badge } from '@/components/app-ui/Badge';
import { Button } from '@/components/app-ui/Button';

function Panel({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-ink/10 py-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <div>
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted">{lead}</p>
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

export function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader eyebrow="Account" title="Your account" />
      <Container className="py-6 sm:py-10">
        <div className="flex items-center gap-4 pb-10">
          <span className="flex h-14 w-14 items-center justify-center bg-forest text-lg font-semibold text-cream">
            {initials(user.fullName)}
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
              {user.fullName} {user.role !== 'USER' && <Badge tone="dark">{user.role}</Badge>}
            </p>
            <p className="text-sm text-muted">
              {user.email} · member since {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <ProfileForm />
        <PasswordForm />
        <SessionsPanel />
      </Container>
    </>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth?.slice(0, 10) ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const save = useUpdateProfile();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    const found = validateProfile({ fullName });
    setErrors(found);
    if (hasErrors(found)) return;

    const result = await save.run({
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
    });
    setSaved(result.ok);
  }

  return (
    <Panel title="Profile" lead="How you appear on comments and stories.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {save.error && <Alert>{save.error}</Alert>}
        {saved && <Alert tone="success">Profile saved.</Alert>}
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          error={errors.fullName}
        />
        <Input label="Email" value={user?.email ?? ''} disabled hint="Email can't be changed." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            type="date"
            label="Date of birth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <Input label="City" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="address-level2" />
        </div>
        <div>
          <Button type="submit" variant="dark" disabled={save.busy}>
            {save.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Save profile
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function PasswordForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const change = useChangePassword();

  if (user?.authProvider === 'GOOGLE') {
    return (
      <Panel title="Password" lead="You sign in with Google.">
        <p className="text-sm text-muted">Your password is managed by your Google account.</p>
      </Panel>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validatePasswordChange({ current, next, confirm });
    setErrors(found);
    if (hasErrors(found)) return;

    if ((await change.run(current, next)).ok) {
      navigate('/app/login', { replace: true, state: { notice: 'Password changed — sign in with your new password.' } });
    }
  }

  return (
    <Panel title="Password" lead="Changing it signs you out everywhere, including here.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {change.error && <Alert>{change.error}</Alert>}
        <Input
          type="password"
          label="Current password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={errors.current}
        />
        <Input
          type="password"
          label="New password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={errors.next}
          hint="8+ characters, with a letter and a number."
        />
        <Input
          type="password"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        <div>
          <Button type="submit" variant="dark" disabled={change.busy}>
            {change.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Change password
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function SessionsPanel() {
  const navigate = useNavigate();
  const signOut = useSignOutEverywhere();

  async function onLogoutAll() {
    if ((await signOut.run()).ok) {
      navigate('/app/login', { replace: true, state: { notice: 'Signed out on every device.' } });
    }
  }

  return (
    <Panel title="Sessions" lead="Lost a phone or used a shared computer?">
      {signOut.error && <Alert className="mb-5">{signOut.error}</Alert>}
      <Button variant="outline" onClick={onLogoutAll} disabled={signOut.busy}>
        {signOut.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Sign out on all devices
      </Button>
    </Panel>
  );
}
