import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Coffee, Loader2, MapPin, RefreshCw, Sparkles, Trash2, Utensils } from 'lucide-react';
import { useTrip } from '@/hooks/useTrips';
import { formatDate, formatVnd, mapsUrl, mealLabel } from '@/lib/format';
import { addDays, tripTitle } from '@/lib/itinerary';
import type { ItineraryStop } from '@/types/api';
import { cn } from '@/lib/cn';
import { Container } from '@/components/app-layout/Container';
import { Alert } from '@/components/app-ui/Alert';
import { Badge } from '@/components/app-ui/Badge';
import { Button } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Skeleton } from '@/components/app-ui/Skeleton';

export function TripDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    trip,
    loading,
    error,
    applied,
    optionNumbers,
    current,
    days,
    summary,
    busy,
    actionError,
    pick,
    generate,
    apply,
    remove,
  } = useTrip(id, (location.state as { generateError?: string } | null)?.generateError ?? null);

  const onGenerate = () => void generate();
  const onApply = () => void apply();

  async function onDelete() {
    if (!window.confirm('Delete this trip?')) return;
    if (await remove()) navigate('/app/trips', { replace: true });
  }

  return (
    <Container className="py-10 sm:py-14">
      <Link to="/app/trips" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All trips
      </Link>

      {loading && !trip ? (
        <div className="mt-10">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-4 h-12 w-2/3" />
          <Skeleton className="mt-10 h-64 w-full" />
        </div>
      ) : error || !trip ? (
        <Alert className="mt-10">{error ?? 'Trip not found.'}</Alert>
      ) : (
        <>
          <header className="mt-10 flex flex-col gap-6 border-b border-ink/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-wider text-muted uppercase">
                {trip.region?.name ?? 'Vietnam'} · {trip.days} {trip.days === 1 ? 'day' : 'days'}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
                {tripTitle(trip)}
              </h1>
              <p className="mt-4 text-muted">
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!applied && (
                <Button variant="outline" onClick={onGenerate} disabled={busy !== null}>
                  {busy === 'generate' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden />
                  )}
                  {optionNumbers.length ? 'Regenerate' : 'Generate plans'}
                </Button>
              )}
              <Button variant="ghost" onClick={onDelete} disabled={busy !== null}>
                <Trash2 className="h-4 w-4" aria-hidden /> Delete
              </Button>
            </div>
          </header>

          {actionError && <Alert className="mt-8">{actionError}</Alert>}

          {busy === 'generate' ? (
            <div className="mt-10 flex flex-col items-center gap-3 py-20 text-center text-muted" aria-live="polite">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              Drafting five plans — this can take up to a minute…
            </div>
          ) : optionNumbers.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No plans yet"
              className="mt-10"
              action={
                <Button variant="dark" onClick={onGenerate}>
                  <Sparkles className="h-4 w-4" aria-hidden /> Generate plans
                </Button>
              }
            >
              Ask the AI for five different ways to spend these days.
            </EmptyState>
          ) : (
            <div className="mt-10">
              {!applied && (
                <div role="tablist" aria-label="Plan options" className="flex flex-wrap gap-2">
                  {optionNumbers.map((n) => (
                    <button
                      key={n}
                      role="tab"
                      type="button"
                      aria-selected={current === n}
                      onClick={() => pick(n)}
                      className={cn(
                        'h-10 border px-4 text-sm font-medium transition-colors',
                        current === n
                          ? 'border-dark bg-dark text-cream'
                          : 'border-ink/15 bg-white text-ink hover:border-ink/40',
                      )}
                    >
                      Plan {n}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-4 border border-ink/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {applied ? <Badge>Your plan</Badge> : <span className="font-medium text-ink">Plan {current}</span>}
                  <span className="text-muted">
                    {summary.stops} stops
                    {summary.cost > 0 && ` · about ${formatVnd(summary.cost)} per person`}
                  </span>
                </div>
                {!applied && (
                  <Button variant="dark" onClick={onApply} disabled={busy !== null}>
                    {busy === 'apply' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Check className="h-4 w-4" aria-hidden />
                    )}
                    Choose plan {current}
                  </Button>
                )}
              </div>
              {!applied && (
                <p className="mt-3 text-xs text-muted">Choosing a plan keeps it and discards the other four.</p>
              )}

              <div className="mt-10 grid gap-12 lg:grid-cols-2">
                {days &&
                  [...days.entries()].map(([day, stops]) => (
                    <section key={day}>
                      <h2 className="flex items-baseline gap-3 border-b border-ink/10 pb-3">
                        <span className="font-serif text-2xl text-ink">Day {day}</span>
                        <span className="text-sm text-muted">
                          {formatDate(addDays(trip.startDate, day - 1), {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </h2>
                      <ol className="mt-2">
                        {stops.map((stop) => (
                          <StopRow key={stop.id} stop={stop} />
                        ))}
                      </ol>
                    </section>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

function StopRow({ stop }: { stop: ItineraryStop }) {
  const Icon = stop.stopType === 'meal' ? (stop.mealType === 'coffee' ? Coffee : Utensils) : MapPin;
  return (
    <li className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-b border-ink/5 py-4">
      <span className="pt-0.5 text-sm font-medium text-ink tabular-nums">{stop.scheduledTime ?? '—'}</span>
      <div>
        <p className="flex items-start gap-2">
          <Icon className="mt-1 h-4 w-4 shrink-0 text-forest" aria-hidden />
          {stop.placeId ? (
            <Link to={`/app/places/${stop.placeId}`} className="font-medium text-ink hover:underline hover:underline-offset-4">
              {stop.placeName}
            </Link>
          ) : (
            <a
              href={mapsUrl(stop.placeLat, stop.placeLng)}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-ink hover:underline hover:underline-offset-4"
            >
              {stop.placeName}
            </a>
          )}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 pl-6 text-xs text-muted">
          {stop.mealType && <span>{mealLabel(stop.mealType)}</span>}
          {stop.estimatedDuration != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden /> {stop.estimatedDuration} min
            </span>
          )}
          {stop.estimatedCost != null && stop.estimatedCost > 0 && <span>~{formatVnd(stop.estimatedCost)}</span>}
          {stop.travelTimeFromPrevMin != null && stop.travelTimeFromPrevMin > 0 && (
            <span>{stop.travelTimeFromPrevMin} min from previous</span>
          )}
        </p>
        {stop.notes && <p className="mt-2 pl-6 text-sm leading-relaxed text-muted">{stop.notes}</p>}
      </div>
    </li>
  );
}
