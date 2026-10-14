import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, LocateFixed } from 'lucide-react';
import { useRegions } from '@/hooks/useRegions';
import { useGeolocation, useSubmitPlace } from '@/hooks/useSubmitPlace';
import { categoryLabel, mealLabel, priceLabel } from '@/lib/format';
import {
  CUISINES,
  EMPTY_PLACE_DRAFT as EMPTY,
  MEALS,
  PLACE_CATEGORIES as CATEGORIES,
  PRICES,
  isFoodPlace,
  validatePlaceDraft,
  type PlaceDraft,
} from '@/lib/placeDraft';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { Select, Textarea } from '@/components/app-ui/Field';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { SectionLabel } from '@/components/app-ui/SectionLabel';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';

export function NewPlacePage() {
  const { regions } = useRegions();
  const [form, setForm] = useState<PlaceDraft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const submit = useSubmitPlace();
  const { locating, locate } = useGeolocation();

  const isFood = isFoodPlace(form);

  function set<K extends keyof PlaceDraft>(key: K, value: PlaceDraft[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onRegion(regionId: string) {
    const region = regions.find((r) => r.id === regionId);
    setForm((f) => ({
      ...f,
      regionId,
      // Rough pin until the user gives a precise one.
      lat: f.lat || (region ? String(region.lat) : ''),
      lng: f.lng || (region ? String(region.lng) : ''),
    }));
  }

  async function locateMe() {
    try {
      const { lat, lng } = await locate();
      setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
    } catch (err) {
      setErrors((e) => ({ ...e, lat: (err as Error).message }));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validatePlaceDraft(form);
    setErrors(found);
    if (hasErrors(found)) return;
    if ((await submit.run(form)).ok) setDone(true);
  }

  if (done) {
    return (
      <Container className="max-w-2xl py-20">
        <EmptyState
          icon={CheckCircle2}
          title="Thanks — it's in the queue"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/app/discover" className={buttonClasses('dark')}>
                Back to Discover
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(EMPTY);
                  setDone(false);
                }}
              >
                Suggest another
              </Button>
            </div>
          }
        >
          A moderator will verify {form.name} before it appears in Discover.
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title="Suggest a place"
        lead="Know somewhere that belongs on the map? Every suggestion is checked before it goes live."
      />
      <Container className="max-w-3xl py-10 sm:py-12">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
          {submit.error && <Alert>{submit.error}</Alert>}

          <fieldset className="grid gap-6 sm:grid-cols-2">
            <SectionLabel className="sm:col-span-2">The basics</SectionLabel>
            <Input
              label="Name"
              value={form.name}
              maxLength={200}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
              containerClassName="sm:col-span-2"
            />
            <Select label="Type" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </Select>
            <RegionSelect label="Region" value={form.regionId} onChange={onRegion} emptyLabel="Choose a region" />
            <Textarea
              label="Why go?"
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <label className="flex items-start gap-3 text-sm text-ink sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isHiddenPlace}
                onChange={(e) => set('isHiddenPlace', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-forest"
              />
              <span>
                <span className="font-medium">Local secret</span>
                <span className="block text-muted">Mostly locals go here; not on the usual tourist lists.</span>
              </span>
            </label>
          </fieldset>

          <fieldset className="grid gap-6 sm:grid-cols-2">
            <SectionLabel className="sm:col-span-2">Where is it</SectionLabel>
            <Input
              label="Address"
              value={form.address}
              maxLength={500}
              onChange={(e) => set('address', e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Latitude"
              inputMode="decimal"
              value={form.lat}
              onChange={(e) => set('lat', e.target.value)}
              error={errors.lat}
            />
            <Input
              label="Longitude"
              inputMode="decimal"
              value={form.lng}
              onChange={(e) => set('lng', e.target.value)}
              error={errors.lng}
            />
            <div className="sm:col-span-2">
              <Button variant="outline" size="sm" onClick={locateMe} disabled={locating}>
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <LocateFixed className="h-4 w-4" aria-hidden />
                )}
                I'm there right now
              </Button>
              <p className="mt-2 text-xs text-muted">Picking a region fills in its centre as a starting point.</p>
            </div>
          </fieldset>

          {isFood && (
            <fieldset className="grid gap-6 sm:grid-cols-2">
              <SectionLabel className="sm:col-span-2">Food &amp; drink</SectionLabel>
              <Select label="Cuisine" value={form.cuisineType} onChange={(e) => set('cuisineType', e.target.value)}>
                <option value="">—</option>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </Select>
              <Select label="Best for" value={form.mealType} onChange={(e) => set('mealType', e.target.value)}>
                <option value="">—</option>
                {MEALS.map((m) => (
                  <option key={m} value={m}>
                    {mealLabel(m)}
                  </option>
                ))}
              </Select>
              <Select label="Price" value={form.priceRange} onChange={(e) => set('priceRange', e.target.value)}>
                <option value="">—</option>
                {PRICES.map((p) => (
                  <option key={p} value={p}>
                    {priceLabel(p)}
                  </option>
                ))}
              </Select>
              <Input
                label="Average per person (VND)"
                inputMode="numeric"
                value={form.avgMealPrice}
                onChange={(e) => set('avgMealPrice', e.target.value.replace(/[^\d]/g, ''))}
                error={errors.avgMealPrice}
                placeholder="60000"
              />
            </fieldset>
          )}

          <div className="flex justify-end gap-3 border-t border-ink/10 pt-6">
            <Link to="/app/discover" className={buttonClasses('ghost')}>
              Cancel
            </Link>
            <Button type="submit" variant="dark" disabled={submit.busy}>
              {submit.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Submit for review
            </Button>
          </div>
        </form>
      </Container>
    </>
  );
}
