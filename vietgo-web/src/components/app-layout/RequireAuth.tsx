import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types/api';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { buttonClasses } from '@/components/app-ui/Button';
import { Container } from './Container';

/**
 * Route guard: sends guests to the login page and back here once they sign
 * in. With `roles`, signed-in users without one of them get a 403 screen —
 * the BE enforces this too, the guard just avoids a page full of errors.
 */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex justify-center py-32 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" aria-label="Checking your session" />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/app/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={ShieldAlert}
          title="Staff only"
          action={
            <Link to="/app/discover" className={buttonClasses('dark')}>
              Back to Discover
            </Link>
          }
        >
          This area is for {roles.join(' and ').toLowerCase()} accounts. You're signed in as {user.email}.
        </EmptyState>
      </Container>
    );
  }

  return children;
}
