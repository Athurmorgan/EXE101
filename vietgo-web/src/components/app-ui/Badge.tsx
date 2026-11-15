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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
        // `mint` is the historical name for the default accent, now the landing's light gold.
        tone === 'mint' && 'bg-gold-light text-ink',
        tone === 'dark' && 'bg-ink text-cream',
        tone === 'outline' && 'border border-current',
        className,
      )}
    >
      {children}
    </span>
  );
}
