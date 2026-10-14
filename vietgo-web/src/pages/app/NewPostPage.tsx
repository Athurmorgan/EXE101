import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { createPost } from '@/lib/api/community';
import { errorMessage } from '@/lib/api/client';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { Textarea } from '@/components/app-ui/Field';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';

/** Same limits as the BE's CreatePostDto. */
const TITLE_MIN = 5;
const TITLE_MAX = 200;
const CONTENT_MIN = 10;
const CONTENT_MAX = 5000;

function isUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function NewPostPage() {
  const [params] = useSearchParams();
  const placeId = params.get('placeId') ?? undefined;
  const placeName = params.get('placeName') ?? undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [regionId, setRegionId] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const urls = imageUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const next: Record<string, string> = {};
    if (title.trim().length < TITLE_MIN) next.title = `At least ${TITLE_MIN} characters.`;
    if (content.trim().length < CONTENT_MIN) next.content = `At least ${CONTENT_MIN} characters.`;
    if (urls.some((u) => !isUrl(u))) next.images = 'One link per line, each starting with http(s)://';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setFormError(null);
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        placeId,
        regionId: regionId || undefined,
        media: urls.length ? urls.map((url) => ({ url, type: 'image' as const })) : undefined,
      });
      setDone(true);
    } catch (err) {
      setFormError(errorMessage(err, 'Could not publish your story.'));
    } finally {
      setSaving(false);
    }
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
          {formError && <Alert>{formError}</Alert>}

          {placeId && (
            <p className="flex items-center gap-2 border border-forest/20 bg-forest/5 px-4 py-3 text-sm text-forest">
              <MapPin className="h-4 w-4" aria-hidden /> About {placeName ?? 'a place'}
            </p>
          )}

          <Input
            label="Title"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="The noodle stall nobody told me about"
          />
          <Textarea
            label="Your story"
            rows={10}
            value={content}
            maxLength={CONTENT_MAX}
            onChange={(e) => setContent(e.target.value)}
            error={errors.content}
            hint={`${content.length} / ${CONTENT_MAX}`}
          />
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
            <Link to={placeId ? `/app/places/${placeId}` : '/app/community'} className={buttonClasses('ghost')}>
              Cancel
            </Link>
            <Button type="submit" variant="dark" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Submit for review
            </Button>
          </div>
        </form>
      </Container>
    </>
  );
}
