import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

/** Toggleable filter pill: hairline when idle, solid ink when active. */
export function Chip({ active = false, onClick, icon, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep',
        active ? 'border-ink bg-ink text-cream' : 'border-ink/25 text-ink hover:border-ink/60',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
