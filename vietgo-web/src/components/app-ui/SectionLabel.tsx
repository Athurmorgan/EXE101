import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Small-caps section heading with a hairline running to the right edge. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('flex items-center gap-3 text-xs font-medium tracking-wider text-muted uppercase', className)}>
      {children}
      <span aria-hidden className="h-px flex-1 bg-ink/10" />
    </h2>
  );
}
