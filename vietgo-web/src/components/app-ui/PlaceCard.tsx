import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Place } from '@/types/api';
import { categoryLabel, formatVnd, priceLabel } from '@/lib/format';
import { Badge } from './Badge';
import { PlaceCover } from './PlaceCover';
import { Skeleton } from './Skeleton';

/** Editorial-style card: image, then type-led text — no floating box or drop shadow. */
export function PlaceCard({ place }: { place: Place }) {
  return (
    <Link to={`/app/places/${place.id}`} className="group flex flex-col focus-visible:outline-none">
      <div className="relative aspect-[4/3] overflow-hidden ring-forest ring-offset-2 ring-offset-cream group-focus-visible:ring-2">
        <PlaceCover
          name={place.name}
          url={place.photos?.[0]?.url}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {place.isHiddenPlace && <Badge className="absolute top-3 left-3">Local pick</Badge>}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-xs font-medium tracking-wider text-muted uppercase">
          {categoryLabel(place.category)}
          {place.region && <span> · {place.region.name}</span>}
        </p>
        <h3 className="mt-1.5 font-serif text-xl leading-snug text-ink decoration-1 underline-offset-4 group-hover:underline">
          {place.name}
        </h3>
        {place.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{place.description}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-3 text-sm">
          {place.priceRange && <span className="text-ink">{priceLabel(place.priceRange)}</span>}
          {place.avgMealPrice != null && (
            <span className="text-muted">~{formatVnd(place.avgMealPrice)}</span>
          )}
          {place.googleRating != null && (
            <span className="ml-auto inline-flex items-center gap-1 text-ink">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              {place.googleRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}
