import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CornerDownRight, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useComments } from '@/hooks/useComments';
import { useMutation } from '@/hooks/useMutation';
import type { CommentTarget } from '@/lib/api/community';
import { initials, timeAgo } from '@/lib/format';
import type { Comment } from '@/types/api';
import { Alert } from './Alert';
import { Button } from './Button';
import { Textarea } from './Field';
import { Skeleton } from './Skeleton';

/**
 * Comments for a place or a community post: one level of replies, delete
 * for your own comments (and for admins — the BE re-checks either way).
 */
export function CommentThread({ target }: { target: CommentTarget }) {
  const { status } = useAuth();
  const location = useLocation();
  const { comments, total, loading, error, add, remove } = useComments(target);

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-serif text-2xl text-ink">
        Comments {total > 0 && <span className="text-muted tabular-nums">· {total}</span>}
      </h2>

      <div className="mt-6">
        {status === 'authenticated' ? (
          <CommentForm onSubmit={(content) => add(content)} />
        ) : (
          <p className="border border-ink/10 bg-white px-4 py-3 text-sm text-muted">
            <Link to="/app/login" state={{ from: location }} className="font-medium text-ink underline underline-offset-4">
              Sign in
            </Link>{' '}
            to join the conversation.
          </p>
        )}
      </div>

      {error && <Alert className="mt-6">{error}</Alert>}

      {loading ? (
        <div className="mt-8 space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-3 h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <MessageSquare className="h-4 w-4" aria-hidden /> No comments yet — be the first.
        </p>
      ) : (
        <ol className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {comments.map((comment) => (
            <li key={comment.id} className="py-6">
              <CommentItem comment={comment} onReply={add} onDelete={remove} />
              {comment.replies && comment.replies.length > 0 && (
                <ol className="mt-5 space-y-5 border-l border-ink/10 pl-5 sm:ml-12">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} onDelete={remove} />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Top-level comments get `onReply`; replies don't (one level of nesting). */
function CommentItem({
  comment,
  onReply,
  onDelete,
}: {
  comment: Comment;
  onReply?: (content: string, parentId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const remove = useMutation(() => onDelete(comment.id));
  const canDelete = user && (user.id === comment.authorId || user.role === 'ADMIN');

  function handleDelete() {
    if (window.confirm('Delete this comment?')) void remove.run();
  }

  return (
    <article className="flex gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-forest/10 text-xs font-semibold text-forest"
      >
        {initials(comment.authorName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-medium text-ink">{comment.authorName}</span>
          <time dateTime={comment.createdAt} className="text-xs text-muted">
            {timeAgo(comment.createdAt)}
          </time>
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-line text-ink">{comment.content}</p>

        <div className="mt-2 flex gap-4 text-xs">
          {onReply && user && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="inline-flex items-center gap-1 text-muted hover:text-ink"
            >
              <CornerDownRight className="h-3.5 w-3.5" aria-hidden /> Reply
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={remove.busy}
              className="inline-flex items-center gap-1 text-muted hover:text-red disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </button>
          )}
        </div>
        {remove.error && <p className="mt-2 text-xs text-red">{remove.error}</p>}

        {replying && onReply && (
          <div className="mt-4">
            <CommentForm
              isReply
              onSubmit={async (content) => {
                await onReply(content, comment.id);
                setReplying(false);
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function CommentForm({
  isReply = false,
  onSubmit,
}: {
  isReply?: boolean;
  onSubmit: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState('');
  const post = useMutation(onSubmit, 'Could not post your comment.');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = content.trim();
    if (!text) return;
    if ((await post.run(text)).ok) setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        aria-label={isReply ? 'Write a reply' : 'Write a comment'}
        placeholder={isReply ? 'Write a reply…' : 'Share a tip, a warning, or what to order…'}
        rows={isReply ? 2 : 3}
        maxLength={2000}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={post.error ?? undefined}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="dark" size={isReply ? 'sm' : 'md'} disabled={post.busy || !content.trim()}>
          {post.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isReply ? 'Reply' : 'Post comment'}
        </Button>
      </div>
    </form>
  );
}
