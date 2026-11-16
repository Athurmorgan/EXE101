import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Check, Loader2, LocateFixed, Sparkles } from 'lucide-react';
import { useCreateTrip } from '@/hooks/useTrips';
import { useShortlist } from '@/hooks/useShortlist';
import { isoDate } from '@/lib/format';
import { defaultTripDates, tripLength, validateTrip } from '@/lib/itinerary';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { cn } from '@/lib/cn';
import { DIETARY_OPTIONS, TRIP_STYLES, type Dietary, type TripStyle } from '@/types/api';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { Select } from '@/components/app-ui/Field';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { Chip } from '@/components/app-ui/Chip';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { SectionLabel } from '@/components/app-ui/SectionLabel';

const STYLE_LABELS: Record<TripStyle, string> = {
  foodie: 'Food first',
  cultural: 'Culture',
  relaxation: 'Slow pace',
  adventure: 'Adventure',
  family: 'Family',
  budget: 'Budget',
  luxury: 'Luxury',
};

const DIETARY_LABELS: Record<Dietary, string> = {
  none: 'No restrictions',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  halal: 'Halal',
  'gluten-free': 'Gluten-free',
};

const MAX_PREFERRED = 10;

type StartPoint = { lat: number; lng: number; label: string } | null;

export function NewTripPage() {
  const navigate = useNavigate();
  const today = isoDate(new Date());
  const [regionId, setRegionId] = useState('');
  const [startDate, setStartDate] = useState(() => defaultTripDates().startDate);
  const [endDate, setEndDate] = useState(() => defaultTripDates().endDate);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [styles, setStyles] = useState<TripStyle[]>([]);
  const [dietary, setDietary] = useState<Dietary>('none');
  const [start, setStart] = useState<StartPoint>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [preferred, setPreferred] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { step, busy, error: formError, create } = useCreateTrip();
  const { items: shortlist } = useShortlist();

  const days = tripLength(startDate, endDate);
  // Only shortlist places in the chosen region can be forced into the plan.
  const candidates = shortlist.filter((item) => item.place && (!regionId || item.place.regionId === regionId));

  function toggleStyle(style: TripStyle) {
    setStyles((current) => (current.includes(style) ? current.filter((s) => s !== style) : [...current, style]));
  }

  function togglePreferred(placeId: string) {
    setPreferred((current) =>
      current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : current.length < MAX_PREFERRED
          ? [...current, placeId]
          : current,
    );
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError('Your browser cannot share your location.');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStart({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'My location' });
        setLocating(false);
      },
      () => {
        setLocateError('Could not get your location — check the browser permission.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateTrip({ regionId, startDate, endDate });
    setErrors(found);
    if (hasErrors(found)) return;

    const result = await create({
      regionId,
      startDate,
      endDate,
      title: title.trim() || undefined,
      budgetVnd: budget ? Number(budget) : undefined,
      travelers: Number(travelers) || undefined,
      styles: styles.length ? styles : undefined,
      dietary: dietary === 'none' ? undefined : dietary,
      // Keep only picks that still belong to the chosen region.
      preferredPlaceIds: preferred.filter((id) => candidates.some((c) => c.placeId === id)),
      startLat: start?.lat,
      startLng: start?.lng,
      startLabel: start?.label,
    });
    // The trip exists even if the AI step failed — its page lets the user retry.
    if (result) navigate(`/app/trips/${result.tripId}`, { replace: true, state: { generateError: result.generateError } });
  }

  return (
    <>
      <PageHeader
        eyebrow="Plan a trip"
        title="Where to next?"
        lead="Five different plans, built only from places locals have vetted — timed around meals, opening hours and how far things really are."
      />
      <Container className="max-w-2xl py-10 sm:py-12">
        <form onSubmit={onSubmit} noValidate className="grid gap-6 sm:grid-cols-2">
          {formError && <Alert className="sm:col-span-2">{formError}</Alert>}

          <RegionSelect
            label="Destination"
            value={regionId}
            onChange={(id) => {
              setRegionId(id);
              setPreferred([]);
            }}
            error={errors.regionId}
            containerClassName="sm:col-span-2"
          />
          <Input
            type="date"
            label="From"
            min={today}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (e.target.value > endDate) setEndDate(e.target.value);
            }}
            error={errors.startDate}
          />
          <Input
            type="date"
            label="To"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
            hint={days >= 1 && !errors.endDate ? `${days} ${days === 1 ? 'day' : 'days'}` : undefined}
          />

          <SectionLabel className="sm:col-span-2">How you like to travel</SectionLabel>
          <div role="group" aria-label="Travel styles" className="flex flex-wrap gap-2 sm:col-span-2">
            {TRIP_STYLES.map((style) => (
              <Chip key={style} active={styles.includes(style)} onClick={() => toggleStyle(style)}>
                {STYLE_LABELS[style]}
              </Chip>
            ))}
          </div>
          <Input
            type="number"
            label="Travellers"
            min={1}
            max={20}
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
          />
          <Select label="Food" value={dietary} onChange={(e) => setDietary(e.target.value as Dietary)}>
            {DIETARY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {DIETARY_LABELS[d]}
              </option>
            ))}
          </Select>
          <Input
            label="Budget per person (VND, optional)"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="3000000"
          />
          <Input
            label="Trip name (optional)"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Long weekend in Hội An"
          />

          <SectionLabel className="sm:col-span-2">Each day starts from</SectionLabel>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <Chip active={start === null} onClick={() => setStart(null)} icon={<Building2 className="h-3.5 w-3.5" aria-hidden />}>
              City centre
            </Chip>
            <Chip
              active={start !== null}
              onClick={useMyLocation}
              icon={locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <LocateFixed className="h-3.5 w-3.5" aria-hidden />}
            >
              {start ? `${start.label} · ${start.lat.toFixed(3)}, ${start.lng.toFixed(3)}` : 'Use my location'}
            </Chip>
            {locateError && <p className="basis-full text-xs text-red">{locateError}</p>}
          </div>

          {candidates.length > 0 && (
            <>
              <SectionLabel className="sm:col-span-2">Must include</SectionLabel>
              <div className="sm:col-span-2">
                <p className="mb-3 text-sm text-muted">
                  From your shortlist{regionId ? ' in this region' : ''}. Every plan will fit these in.
                </p>
                <ul className="flex flex-wrap gap-2" aria-label="Shortlisted places">
                  {candidates.map((item) => {
                    const active = preferred.includes(item.placeId);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => togglePreferred(item.placeId)}
                          className={cn(
                            'inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors',
                            active ? 'border-ink bg-ink text-cream' : 'border-ink/25 text-ink hover:border-ink/60',
                          )}
                        >
                          {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                          {item.place?.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {preferred.length >= MAX_PREFERRED && (
                  <p className="mt-2 text-xs text-muted">Up to {MAX_PREFERRED} places can be pinned.</p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
            {step === 'generating' && (
              <p className="text-sm text-muted sm:mr-auto" aria-live="polite">
                Drafting five plans — this can take up to a minute…
              </p>
            )}
            <Link to="/app/trips" className={buttonClasses('ghost')}>
              Cancel
            </Link>
            <Button type="submit" variant="dark" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              Generate plans
            </Button>
          </div>
        </form>
      </Container>
    </>
  );
}
