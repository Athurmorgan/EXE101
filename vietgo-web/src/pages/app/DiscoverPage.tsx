import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinPlus, SearchX, Search, Sparkles } from 'lucide-react';
import { usePlaces } from '@/hooks/usePlaces';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Container } from '@/components/app-layout/Container';
import { PlaceCard, PlaceCardSkeleton } from '@/components/app-ui/PlaceCard';
import { Input } from '@/components/app-ui/Input';
import { Chip } from '@/components/app-ui/Chip';
import { Button } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { RegionSelect } from '@/components/app-ui/RegionSelect';

const CATEGORIES: { value: string | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'restaurant', label: 'Eat' },
  { value: 'cafe', label: 'Café' },
  { value: 'attraction', label: 'See' },
  { value: 'shopping', label: 'Shop' },
  { value: 'hotel', label: 'Stay' },
];

export function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [localOnly, setLocalOnly] = useState(false);
  const [regionId, setRegionId] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim());

  const { places, loading, source } = usePlaces({
    q: debouncedQuery || undefined,
    category,
    regionId: regionId || undefined,
    isHiddenPlace: localOnly || undefined,
    limit: 30,
  });

  const hasFilters = Boolean(query || category || localOnly || regionId);

  function resetFilters() {
    setQuery('');
    setCategory(undefined);
    setLocalOnly(false);
    setRegionId('');
  }

  return (
    <>
      <section className="border-b border-ink/20">
        <Container className="py-14 sm:py-20">
          <p className="app-eyebrow">Discover Vietnam</p>
          <h1 className="mt-5 max-w-2xl font-serif text-[2.75rem] leading-[1.02] tracking-[-0.015em] text-ink sm:text-6xl">
            Places <em className="italic">worth</em> knowing
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Local favourites and hidden corners, vetted by people who actually live there.
          </p>

          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
            <Input
              type="search"
              aria-label="Search places"
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="h-4 w-4" aria-hidden />}
              containerClassName="w-full lg:max-w-sm"
            />
            <RegionSelect
              aria-label="Filter by region"
              value={regionId}
              onChange={setRegionId}
              emptyLabel="All of Vietnam"
              containerClassName="w-full lg:max-w-56"
            />
            <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2 lg:ml-auto">
              {CATEGORIES.map((item) => (
                <Chip
                  key={item.label}
                  active={category === item.value}
                  onClick={() => setCategory(item.value)}
                >
                  {item.label}
                </Chip>
              ))}
              <span aria-hidden className="mx-1 hidden w-px self-stretch bg-ink/15 sm:block" />
              <Chip
                active={localOnly}
                onClick={() => setLocalOnly((v) => !v)}
                icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
              >
                Local picks
              </Chip>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        <div className="mb-8 flex items-baseline justify-between gap-4 text-sm text-muted">
          <span aria-live="polite">
            {loading ? 'Loading places…' : `${places.length} ${places.length === 1 ? 'place' : 'places'}`}
          </span>
          <span className="flex items-center gap-4">
            {source === 'mock' && !loading && <span className="text-xs">Sample data — API offline</span>}
            <Link to="/app/places/new" className="inline-flex items-center gap-1.5 text-ink underline-offset-4 hover:underline">
              <MapPinPlus className="h-4 w-4" aria-hidden /> Suggest a place
            </Link>
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        ) : places.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No places match"
            className="py-20"
            action={
              hasFilters && (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              )
            }
          >
            Try a different name, or widen the filters.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
