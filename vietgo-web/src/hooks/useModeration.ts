import { useAsync } from './useAsync';
import { moderate, placeQueue, postQueue } from '@/lib/api/admin';
import type { Paged } from '@/types/api';

export type QueueKind = 'posts' | 'places';
export type Decision = 'approve' | 'reject';

function without<T extends { id: string }>(page: Paged<T> | undefined, id: string): Paged<T> | undefined {
  return page && { ...page, data: page.data.filter((item) => item.id !== id), total: page.total - 1 };
}

/**
 * Both review queues. `decide` throws on failure (so each card can show its
 * own error) and drops the item from its queue on success.
 */
export function useModerationQueues() {
  const posts = useAsync(() => postQueue(), []);
  const places = useAsync(() => placeQueue(), []);

  async function decide(kind: QueueKind, id: string, decision: Decision, note?: string): Promise<void> {
    await moderate(kind, id, decision, note);
    if (kind === 'posts') posts.setData((d) => without(d, id));
    else places.setData((d) => without(d, id));
  }

  return { posts, places, decide };
}
