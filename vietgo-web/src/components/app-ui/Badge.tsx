import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: ReactNode;
  tone?: 'mint' | 'dark' | 'outline';
  className?: string;
}

export function Badge({ children, tone = 'mint', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider',
        tone === 'mint' && 'bg-mint text-forest',
        tone === 'dark' && 'bg-dark text-cream',
        tone === 'outline' && 'border border-current',
        className,
      )}
    >
      {children}
    </span>
  );
}
