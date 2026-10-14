import { useAsync } from './useAsync';
import { useMutation } from './useMutation';
import { createPost, deletePost, getPost, listPosts, type NewPostPayload } from '@/lib/api/community';

type PostQuery = NonNullable<Parameters<typeof listPosts>[0]>;

/** Approved community posts, filtered and paged. */
export function usePosts(query: PostQuery) {
  const { page, limit, regionId, placeId } = query;
  const { data, loading, error } = useAsync(
    () => listPosts({ page, limit, regionId: regionId || undefined, placeId }),
    [page, limit, regionId, placeId],
  );
  const total = data?.total ?? 0;
  return {
    posts: data?.data ?? [],
    total,
    totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    loaded: Boolean(data),
    loading,
    error,
  };
}

export function usePost(id: string) {
  const { data: post, loading, error } = useAsync(() => getPost(id), [id]);
  const remove = useMutation(() => deletePost(id));
  return { post, loading, error, remove };
}

/** New posts are `PENDING` until a moderator approves them. */
export function useCreatePost() {
  return useMutation((payload: NewPostPayload) => createPost(payload), 'Could not publish your story.');
}
