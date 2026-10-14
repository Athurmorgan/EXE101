import { Link } from 'react-router-dom';
import { ArrowRight, Map, Plus } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { formatDate } from '@/lib/format';
import { tripStatusLabel, tripTitle } from '@/lib/itinerary';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Alert } from '@/components/app-ui/Alert';
import { Badge } from '@/components/app-ui/Badge';
import { buttonClasses } from '@/components/app-ui/Button';
import { Skeleton } from '@/components/app-ui/Skeleton';

export function TripsPage() {
  const { trips, loading, error } = useTrips();

  return (
    <>
      <PageHeader
        eyebrow="Your trips"
        title="Trips"
        lead="Tell us where and when — the AI drafts five different ways to spend it."
        actions={
          <Link to="/app/trips/new" className={buttonClasses('dark')}>
            <Plus className="h-4 w-4" aria-hidden /> Plan a trip
          </Link>
        }
      />
      <Container className="py-10 sm:py-12">
        {error && <Alert className="mb-8">{error}</Alert>}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : trips.length === 0 && !error ? (
          <EmptyState
            icon={Map}
            title="No trips yet"
            action={
              <Link to="/app/trips/new" className={buttonClasses('dark')}>
                Plan your first trip
              </Link>
            }
          >
            Pick a region and your dates; you can compare five AI-drafted plans before committing to one.
          </EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link
                  to={`/app/trips/${trip.id}`}
                  className="group flex h-full flex-col border border-ink/10 bg-white p-6 transition-colors hover:border-ink/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium tracking-wider text-muted uppercase">
                      {trip.region?.name ?? 'Vietnam'}
                    </p>
                    <Badge tone={trip.status === 'APPLIED' ? 'mint' : 'outline'} className={trip.status === 'APPLIED' ? '' : 'text-muted'}>
                      {tripStatusLabel(trip)}
                    </Badge>
                  </div>
                  <h2 className="mt-3 font-serif text-2xl leading-snug text-ink">
                    {tripTitle(trip)}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {trip.days}{' '}
                    {trip.days === 1 ? 'day' : 'days'}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-ink">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
