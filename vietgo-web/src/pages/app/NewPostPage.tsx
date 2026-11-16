import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin, MapPinPlus } from 'lucide-react';
import { useCreatePost } from '@/hooks/usePosts';
import { usePlaces } from '@/hooks/usePlaces';
import { useMutation } from '@/hooks/useMutation';
import { submitPlace } from '@/lib/api/places';
import { PLACE_CATEGORIES } from '@/lib/placeDraft';
import { categoryLabel } from '@/lib/format';
import { formatDistance } from '@/lib/geo';
import type { GeoFix } from '@/hooks/useSubmitPlace';
import {
  POST_LIMITS,
  hasErrors,
  splitLines,
  validatePost,
  type FieldErrors,
} from '@/lib/validation';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { Select, Textarea } from '@/components/app-ui/Field';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Chip } from '@/components/app-ui/Chip';
import { SectionLabel } from '@/components/app-ui/SectionLabel';
import { LocationPicker, type LatLng } from '@/components/app-ui/LocationPicker';
import { cn } from '@/lib/cn';

/** Sentinel for "none of the nearby places — add a new one". */
const NEW_PLACE = 'new';

export function NewPostPage() {
  const [params] = useSearchParams();
  const placeId = params.get('placeId') ?? undefined;
  const placeName = params.get('placeName') ?? undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [regionId, setRegionId] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const publish = useCreatePost();

  // "Where is this?" — only when the story didn't start from a place page.
  const [pinning, setPinning] = useState(false);
  const [pin, setPin] = useState<LatLng | null>(null);
  const [checkin, setCheckin] = useState<GeoFix | null>(null);
  const [choice, setChoice] = useState<string>(''); // nearby place id | NEW_PLACE | ''
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('restaurant');
  const [newAddress, setNewAddress] = useState('');
  const [hidden, setHidden] = useState(true);
  // Keeps the id if the post fails after the place was created, so a retry doesn't duplicate it.
  const [createdPlace, setCreatedPlace] = useState<{ id: string; name: string } | null>(null);
  const addPlace = useMutation(submitPlace, 'Could not add this place.');

  const nearbyParams = useMemo(
    () => (pinning && pin ? { lat: pin.lat, lng: pin.lng, radiusKm: 0.3, limit: 5 } : undefined),
    [pinning, pin],
  );
  const nearby = usePlaces(nearbyParams ?? {}, nearbyParams !== undefined);
  const nearbyPlaces = nearbyParams && nearby.source === 'api' ? nearby.places : [];
  const addingPlace = pinning && choice === NEW_PLACE;
  const linkedPlaceId = placeId ?? (pinning && choice && choice !== NEW_PLACE ? choice : undefined);

  function movePin(point: LatLng) {
    setPin(point);
    setChoice('');
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const urls = splitLines(imageUrls);
    const found = validatePost({
      title,
      content,
      imageUrls: urls,
      newPlace: addingPlace ? { name: newName, hasPin: pin !== null } : undefined,
    });
    setErrors(found);
    if (hasErrors(found)) return;

    let storyPlaceId = linkedPlaceId;
    if (addingPlace && pin) {
      let place = createdPlace;
      if (!place) {
        const made = await addPlace.run({
          name: newName.trim(),
          category: newCategory,
          lat: pin.lat,
          lng: pin.lng,
          address: newAddress.trim() || undefined,
          isHiddenPlace: hidden,
          regionId: regionId || undefined,
          checkinLat: checkin?.lat,
          checkinLng: checkin?.lng,
        });
        if (!made.ok) return;
        place = { id: made.data.id, name: made.data.name };
        setCreatedPlace(place);
      }
      storyPlaceId = place.id;
    }

    const result = await publish.run({
      title: title.trim(),
      content: content.trim(),
      placeId: storyPlaceId,
      regionId: regionId || undefined,
      media: urls.length ? urls.map((url) => ({ url, type: 'image' as const })) : undefined,
    });
    if (result.ok) setDone(true);
  }

  if (done) {
    return (
      <Container className="max-w-2xl py-20">
        <EmptyState
          icon={CheckCircle2}
          title="Sent for review"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/app/community" className={buttonClasses('dark')}>
                Back to stories
              </Link>
              {placeId && (
                <Link to={`/app/places/${placeId}`} className={buttonClasses('outline')}>
                  Back to {placeName ?? 'the place'}
                </Link>
              )}
            </div>
          }
        >
          A moderator checks every story before it goes live — usually within a day.
          {createdPlace && (
            <>
              {' '}
              We also added <strong className="text-ink">{createdPlace.name}</strong> as a new
              place; both go live once approved.
            </>
          )}
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Write a story"
        lead="What would you tell a friend heading there next week?"
      />
      <Container className="max-w-3xl py-10 sm:py-12">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
          {publish.error && <Alert>{publish.error}</Alert>}
          {addPlace.error && <Alert>{addPlace.error}</Alert>}

          {placeId && (
            <p className="flex items-center gap-2 rounded-lg border border-gold-deep/30 bg-gold/10 px-4 py-3 text-sm text-ink">
              <MapPin className="h-4 w-4" aria-hidden /> About {placeName ?? 'a place'}
            </p>
          )}

          <Input
            label="Title"
            value={title}
            maxLength={POST_LIMITS.titleMax}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="The noodle stall nobody told me about"
          />
          <Textarea
            label="Your story"
            rows={10}
            value={content}
            maxLength={POST_LIMITS.contentMax}
            onChange={(e) => setContent(e.target.value)}
            error={errors.content}
            hint={`${content.length} / ${POST_LIMITS.contentMax}`}
          />
          {!placeId && (
            <section className="flex flex-col gap-4 rounded-lg border border-ink/15 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionLabel>Where is this?</SectionLabel>
                <Chip
                  active={pinning}
                  onClick={() => setPinning((v) => !v)}
                  icon={<MapPinPlus className="h-4 w-4" aria-hidden />}
                >
                  {pinning ? 'Pinned' : 'Pin the place'}
                </Chip>
              </div>
              {pinning ? (
                <>
                  <LocationPicker
                    value={pin}
                    onChange={movePin}
                    checkin={checkin}
                    onCheckin={setCheckin}
                  />
                  {errors.pin && <p className="text-sm text-red">{errors.pin}</p>}
                  {pin && (
                    <fieldset className="flex flex-col gap-2">
                      <legend className="mb-2 text-sm font-medium text-ink">
                        {nearby.loading
                          ? 'Looking around…'
                          : nearbyPlaces.length
                            ? 'Is it one of these?'
                            : 'Nothing listed within 300 m.'}
                      </legend>
                      {nearbyPlaces.map((p) => (
                        <ChoiceRow
                          key={p.id}
                          checked={choice === p.id}
                          onSelect={() => setChoice(p.id)}
                        >
                          <span className="font-medium text-ink">{p.name}</span>
                          <span className="text-muted">
                            {' '}
                            · {categoryLabel(p.category)}
                            {p.distanceM != null && ` · ${formatDistance(p.distanceM)}`}
                          </span>
                        </ChoiceRow>
                      ))}
                      <ChoiceRow
                        checked={choice === NEW_PLACE}
                        onSelect={() => setChoice(NEW_PLACE)}
                      >
                        <span className="font-medium text-ink">It's not listed — add it</span>
                      </ChoiceRow>
                    </fieldset>
                  )}
                  {addingPlace && (
                    <div className="grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
                      <Input
                        label="Place name"
                        value={newName}
                        maxLength={200}
                        onChange={(e) => setNewName(e.target.value)}
                        error={errors.placeName}
                        placeholder="Bún chả bà Tư"
                        containerClassName="sm:col-span-2"
                      />
                      <Select
                        label="Type"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      >
                        {PLACE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {categoryLabel(c)}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Address (optional)"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Ngõ 12, phố Hàng Bông"
                      />
                      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={hidden}
                          onChange={(e) => setHidden(e.target.checked)}
                          className="h-4 w-4 accent-ink"
                        />
                        Local secret — not on Google Maps
                      </label>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">
                  Standing there right now? Pin it so readers can find it — and we'll add it if it
                  isn't listed yet.
                </p>
              )}
            </section>
          )}
          {!placeId && (
            <RegionSelect
              label="Region (optional)"
              value={regionId}
              onChange={setRegionId}
              emptyLabel="Not about one region"
            />
          )}
          <Textarea
            label="Photo links (optional)"
            rows={3}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            error={errors.images}
            hint={errors.images ? undefined : 'Paste image URLs, one per line.'}
            placeholder="https://…"
          />

          <div className="flex justify-end gap-3 border-t border-ink/10 pt-6">
            <Link
              to={placeId ? `/app/places/${placeId}` : '/app/community'}
              className={buttonClasses('ghost')}
            >
              Cancel
            </Link>
            <Button type="submit" variant="dark" disabled={publish.busy}>
              {publish.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Submit for review
            </Button>
          </div>
        </form>
      </Container>
    </>
  );
}

function ChoiceRow({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
        checked ? 'border-ink bg-cream' : 'border-ink/15 hover:border-ink/40',
      )}
    >
      <input
        type="radio"
        name="nearby"
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 accent-ink"
      />
      <span>{children}</span>
    </label>
  );
}
