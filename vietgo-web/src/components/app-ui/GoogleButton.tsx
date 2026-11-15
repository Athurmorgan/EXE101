import { GOOGLE_SIGN_IN_URL } from '@/lib/api/auth';
import { buttonClasses } from './Button';
import { cn } from '@/lib/cn';

/** Where to land after the Google round-trip; read back by `GoogleCallbackPage`. */
export const AFTER_GOOGLE_KEY = 'vivivu_after_google';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.3a12 12 0 0 0 0 10.8l4-3Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
    </svg>
  );
}

/**
 * A plain link, not a fetch: the BE answers with a 302 to Google, and the
 * state cookie it sets has to ride along on a top-level navigation.
 */
export function GoogleButton({ returnTo, className }: { returnTo?: string; className?: string }) {
  return (
    <a
      href={GOOGLE_SIGN_IN_URL}
      onClick={() => {
        try {
          if (returnTo) sessionStorage.setItem(AFTER_GOOGLE_KEY, returnTo);
        } catch {
          // Blocked storage — the callback falls back to Discover.
        }
      }}
      className={cn(buttonClasses('outline', 'lg'), 'w-full', className)}
    >
      <GoogleMark />
      Continue with Google
    </a>
  );
}

/** "or" rule between the Google button and the email form. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-4 text-xs tracking-wider text-muted uppercase" aria-hidden>
      <span className="h-px flex-1 bg-ink/20" />
      or
      <span className="h-px flex-1 bg-ink/20" />
    </div>
  );
}
