import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Inbox, Loader2, MapPin, X } from 'lucide-react';
import { useModerationQueues, type Decision as DecisionKind, type QueueKind as Kind } from '@/hooks/useModeration';
import { useMutation } from '@/hooks/useMutation';
import { categoryLabel, formatDate, mapsUrl } from '@/lib/format';
import type { PendingPlace, Post } from '@/types/api';
import { cn } from '@/lib/cn';
import { Alert } from '@/components/app-ui/Alert';
import { Badge } from '@/components/app-ui/Badge';
import { Button } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Input } from '@/components/app-ui/Input';
import { Skeleton } from '@/components/app-ui/Skeleton';

type Decide = (decision: DecisionKind, note?: string) => Promise<void>;

export function ModerationPanel() {
  const [kind, setKind] = useState<Kind>('posts');
  const { posts, places, decide } = useModerationQueues();
  const active = kind === 'posts' ? posts : places;

  const tabs: Array<{ id: Kind; label: string; count?: number }> = [
    { id: 'posts', label: 'Stories', count: posts.data?.total },
    { id: 'places', label: 'Places', count: places.data?.total },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Queue" className="flex gap-6 border-b border-ink/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={kind === tab.id}
            onClick={() => setKind(tab.id)}
            className={cn(
              '-mb-px border-b-2 pb-3 text-sm font-medium transition-colors',
              kind === tab.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.label}
            {tab.count != null && <span className="ml-2 text-muted tabular-nums">{tab.count}</span>}
          </button>
        ))}
      </div>

      {active.error && <Alert className="mt-6">{active.error}</Alert>}

      {active.loading ? (
        <div className="mt-6 space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : kind === 'posts' ? (
        <Queue
          items={posts.data?.data ?? []}
          kind="posts"
          decide={(id, decision, note) => decide('posts', id, decision, note)}
          render={(post) => <PostSummary post={post} />}
        />
      ) : (
        <Queue
          items={places.data?.data ?? []}
          kind="places"
          decide={(id, decision, note) => decide('places', id, decision, note)}
          render={(place) => <PlaceSummary place={place} />}
        />
      )}
    </div>
  );
}

function Queue<T extends { id: string }>({
  items,
  kind,
  decide,
  render,
}: {
  items: T[];
  kind: Kind;
  decide: (id: string, decision: DecisionKind, note?: string) => Promise<void>;
  render: (item: T) => ReactNode;
}) {
  if (items.length === 0) {
    return (
      <EmptyState icon={Inbox} title="All caught up" className="mt-6">
        Nothing waiting for review{kind === 'posts' ? ' in stories' : ' in places'}.
      </EmptyState>
    );
  }
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li key={item.id} className="border border-ink/10 bg-white p-5 sm:p-6">
          {render(item)}
          <Decision decide={(decision, note) => decide(item.id, decision, note)} />
        </li>
      ))}
    </ul>
  );
}

function Decision({ decide: onDecide }: { decide: Decide }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<DecisionKind | null>(null);
  const { run, busy: running, error } = useMutation(onDecide);
  const busy = running ? pending : null;

  function decide(decision: DecisionKind) {
    setPending(decision);
    void run(decision, note.trim());
  }

  return (
    <div className="mt-5 border-t border-ink/10 pt-4">
      {error && <p className="mb-3 text-sm text-red">{error}</p>}
      {rejecting ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Reason (shown to the author)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Duplicate, off-topic, missing details…"
            containerClassName="flex-1"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy !== null}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => decide('reject')} disabled={busy !== null}>
              {busy === 'reject' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Reject
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="dark" size="sm" onClick={() => decide('approve')} disabled={busy !== null}>
            {busy === 'approve' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Check className="h-4 w-4" aria-hidden />
            )}
            Approve
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRejecting(true)} disabled={busy !== null}>
            <X className="h-4 w-4" aria-hidden /> Reject…
          </Button>
        </div>
      )}
    </div>
  );
}

function PostSummary({ post }: { post: Post }) {
  return (
    <article>
      <p className="text-xs text-muted">
        <span className="font-medium text-ink">{post.author?.fullName ?? 'Unknown'}</span>
        {post.author?.email && <> · {post.author.email}</>} · {formatDate(post.createdAt)}
      </p>
      <h3 className="mt-2 font-serif text-xl text-ink">{post.title}</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-muted">{post.content}</p>
      {post.media && post.media.length > 0 && (
        <div className="mt-3 flex gap-2">
          {post.media.slice(0, 4).map((m) => (
            <img key={m.id} src={m.thumbnail ?? m.url} alt="" className="h-16 w-20 object-cover" />
          ))}
        </div>
      )}
      {post.placeId && (
        <Link to={`/app/places/${post.placeId}`} className="mt-3 inline-block text-xs text-forest underline">
          Linked place
        </Link>
      )}
    </article>
  );
}

function PlaceSummary({ place }: { place: PendingPlace }) {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline" className="text-muted">
          {categoryLabel(place.category)}
        </Badge>
        {place.isHiddenPlace && <Badge>Local secret</Badge>}
        <span className="text-xs text-muted">submitted {formatDate(place.createdAt)}</span>
      </div>
      <h3 className="mt-2 font-serif text-xl text-ink">{place.name}</h3>
      <p className="mt-1 text-sm text-muted">
        {[place.address, place.region?.name].filter(Boolean).join(' · ') || 'No address given'}
      </p>
      {place.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink">{place.description}</p>}
      <a
        href={mapsUrl(place.lat, place.lng)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-forest underline"
      >
        <MapPin className="h-3.5 w-3.5" aria-hidden /> Check the pin on Google Maps
      </a>
    </article>
  );
}
