import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, MapPinPlus, PenLine, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

const ITEM = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink hover:bg-ink/5';

/** Avatar button + dropdown: account, contributions, admin (staff only), sign out. */
export function UserMenu() {
  const { user, isStaff, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Close on navigation, outside click and Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-2.5 pr-1 pl-1 text-cream/80 transition-colors hover:text-cream"
      >
        <span className="flex h-8 w-8 items-center justify-center bg-mint text-xs font-semibold text-forest">
          {initials(user.fullName)}
        </span>
        <span className="hidden max-w-36 truncate text-sm lg:inline">{user.fullName}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 border border-ink/10 bg-white py-2 shadow-[0_12px_40px_-12px_rgba(11,26,22,0.35)]"
        >
          <div className="border-b border-ink/10 px-4 pb-3">
            <p className="truncate text-sm font-medium text-ink">{user.fullName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            {user.role !== 'USER' && (
              <p className="mt-2 inline-block bg-dark px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cream uppercase">
                {user.role}
              </p>
            )}
          </div>
          <div className="py-1">
            <Link role="menuitem" to="/app/account" className={ITEM}>
              <UserRound className="h-4 w-4 text-muted" aria-hidden /> Account
            </Link>
            <Link role="menuitem" to="/app/community/new" className={ITEM}>
              <PenLine className="h-4 w-4 text-muted" aria-hidden /> Write a story
            </Link>
            <Link role="menuitem" to="/app/places/new" className={ITEM}>
              <MapPinPlus className="h-4 w-4 text-muted" aria-hidden /> Suggest a place
            </Link>
            {isStaff && (
              <Link role="menuitem" to="/app/admin" className={ITEM}>
                <ShieldCheck className="h-4 w-4 text-muted" aria-hidden /> Admin
              </Link>
            )}
          </div>
          <div className="border-t border-ink/10 pt-1">
            <button type="button" role="menuitem" onClick={logout} className={ITEM}>
              <LogOut className="h-4 w-4 text-muted" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
