import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Shared image slot for a Place — used by both PlaceCard (grid) and
 * PlaceDetailPage (hero). Falls back to a styled placeholder instead of a
 * blank box when the place has no photo yet (common for freshly
 * user-submitted or seeded places with no `PlacePhoto` rows).
 */
interface PlaceCoverProps {
  name: string;
  url?: string;
  className?: string;
  /** Thumbnail mode: drop the "No photo yet" caption, which collides with the initial at small sizes. */
  compact?: boolean;
}

export function PlaceCover({ name, url, className, compact = false }: PlaceCoverProps) {
  if (url) {
    return <img src={url} alt={name} loading="lazy" className={cn('object-cover', className)} />;
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      role="img"
      aria-label={`${name} — no photo yet`}
      className={cn('relative flex items-center justify-center bg-forest/[0.07]', className)}
    >
      <span className={cn('font-serif text-forest/20', compact ? 'text-3xl' : 'text-6xl')}>{initial}</span>
      {!compact && (
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 text-[11px] text-muted/70">
          <ImageOff className="h-3 w-3" aria-hidden />
          No photo yet
        </span>
      )}
    </div>
  );
}
