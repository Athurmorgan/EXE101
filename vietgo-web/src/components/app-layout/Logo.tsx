import { Link } from 'react-router-dom';
import { WheelMark } from '@/components/brand/WheelMark';
import { cn } from '@/lib/cn';

/** App logo — the same wheel as the landing; clicking it goes back to the landing page. */
export function Logo({ tone = 'dark', to = '/' }: { tone?: 'dark' | 'light'; to?: string }) {
  return (
    <Link
      to={to}
      aria-label="vivivu home"
      className={cn(
        'group inline-flex shrink-0 items-center gap-2 text-lg font-medium tracking-tight',
        tone === 'light' ? 'text-cream' : 'text-ink',
      )}
    >
      <WheelMark className="h-8 w-8 transition-transform duration-700 ease-out group-hover:rotate-180 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
      vivivu
    </Link>
  );
}
