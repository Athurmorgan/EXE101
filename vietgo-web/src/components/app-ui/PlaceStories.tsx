import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { listPosts } from '@/lib/api/community';
import { PostCard } from './PostCard';
import { SectionLabel } from './SectionLabel';

/** Approved community stories tagged with this place, plus a nudge to write one. */
export function PlaceStories({ placeId, placeName }: { placeId: string; placeName: string }) {
  const { data } = useAsync(() => listPosts({ placeId, limit: 3 }), [placeId]);
  const posts = data?.data ?? [];
  const writeUrl = `/app/community/new?placeId=${placeId}&placeName=${encodeURIComponent(placeName)}`;

  return (
    <section className="mt-14">
      <SectionLabel>Traveller stories</SectionLabel>
      {posts.length > 0 ? (
        <ul className="mt-2 divide-y divide-ink/10">
          {posts.map((post) => (
            <li key={post.id} className="relative py-6">
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">No stories about {placeName} yet.</p>
      )}
      <Link
        to={writeUrl}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 hover:text-forest"
      >
        <PenLine className="h-4 w-4" aria-hidden /> Write about {placeName}
      </Link>
    </section>
  );
}
