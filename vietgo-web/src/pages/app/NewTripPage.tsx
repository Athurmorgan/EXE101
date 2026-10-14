import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { createItinerary, generateOptions } from '@/lib/api/itineraries';
import { errorMessage } from '@/lib/api/client';
import { isoDate } from '@/lib/format';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';

const MAX_DAYS = 14;
const DAY_MS = 86_400_000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function NewTripPage() {
  const navigate = useNavigate();
  const today = isoDate(new Date());
  const [regionId, setRegionId] = useState('');
  const [startDate, setStartDate] = useState(isoDate(addDays(new Date(), 7)));
  const [endDate, setEndDate] = useState(isoDate(addDays(new Date(), 9)));
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'creating' | 'generating'>('idle');

  const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS) + 1;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!regionId) next.regionId = 'Where are you going?';
    if (!startDate) next.startDate = 'Pick a start date.';
    if (!endDate || days < 1) next.endDate = 'The trip has to end on or after it starts.';
    else if (days > MAX_DAYS) next.endDate = `Keep it to ${MAX_DAYS} days or fewer.`;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError(null);
    setStep('creating');
    let tripId: string | null = null;
    try {
      const trip = await createItinerary({
        regionId,
        startDate,
        endDate,
        title: title.trim() || undefined,
        budgetVnd: budget ? Number(budget) : undefined,
      });
      tripId = trip.id;
      setStep('generating');
      await generateOptions(trip.id);
      navigate(`/app/trips/${trip.id}`, { replace: true });
    } catch (err) {
      // The trip exists even if the AI step failed — let the user retry from its page.
      if (tripId) navigate(`/app/trips/${tripId}`, { replace: true, state: { generateError: errorMessage(err) } });
      else setFormError(errorMessage(err, 'Could not create the trip.'));
      setStep('idle');
    }
  }

  const busy = step !== 'idle';

  return (
    <>
      <PageHeader
        eyebrow="Plan a trip"
        title="Where to next?"
        lead="We'll draft five different plans — food-first, slow mornings, packed days — and you pick one."
      />
      <Container className="max-w-2xl py-10 sm:py-12">
        <form onSubmit={onSubmit} noValidate className="grid gap-6 sm:grid-cols-2">
          {formError && <Alert className="sm:col-span-2">{formError}</Alert>}

          <RegionSelect
            label="Destination"
            value={regionId}
            onChange={setRegionId}
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
          <Input
            label="Trip name (optional)"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Long weekend in Hội An"
          />
          <Input
            label="Budget per person (VND, optional)"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="3000000"
          />

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
