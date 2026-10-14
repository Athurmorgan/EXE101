import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bookmark, Compass, Map, MessagesSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { buttonClasses } from '@/components/app-ui/Button';
import { Container } from './Container';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

const NAV = [
  { to: '/app/discover', label: 'Discover', icon: Compass },
  { to: '/app/community', label: 'Community', icon: MessagesSquare },
  { to: '/app/trips', label: 'Trips', icon: Map },
  { to: '/app/shortlist', label: 'Shortlist', icon: Bookmark },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex h-9 items-center gap-2 px-2.5 text-sm transition-colors sm:px-3',
    isActive ? 'bg-cream/10 text-cream' : 'text-cream/60 hover:text-cream',
  );
}

/** Top bar + content outlet for every page under `/app/*`. Deliberately not
 * the cinematic landing Header — functional screens need to be fast and
 * legible, not scroll-animated. The logo goes back to the landing page. */
export function AppShell() {
  const { status, isStaff } = useAuth();
  const { pathname } = useLocation();

  // BrowserRouter doesn't reset scroll on navigation — without this, opening
  // a place from halfway down Discover lands halfway down the detail page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <header className="sticky top-0 z-40 bg-dark text-cream">
        <Container className="flex h-16 items-center gap-3 sm:gap-6">
          <Logo tone="light" />

          <nav aria-label="Main" className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass} title={label}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
            {isStaff && (
              <NavLink to="/app/admin" className={navClass} title="Admin">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden md:inline">Admin</span>
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {status === 'authenticated' ? (
              <UserMenu />
            ) : status === 'checking' ? null : (
              <>
                <Link
                  to="/app/login"
                  state={{ from: { pathname } }}
                  className="hidden text-sm text-cream/80 transition-colors hover:text-cream sm:inline"
                >
                  Sign in
                </Link>
                <Link to="/app/register" className={buttonClasses('primary', 'sm')}>
                  Join
                </Link>
              </>
            )}
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10">
        <Container className="flex flex-col gap-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/app/discover" className="hover:text-ink">Discover</Link>
            <Link to="/app/community" className="hover:text-ink">Community</Link>
            <Link to="/app/trips" className="hover:text-ink">Plan a trip</Link>
            <Link to="/app/places/new" className="hover:text-ink">Suggest a place</Link>
            <Link to="/" className="hover:text-ink">About vivivu</Link>
          </nav>
          <span className="text-xs">© {new Date().getFullYear()} vivivu</span>
        </Container>
      </footer>
    </div>
  );
}
