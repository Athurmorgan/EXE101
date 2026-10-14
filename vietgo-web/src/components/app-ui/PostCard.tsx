import { Link } from 'react-router-dom';
import type { Post } from '@/types/api';
import { initials, timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

/** Community story in a list: optional lead image, serif title, two-line excerpt, byline. */
export function PostCard({ post, className }: { post: Post; className?: string }) {
  const cover = post.media?.find((m) => m.type === 'image');
  const author = post.author?.fullName ?? 'Traveller';

  return (
    <article className={cn('group grid gap-5 sm:grid-cols-[minmax(0,1fr)_200px]', className)}>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs text-muted">
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center bg-forest/10 text-[10px] font-semibold text-forest"
          >
            {initials(author)}
          </span>
          <span className="font-medium text-ink">{author}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        </p>
        <h3 className="mt-3 font-serif text-2xl leading-snug text-ink">
          <Link to={`/app/community/${post.id}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{post.content}</p>
      </div>
      {cover && (
        <img
          src={cover.thumbnail ?? cover.url}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full object-cover sm:order-last"
        />
      )}
    </article>
  );
}
