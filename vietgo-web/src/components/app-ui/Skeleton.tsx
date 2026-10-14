import { cn } from '@/lib/cn';

/** Neutral loading placeholder — reserves layout so content doesn't jump in. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse bg-ink/[0.06]', className)} />;
}
