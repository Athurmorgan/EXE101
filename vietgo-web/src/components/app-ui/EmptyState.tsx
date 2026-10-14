import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, children, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center border border-dashed border-ink/15 px-6 py-16 text-center',
        className,
      )}
    >
      <Icon className="h-8 w-8 text-muted" aria-hidden />
      <h2 className="mt-4 font-serif text-2xl text-ink">{title}</h2>
      {children && <p className="mt-2 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
