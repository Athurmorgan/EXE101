import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CornerDownRight, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useAsync';
import { createComment, deleteComment, listComments, type CommentTarget } from '@/lib/api/community';
import { errorMessage } from '@/lib/api/client';
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
  const { data: comments = [], loading, error, reload } = useAsync(() => listComments(target), [target.kind, target.id]);
  const total = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-serif text-2xl text-ink">
        Comments {total > 0 && <span className="text-muted tabular-nums">· {total}</span>}
      </h2>

      <div className="mt-6">
        {status === 'authenticated' ? (
          <CommentForm target={target} onPosted={reload} />
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
              <CommentItem comment={comment} target={target} onChange={reload} />
              {comment.replies && comment.replies.length > 0 && (
                <ol className="mt-5 space-y-5 border-l border-ink/10 pl-5 sm:ml-12">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} target={target} onChange={reload} isReply />
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

function CommentItem({
  comment,
  target,
  onChange,
  isReply = false,
}: {
  comment: Comment;
  target: CommentTarget;
  onChange: () => void;
  isReply?: boolean;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDelete = user && (user.id === comment.authorId || user.role === 'ADMIN');

  async function onDelete() {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
      onChange();
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
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
          {!isReply && user && (
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
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 text-muted hover:text-red disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-red">{error}</p>}

        {replying && (
          <div className="mt-4">
            <CommentForm
              target={target}
              parentId={comment.id}
              compact
              onPosted={() => {
                setReplying(false);
                onChange();
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function CommentForm({
  target,
  parentId,
  compact = false,
  onPosted,
}: {
  target: CommentTarget;
  parentId?: string;
  compact?: boolean;
  onPosted: () => void;
}) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSaving(true);
    setError(null);
    try {
      await createComment(target, text, parentId);
      setContent('');
      onPosted();
    } catch (err) {
      setError(errorMessage(err, 'Could not post your comment.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Textarea
        aria-label={parentId ? 'Write a reply' : 'Write a comment'}
        placeholder={parentId ? 'Write a reply…' : 'Share a tip, a warning, or what to order…'}
        rows={compact ? 2 : 3}
        maxLength={2000}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={error ?? undefined}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="dark" size={compact ? 'sm' : 'md'} disabled={saving || !content.trim()}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {parentId ? 'Reply' : 'Post comment'}
        </Button>
      </div>
    </form>
  );
}
