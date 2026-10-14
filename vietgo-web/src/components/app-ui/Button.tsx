import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-red text-white hover:bg-red-dark',
  dark: 'bg-dark text-cream hover:bg-forest',
  outline: 'border border-ink/15 bg-white text-ink hover:border-ink/40',
  ghost: 'text-ink hover:bg-ink/5',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
};

/**
 * Class string for anything that should look like a button — use it on a
 * `<Link>` or `<a>` so links and buttons stay visually identical.
 * Square corners on purpose: the app's "sharp, not bubbly" direction.
 */
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />
  ),
);
Button.displayName = 'Button';
