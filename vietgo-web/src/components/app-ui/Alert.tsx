import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AlertProps {
  tone?: 'error' | 'info' | 'success';
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'error', children, className }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        tone === 'error' && 'border-red/30 bg-red/5 text-red-dark',
        tone === 'info' && 'border-gold-deep/30 bg-gold/10 text-ink',
        tone === 'success' && 'border-forest/30 bg-forest/5 text-forest',
        className,
      )}
    >
      {children}
    </div>
  );
}
