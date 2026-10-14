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
        'border px-4 py-3 text-sm',
        tone === 'error' && 'border-red/30 bg-red/5 text-red-dark',
        tone === 'info' && 'border-forest/20 bg-forest/5 text-forest',
        tone === 'success' && 'border-green/30 bg-mint/10 text-green',
        className,
      )}
    >
      {children}
    </div>
  );
}
