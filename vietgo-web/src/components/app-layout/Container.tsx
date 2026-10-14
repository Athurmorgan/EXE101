import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** One max-width + gutter for every app page, so edges line up across the header, content and footer. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8', className)}>{children}</div>;
}
