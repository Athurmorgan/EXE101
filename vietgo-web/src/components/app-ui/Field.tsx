import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

/** Same border/focus treatment as `Input`, shared by the textarea and select below. */
export const FIELD_CLASSES = cn(
  'w-full border border-ink/15 bg-white px-3.5 text-sm text-ink transition-colors',
  'placeholder:text-muted/70 hover:border-ink/30',
  'focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-60',
);

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, className, children }: FieldShellProps) {
  const message = error ?? hint;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {message && (
        <p id={`${id}-message`} className={cn('text-xs', error ? 'text-red' : 'text-muted')}>
          {message}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, containerClassName, className, id, rows = 4, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell id={fieldId} label={label} hint={hint} error={error} className={containerClassName}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-message` : undefined}
          className={cn(FIELD_CLASSES, 'py-2.5 leading-relaxed', error && 'border-red', className)}
          {...props}
        />
      </FieldShell>
    );
  },
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, containerClassName, className, id, children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell id={fieldId} label={label} hint={hint} error={error} className={containerClassName}>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-message` : undefined}
          className={cn(FIELD_CLASSES, 'h-11 pr-8', error && 'border-red', className)}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  },
);
Select.displayName = 'Select';
