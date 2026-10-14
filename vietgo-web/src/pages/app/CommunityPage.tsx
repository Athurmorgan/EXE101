import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, PenLine } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { PostCard } from '@/components/app-ui/PostCard';
import { RegionSelect } from '@/components/app-ui/RegionSelect';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { Skeleton } from '@/components/app-ui/Skeleton';

const PAGE_SIZE = 10;

export function CommunityPage() {
  const [regionId, setRegionId] = useState('');
  const [page, setPage] = useState(1);
  const { posts, total, totalPages, loaded, loading, error } = usePosts({ page, limit: PAGE_SIZE, regionId });

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Stories from the road"
        lead="Tips, detours and meals worth the trip — written by travellers and locals."
        actions={
          <Link to="/app/community/new" className={buttonClasses('dark')}>
            <PenLine className="h-4 w-4" aria-hidden /> Write a story
          </Link>
        }
      />

      <Container className="py-10 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <RegionSelect
            aria-label="Filter by region"
            value={regionId}
            onChange={(id) => {
              setRegionId(id);
              setPage(1);
            }}
            emptyLabel="All regions"
            containerClassName="w-full sm:max-w-xs"
          />
          {loaded && !loading && (
            <span className="text-sm text-muted" aria-live="polite">
              {total} {total === 1 ? 'story' : 'stories'}
            </span>
          )}
        </div>

        {error && <Alert className="mb-8">{error}</Alert>}

        {loading ? (
          <div className="space-y-10">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-40" />
                <Skeleton className="mt-4 h-7 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No stories yet"
            action={
              <Link to="/app/community/new" className={buttonClasses('dark')}>
                Write the first one
              </Link>
            }
          >
            {regionId ? 'Nobody has written about this region yet.' : 'Approved stories will show up here.'}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {posts.map((post) => (
              <li key={post.id} className="relative py-8">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </nav>
        )}
      </Container>
    </>
  );
}
