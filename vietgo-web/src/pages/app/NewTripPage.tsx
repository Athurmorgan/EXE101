import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { useCreateTrip } from '@/hooks/useTrips';
import { isoDate } from '@/lib/format';
import { defaultTripDates, tripLength, validateTrip } from '@/lib/itinerary';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';

export function NewTripPage() {
  const navigate = useNavigate();
  const today = isoDate(new Date());
  const [regionId, setRegionId] = useState('');
  const [startDate, setStartDate] = useState(() => defaultTripDates().startDate);
  const [endDate, setEndDate] = useState(() => defaultTripDates().endDate);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const { step, busy, error: formError, create } = useCreateTrip();

  const days = tripLength(startDate, endDate);

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
    });
    // The trip exists even if the AI step failed — its page lets the user retry.
    if (result) navigate(`/app/trips/${result.tripId}`, { replace: true, state: { generateError: result.generateError } });
  }

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
