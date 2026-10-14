import { api, toQueryString } from './client';
import type { Comment, Paged, Post, Reaction, ReactionCounts, ReactionType } from '@/types/api';

// --- Posts -------------------------------------------------------------------

export function listPosts(params: { page?: number; limit?: number; regionId?: string; placeId?: string } = {}): Promise<Paged<Post>> {
  return api.get<Paged<Post>>(`/community/posts${toQueryString(params)}`);
}

export function getPost(id: string): Promise<Post> {
  return api.get<Post>(`/community/posts/${id}`);
}

export interface NewPostPayload {
  title: string;
  content: string;
  placeId?: string;
  regionId?: string;
  media?: Array<{ url: string; type: 'image' | 'video' }>;
}

/** New posts are `PENDING` until a manager/admin approves them. */
export function createPost(payload: NewPostPayload): Promise<Post> {
  return api.post<Post>('/community/posts', payload);
}

export function deletePost(id: string): Promise<{ id: string }> {
  return api.delete<{ id: string }>(`/community/posts/${id}`);
}

// --- Comments (on a place or a post) ----------------------------------------

export type CommentTarget = { kind: 'place' | 'post'; id: string };

function targetPath({ kind, id }: CommentTarget): string {
  return kind === 'place' ? `/places/${id}` : `/posts/${id}`;
}

export function listComments(target: CommentTarget): Promise<Comment[]> {
  return api.get<Comment[]>(`${targetPath(target)}/comments`);
}

export function createComment(target: CommentTarget, content: string, parentId?: string): Promise<Comment> {
  return api.post<Comment>(`${targetPath(target)}/comments`, { content, parentId });
}

export function deleteComment(id: string): Promise<{ id: string }> {
  return api.delete<{ id: string }>(`/comments/${id}`);
}

// --- Reactions ---------------------------------------------------------------

/** Only places expose a public count endpoint. */
export function getPlaceReactionCounts(placeId: string): Promise<ReactionCounts> {
  return api.get<ReactionCounts>(`/places/${placeId}/reactions/count`);
}

/** Upsert: one reaction per user per target; reacting again changes the type. */
export function react(target: CommentTarget, type: ReactionType): Promise<Reaction> {
  return api.post<Reaction>(`${targetPath(target)}/reactions`, { type });
}

export function removeReaction(id: string): Promise<{ id: string }> {
  return api.delete<{ id: string }>(`/reactions/${id}`);
}
