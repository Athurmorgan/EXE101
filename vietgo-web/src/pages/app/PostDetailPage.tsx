import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePost } from '@/hooks/usePosts';
import { formatDate, initials } from '@/lib/format';
import { Container } from '@/components/app-layout/Container';
import { Alert } from '@/components/app-ui/Alert';
import { Button } from '@/components/app-ui/Button';
import { Skeleton } from '@/components/app-ui/Skeleton';
import { ReactionBar } from '@/components/app-ui/ReactionBar';
import { CommentThread } from '@/components/app-ui/CommentThread';
import { SectionLabel } from '@/components/app-ui/SectionLabel';

export function PostDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, loading, error, remove } = usePost(id);
  const target = useMemo(() => ({ kind: 'post' as const, id }), [id]);

  const canDelete = post && user && (user.id === post.authorId || user.role === 'ADMIN');

  async function onDelete() {
    if (!window.confirm('Delete this story? This cannot be undone.')) return;
    if ((await remove.run()).ok) navigate('/app/community', { replace: true });
  }

  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <Link to="/app/community" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All stories
      </Link>

      {loading ? (
        <div className="mt-10">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-5 h-12 w-4/5" />
          <Skeleton className="mt-8 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-2/3" />
        </div>
      ) : error || !post ? (
        <Alert className="mt-10">{error ?? 'Story not found.'}</Alert>
      ) : (
        <article className="mt-10">
          <header>
            <div className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center bg-forest/10 text-xs font-semibold text-forest"
              >
                {initials(post.author?.fullName ?? 'Traveller')}
              </span>
              <div>
                <p className="font-medium text-ink">{post.author?.fullName ?? 'Traveller'}</p>
                <time dateTime={post.createdAt} className="text-xs text-muted">
                  {formatDate(post.createdAt)}
                </time>
              </div>
              {canDelete && (
                <Button variant="ghost" size="sm" className="ml-auto" onClick={onDelete} disabled={remove.busy}>
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete
                </Button>
              )}
            </div>
            <h1 className="mt-8 font-serif text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl">{post.title}</h1>
            {post.placeId && (
              <Link
                to={`/app/places/${post.placeId}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest underline underline-offset-4"
              >
                <MapPin className="h-4 w-4" aria-hidden /> See the place
              </Link>
            )}
          </header>

          {remove.error && <Alert className="mt-6">{remove.error}</Alert>}

          {post.media && post.media.length > 0 && (
            <div className="mt-10 grid gap-4">
              {post.media.map((m) =>
                m.type === 'video' ? (
                  <video key={m.id} src={m.url} controls className="w-full bg-ink" />
                ) : (
                  <img key={m.id} src={m.url} alt="" className="w-full object-cover" />
                ),
              )}
            </div>
          )}

          <div className="mt-10 text-[17px] leading-[1.75] whitespace-pre-line text-ink">{post.content}</div>

          <section className="mt-14 border-t border-ink/10 pt-8">
            <SectionLabel>Your take</SectionLabel>
            <div className="mt-2">
              <ReactionBar target={target} />
            </div>
          </section>

          <div className="mt-14">
            <CommentThread target={target} />
          </div>
        </article>
      )}
    </Container>
  );
}
