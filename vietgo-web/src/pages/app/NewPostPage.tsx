import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useCreatePost } from '@/hooks/usePosts';
import { POST_LIMITS, hasErrors, splitLines, validatePost, type FieldErrors } from '@/lib/validation';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { Input } from '@/components/app-ui/Input';
import { Textarea } from '@/components/app-ui/Field';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';

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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const urls = splitLines(imageUrls);
    const found = validatePost({ title, content, imageUrls: urls });
    setErrors(found);
    if (hasErrors(found)) return;

    const result = await publish.run({
      title: title.trim(),
      content: content.trim(),
      placeId,
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

          {placeId && (
            <p className="flex items-center gap-2 border border-forest/20 bg-forest/5 px-4 py-3 text-sm text-forest">
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
            <Button type="submit" variant="dark" disabled={publish.busy}>
              {publish.busy &&<Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Submit for review
            </Button>
          </div>
        </form>
      </Container>
    </>
  );
}
