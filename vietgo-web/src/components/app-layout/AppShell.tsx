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
  // Icons carry the link on phones; the label and its drawn hairline take over from `md`.
  return cn(
    'app-navlink inline-flex h-9 items-center gap-2 text-ink',
    'max-md:rounded-full max-md:px-2.5 max-md:after:hidden',
    isActive && 'max-md:bg-ink/10',
  );
}

/**
 * Floating glass bar + content outlet for every page under `/app/*`. Same
 * pill as the landing Header, minus its scroll choreography — functional
 * screens need to be fast and legible. The logo goes back to the landing.
 */
export function AppShell() {
  const { status, isStaff } = useAuth();
  const { pathname } = useLocation();

  // BrowserRouter doesn't reset scroll on navigation — without this, opening
  // a place from halfway down Discover lands halfway down the detail page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-surface flex min-h-screen flex-col">
      <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-5">
        <div className="app-glass mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-3 sm:gap-8 sm:px-5">
          <Logo />

          <nav aria-label="Main" className="flex min-w-0 items-center gap-1 overflow-x-auto md:gap-8">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass} title={label}>
                <Icon className="h-4 w-4 shrink-0 md:hidden" aria-hidden />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
            {isStaff && (
              <NavLink to="/app/admin" className={navClass} title="Admin">
                <ShieldCheck className="h-4 w-4 shrink-0 md:hidden" aria-hidden />
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
                  className="app-navlink hidden text-ink sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link to="/app/register" className={buttonClasses('primary', 'sm')}>
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Pull the content up under the floating bar so pages keep their own top spacing. */}
      <main className="-mt-16 flex-1 pt-16 sm:-mt-20 sm:pt-20">
        <Outlet />
      </main>

      <footer className="border-t border-ink/20">
        <Container className="flex flex-col gap-6 py-12 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 font-serif italic text-ink/70">Every rhythm of Vietnam.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            <Link to="/app/discover" className="app-navlink text-ink">Discover</Link>
            <Link to="/app/community" className="app-navlink text-ink">Community</Link>
            <Link to="/app/trips" className="app-navlink text-ink">Plan a trip</Link>
            <Link to="/app/places/new" className="app-navlink text-ink">Suggest a place</Link>
            <Link to="/" className="app-navlink text-ink">About vivivu</Link>
          </nav>
          <span className="text-xs tracking-wider">© {new Date().getFullYear()} vivivu</span>
        </Container>
      </footer>
    </div>
  );
}
