import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Bookmark, CalendarClock, Loader2, StickyNote, Trash2 } from 'lucide-react';
import { useShortlist } from '@/hooks/useShortlist';
import { useDaySchedule } from '@/hooks/useDaySchedule';
import { useMutation } from '@/hooks/useMutation';
import type { ShortlistItem } from '@/types/api';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { PlaceCover } from '@/components/app-ui/PlaceCover';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { Alert } from '@/components/app-ui/Alert';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Textarea, Select } from '@/components/app-ui/Field';
import { Skeleton } from '@/components/app-ui/Skeleton';
import { categoryLabel, formatVnd, mealLabel } from '@/lib/format';

const ICON_BUTTON =
  'flex h-9 w-9 shrink-0 items-center justify-center text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';

export function ShortlistPage() {
  const { items, loading, error, remove, saveNotes, move } = useShortlist();

  return (
    <>
      <PageHeader
        eyebrow="Your trip"
        title="Shortlist"
        lead={
          loading
            ? 'Loading your saved places…'
            : `${items.length} saved ${items.length === 1 ? 'place' : 'places'} — the raw material for your itinerary.`
        }
        actions={
          items.length > 0 && (
            <Link to="/app/trips/new" className={buttonClasses('outline')}>
              Plan a full trip
            </Link>
          )
        }
      />

      <Container className="py-10 sm:py-12">
        {error && <Alert className="mb-8">{error}</Alert>}

        {loading ? (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="flex gap-5 py-5">
                <Skeleton className="h-24 w-32 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-3 h-5 w-1/2" />
                  <Skeleton className="mt-3 h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 && !error ? (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            action={
              <Link to="/app/discover" className={buttonClasses('dark')}>
                Browse places
              </Link>
            }
          >
            Tap “Save to shortlist” on any place and it lands here.
          </EmptyState>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ol className="divide-y divide-ink/10 border-y border-ink/10">
              {items.map((item, index) => (
                <ShortlistRow
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === items.length - 1}
                  onMove={move}
                  onRemove={remove}
                  onSaveNotes={saveNotes}
                />
              ))}
            </ol>
            <DayPlan items={items} />
          </div>
        )}
      </Container>
    </>
  );
}

function ShortlistRow({
  item,
  index,
  isLast,
  onMove,
  onRemove,
  onSaveNotes,
}: {
  item: ShortlistItem;
  index: number;
  isLast: boolean;
  onMove: (index: number, direction: -1 | 1) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const place = item.place;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.notes ?? '');
  const removal = useMutation(onRemove);
  const noteSave = useMutation(onSaveNotes, 'Could not save the note.');
  const error = noteSave.error ?? removal.error;

  if (!place) return null;

  const handleRemove = () => void removal.run(item.id);

  async function handleSave() {
    if ((await noteSave.run(item.id, draft.trim())).ok) setEditing(false);
  }

  return (
    <li className="py-5">
      <div className="flex items-center gap-4 sm:gap-6">
        <span className="w-6 shrink-0 font-serif text-lg text-muted tabular-nums">{index + 1}</span>
        <Link to={`/app/places/${place.id}`} className="shrink-0">
          <PlaceCover compact name={place.name} url={place.photos?.[0]?.url} className="h-20 w-28 sm:h-24 sm:w-32" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wider text-muted uppercase">{categoryLabel(place.category)}</p>
          <Link
            to={`/app/places/${place.id}`}
            className="mt-1 block truncate font-serif text-xl text-ink hover:underline hover:underline-offset-4"
          >
            {place.name}
          </Link>
          <p className="mt-1 truncate text-sm text-muted">
            {place.address}
            {place.avgMealPrice != null && ` · ~${formatVnd(place.avgMealPrice)}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col sm:flex-row">
          <button type="button" className={ICON_BUTTON} onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${place.name} up`} title="Move up">
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className={ICON_BUTTON} onClick={() => onMove(index, 1)} disabled={isLast} aria-label={`Move ${place.name} down`} title="Move down">
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={ICON_BUTTON}
            onClick={() => setEditing((v) => !v)}
            aria-expanded={editing}
            aria-label={`Note for ${place.name}`}
            title="Note"
          >
            <StickyNote className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removal.busy}
            aria-label={`Remove ${place.name} from shortlist`}
            title="Remove"
            className={`${ICON_BUTTON} hover:bg-red/5 hover:text-red`}
          >
            {removal.busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 sm:ml-12">
          <Textarea
            aria-label={`Note for ${place.name}`}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Order the bún chả, go before 11…"
            error={error ?? undefined}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="dark" onClick={handleSave} disabled={noteSave.busy}>
              {noteSave.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Save note
            </Button>
          </div>
        </div>
      ) : (
        <>
          {item.notes && (
            <p className="mt-3 border-l-2 border-forest/30 pl-3 text-sm text-muted italic sm:ml-12">{item.notes}</p>
          )}
          {error && <p className="mt-2 text-sm text-red sm:ml-12">{error}</p>}
        </>
      )}
    </li>
  );
}

function DayPlan({ items }: { items: ShortlistItem[] }) {
  const [startHour, setStartHour] = useState(9);
  const { plan, build } = useDaySchedule();
  const loading = build.busy;
  const error = build.error;

  const onBuild = () => void build.run(items.map((i) => i.placeId), startHour);

  return (
    <aside className="self-start border border-ink/10 bg-white p-6 lg:sticky lg:top-24">
      <h2 className="flex items-center gap-2 font-serif text-2xl text-ink">
        <CalendarClock className="h-5 w-5 text-forest" aria-hidden /> Day plan
      </h2>
      <p className="mt-2 text-sm text-muted">Turn these places into a route for one day, with meals in the right slots.</p>

      <div className="mt-5 flex items-end gap-3">
        <Select
          label="Start at"
          value={startHour}
          onChange={(e) => setStartHour(Number(e.target.value))}
          containerClassName="w-28"
        >
          {[6, 7, 8, 9, 10, 11, 12].map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </Select>
        <Button variant="dark" onClick={onBuild} disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {plan ? 'Rebuild' : 'Build my day'}
        </Button>
      </div>

      {error && <Alert className="mt-5">{error}</Alert>}

      {plan && plan.schedule.length > 0 && (
        <>
          <ol className="mt-6 border-t border-ink/10">
            {plan.schedule.map((stop) => (
              <li key={`${stop.placeId}-${stop.scheduledTime}`} className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 border-b border-ink/5 py-3">
                <span className="text-sm font-medium text-ink tabular-nums">{stop.scheduledTime}</span>
                <div className="min-w-0">
                  <Link to={`/app/places/${stop.placeId}`} className="block truncate text-sm font-medium text-ink hover:underline">
                    {stop.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {stop.mealType ? mealLabel(stop.mealType) : 'Visit'} · {stop.estimatedDurationMin} min
                    {stop.travelTimeFromPrevMin > 0 && ` · ${stop.travelTimeFromPrevMin} min travel`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">
            {plan.totalStops} stops
            {plan.estimatedCost > 0 && <> · about {formatVnd(plan.estimatedCost)}</>}
          </p>
        </>
      )}
    </aside>
  );
}
