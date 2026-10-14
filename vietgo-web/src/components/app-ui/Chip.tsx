import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

/** Toggleable filter pill — square like the rest of the app surface. */
export function Chip({ active = false, onClick, icon, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 border px-3.5 text-sm transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
        active
          ? 'border-dark bg-dark text-cream'
          : 'border-ink/15 bg-white text-ink hover:border-ink/40',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
