import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Leading icon, e.g. a search glass. */
  icon?: ReactNode;
  /** Applied to the outer wrapper; `className` styles the `<input>` itself. */
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, hint, error, icon, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;
    const message = error ?? hint;

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={message ? messageId : undefined}
            className={cn(
              'h-11 w-full border border-ink/15 bg-white px-3.5 text-sm text-ink transition-colors',
              'placeholder:text-muted/70 hover:border-ink/30',
              'focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none',
              icon && 'pl-10',
              error && 'border-red focus:border-red focus:ring-red/15',
              className,
            )}
            {...props}
          />
        </div>
        {message && (
          <p id={messageId} className={cn('text-xs', error ? 'text-red' : 'text-muted')}>
            {message}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
