import { useAsync } from './useAsync';
import { createComment, deleteComment, listComments, type CommentTarget } from '@/lib/api/community';

/**
 * Comments on a place or a post. `add` and `remove` throw on failure so each
 * form/row can track its own busy state (via `useMutation`), then refetch.
 */
export function useComments(target: CommentTarget) {
  const { data, loading, error, reload } = useAsync(() => listComments(target), [target.kind, target.id]);
  const comments = data ?? [];
  const total = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  async function add(content: string, parentId?: string): Promise<void> {
    await createComment(target, content, parentId);
    reload();
  }

  async function remove(id: string): Promise<void> {
    await deleteComment(id);
    reload();
  }

  return { comments, total, loading, error, add, remove };
}
