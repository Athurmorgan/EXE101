import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { useAdminPlaces } from '@/hooks/useAdminPlaces';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { categoryLabel } from '@/lib/format';
import { PLACE_CATEGORIES } from '@/lib/placeDraft';
import { cn } from '@/lib/cn';
import type { Place } from '@/types/api';
import { Alert } from '@/components/app-ui/Alert';
import { Badge } from '@/components/app-ui/Badge';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Input } from '@/components/app-ui/Input';
import { Select } from '@/components/app-ui/Field';
import { Skeleton } from '@/components/app-ui/Skeleton';

/** Admin-only: browse every live place, fix its details or take it down. */
export function PlacesPanel() {
  const { query, places, total, page, totalPages, loaded, loading, error, remove, filter, goToPage } = useAdminPlaces();
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), 300);

  useEffect(() => {
    filter({ q: q || undefined });
    // `filter` is a fresh closure every render; only the debounced text matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Place name"
          containerClassName="sm:w-72"
        />
        <Select
          label="Type"
          value={query.category ?? ''}
          onChange={(e) => filter({ category: e.target.value || undefined })}
          containerClassName="sm:w-44"
        >
          <option value="">All types</option>
          {PLACE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </Select>
        {loaded && <span className="text-sm text-muted sm:ml-auto sm:pb-3">{total} live places</span>}
      </div>

      {error && <Alert className="mt-6">{error}</Alert>}
      {remove.error && <Alert className="mt-6">{remove.error}</Alert>}

      {loading && !loaded ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : places.length === 0 && !error ? (
        <EmptyState icon={MapPin} title="No places match" className="mt-6" />
      ) : (
        <ul className={cn('mt-6 divide-y divide-ink/10 border-y border-ink/10', loading && 'opacity-60')}>
          {places.map((place) => (
            <PlaceRow
              key={place.id}
              place={place}
              busy={remove.busy}
              onDelete={() => {
                if (window.confirm(`Delete ${place.name}? This removes it for everyone and can't be undone.`)) {
                  void remove.run(place.id);
                }
              }}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

function PlaceRow({ place, busy, onDelete }: { place: Place; busy: boolean; onDelete: () => void }) {
  return (
    <li className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <Link to={`/app/places/${place.id}`} className="truncate font-medium text-ink hover:underline hover:underline-offset-4">
            {place.name}
          </Link>
          {place.isHiddenPlace && <Badge>Local secret</Badge>}
        </p>
        <p className="truncate text-xs text-muted">
          {categoryLabel(place.category)}
          {place.region && <> · {place.region.name}</>}
          {place.address && <> · {place.address}</>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link to={`/app/admin/places/${place.id}/edit`} className={buttonClasses('outline', 'sm')}>
          Edit
        </Link>
        <Button size="sm" variant="ghost" className="text-red hover:bg-red/5" disabled={busy} onClick={onDelete}>
          Delete
        </Button>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label="Working" />}
      </div>
    </li>
  );
}
