import { useMemo, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, ChevronRight, MapPin, Navigation, Star } from 'lucide-react';
import { usePlace } from '@/hooks/usePlace';
import { Container } from '@/components/app-layout/Container';
import { Badge } from '@/components/app-ui/Badge';
import { buttonClasses } from '@/components/app-ui/Button';
import { PlaceCover } from '@/components/app-ui/PlaceCover';
import { ShortlistButton } from '@/components/app-ui/ShortlistButton';
import { Skeleton } from '@/components/app-ui/Skeleton';
import { SectionLabel } from '@/components/app-ui/SectionLabel';
import { ReactionBar } from '@/components/app-ui/ReactionBar';
import { CommentThread } from '@/components/app-ui/CommentThread';
import { PlaceStories } from '@/components/app-ui/PlaceStories';
import { DAY_NAMES, categoryLabel, formatVnd, mapsUrl, mealLabel, priceLabel } from '@/lib/format';

interface Fact {
  label: string;
  value: ReactNode;
}

/**
 * Layout modelled on the Condé Nast Traveler article page we reviewed:
 * serif display title, small-caps labels, a fact sheet beside the story,
 * square corners throughout.
 */
export function PlaceDetailPage() {
  const { id = '' } = useParams();
  const { place, loading } = usePlace(id);
  const target = useMemo(() => ({ kind: 'place' as const, id }), [id]);

  if (loading) return <DetailSkeleton />;

  if (!place) {
    return (
      <Container className="flex flex-col items-center py-32 text-center">
        <h1 className="font-serif text-3xl text-ink">Place not found</h1>
        <p className="mt-2 text-sm text-muted">It may have been removed or is still awaiting review.</p>
        <Link to="/app/discover" className={buttonClasses('outline', 'md', 'mt-6')}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Discover
        </Link>
      </Container>
    );
  }

  const candidates: (Fact | false | null | '')[] = [
    place.priceRange && { label: 'Price', value: priceLabel(place.priceRange) },
    place.avgMealPrice != null && { label: 'Per person', value: `~${formatVnd(place.avgMealPrice)}` },
    place.mealType && { label: 'Best for', value: mealLabel(place.mealType) },
    place.cuisineType && { label: 'Cuisine', value: categoryLabel(place.cuisineType) },
    place.googleRating != null && {
      label: 'Google rating',
      value: (
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          {place.googleRating.toFixed(1)}
          {place.googleReviews != null && (
            <span className="text-muted">({place.googleReviews.toLocaleString('en')})</span>
          )}
        </span>
      ),
    },
  ];
  const facts = candidates.filter((fact): fact is Fact => Boolean(fact));

  const hours = [...(place.openingHours ?? [])].sort(
    (a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7),
  );

  return (
    <article className="pb-20">
      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
          <Link to="/app/discover" className="hover:text-ink">
            Discover
          </Link>
          {place.region && (
            <>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span>{place.region.name}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span aria-current="page" className="truncate text-ink">
            {place.name}
          </span>
        </nav>

        <header className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tracking-wider text-muted uppercase">
                {categoryLabel(place.category)}
              </span>
              {place.isHiddenPlace && <Badge>Local pick</Badge>}
              {place.source === 'VERIFIED_LOCAL' && (
                <Badge tone="outline" className="text-green">
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                  Verified local
                </Badge>
              )}
            </div>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {place.name}
            </h1>
            {place.address && (
              <p className="mt-5 flex items-start gap-2 text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {place.address}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
            <ShortlistButton placeId={place.id} />
            <a
              href={mapsUrl(place.lat, place.lng)}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses('outline')}
            >
              <Navigation className="h-4 w-4" aria-hidden />
              Directions
            </a>
          </div>
        </header>
      </Container>

      <Container className="mt-10">
        <PlaceCover
          name={place.name}
          url={place.photos?.[0]?.url}
          className="aspect-[16/9] w-full lg:aspect-[21/9]"
        />
        {place.photos?.[0]?.caption && (
          <p className="mt-2 text-xs text-muted">{place.photos[0].caption}</p>
        )}
      </Container>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="max-w-2xl">
          <SectionLabel>About</SectionLabel>
          <p className="mt-4 font-serif text-xl leading-relaxed text-ink">
            {place.description ?? 'No description yet.'}
          </p>

          {hours.length > 0 && (
            <section className="mt-14">
              <SectionLabel>Opening hours</SectionLabel>
              <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10 text-sm">
                {hours.map((h) => (
                  <div key={h.dayOfWeek} className="flex justify-between py-2.5">
                    <dt className="text-muted">{DAY_NAMES[h.dayOfWeek]}</dt>
                    <dd className="text-ink tabular-nums">
                      {h.isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="mt-14">
            <SectionLabel>Your take</SectionLabel>
            <div className="mt-4">
              <ReactionBar target={target} />
            </div>
          </section>

          <PlaceStories placeId={place.id} placeName={place.name} />

          <div className="mt-16">
            <CommentThread target={target} />
          </div>
        </div>

        {facts.length > 0 && (
          <aside className="h-fit border border-ink/10 bg-white lg:sticky lg:top-24">
            <h2 className="border-b border-ink/10 px-5 py-3 text-xs font-medium tracking-wider text-muted uppercase">
              At a glance
            </h2>
            <dl className="divide-y divide-ink/10 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <dt className="text-muted">{fact.label}</dt>
                  <dd className="text-right text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </Container>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <Container className="pt-8 pb-20" >
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-10 h-3 w-24" />
      <Skeleton className="mt-5 h-12 w-2/3" />
      <Skeleton className="mt-5 h-4 w-1/3" />
      <Skeleton className="mt-10 aspect-[21/9] w-full" />
    </Container>
  );
}
