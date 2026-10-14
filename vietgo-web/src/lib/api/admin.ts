import { api, toQueryString } from './client';
import type {
  AdminUser,
  PageMeta,
  Paged,
  PendingPlace,
  Post,
  Role,
  UserActionResult,
  UserStatus,
} from '@/types/api';

// --- Users (ADMIN only) ------------------------------------------------------

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  includeDeleted?: boolean;
}

/** This endpoint already returns `{ data, meta }`, so it's read raw to keep `meta`. */
export function listUsers(query: UserQuery = {}): Promise<{ data: AdminUser[]; meta: PageMeta }> {
  return api.getRaw(`/admin/users${toQueryString(query)}`);
}

/** Revokes every session of that user; you can't change your own role. */
export function updateRole(id: string, role: Role): Promise<AdminUser> {
  return api.patch<AdminUser>(`/admin/users/${id}/role`, { role });
}

export function suspendUser(id: string, reason?: string): Promise<UserActionResult> {
  return api.post<UserActionResult>(`/admin/users/${id}/suspend`, { reason: reason || undefined });
}

export function unsuspendUser(id: string): Promise<UserActionResult> {
  return api.post<UserActionResult>(`/admin/users/${id}/unsuspend`);
}

/** Soft delete by default — `restoreUser` can bring it back. */
export function deleteUser(id: string): Promise<{ userId: string; mode: 'soft' | 'hard' }> {
  return api.delete(`/admin/users/${id}`, {});
}

export function restoreUser(id: string): Promise<UserActionResult> {
  return api.post<UserActionResult>(`/admin/users/${id}/restore`);
}

export function forceLogout(id: string): Promise<{ userId: string; revokedSessions: number }> {
  return api.post(`/admin/users/${id}/force-logout`);
}

// --- Moderation (ADMIN everywhere, MANAGER in their regions) ----------------

export function postQueue(page = 1): Promise<Paged<Post>> {
  return api.get<Paged<Post>>(`/moderation/queue/posts${toQueryString({ page })}`);
}

export function placeQueue(page = 1): Promise<Paged<PendingPlace>> {
  return api.get<Paged<PendingPlace>>(`/moderation/queue/places${toQueryString({ page })}`);
}

export function moderate(kind: 'posts' | 'places', id: string, decision: 'approve' | 'reject', note?: string): Promise<unknown> {
  return api.post(`/moderation/${kind}/${id}/${decision}`, decision === 'reject' ? { note: note || undefined } : undefined);
}
