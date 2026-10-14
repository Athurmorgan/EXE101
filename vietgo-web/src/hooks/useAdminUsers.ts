import { useState } from 'react';
import { useAsync } from './useAsync';
import {
  deleteUser,
  forceLogout,
  listUsers,
  restoreUser,
  suspendUser,
  unsuspendUser,
  updateRole,
  type UserQuery,
} from '@/lib/api/admin';
import { errorMessage } from '@/lib/api/client';
import type { Role } from '@/types/api';

/** Paged user list for the admin console; changing a filter resets to page 1. */
export function useAdminUsers() {
  const [query, setQuery] = useState<UserQuery>({ page: 1, limit: 20 });
  const { data, loading, error, reload } = useAsync(() => listUsers(query), [JSON.stringify(query)]);

  return {
    query,
    users: data?.data ?? [],
    meta: data?.meta,
    loaded: Boolean(data),
    loading,
    error,
    reload,
    filter: (next: Partial<UserQuery>) => setQuery((q) => ({ ...q, page: 1, ...next })),
    goToPage: (page: number) => setQuery((q) => ({ ...q, page })),
  };
}

type UserAction = 'role' | 'suspend' | 'unsuspend' | 'logout' | 'delete' | 'restore';

/** Every admin action on one user; `onChanged` refetches the list afterwards. */
export function useUserActions(userId: string, onChanged: () => void) {
  const [busy, setBusy] = useState<UserAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(kind: UserAction, action: () => Promise<unknown>, success?: string): Promise<boolean> {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
      if (success) setNotice(success);
      onChanged();
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  }

  return {
    busy,
    error,
    notice,
    changeRole: (role: Role) => run('role', () => updateRole(userId, role), `Role changed to ${role}.`),
    suspend: (reason: string) => run('suspend', () => suspendUser(userId, reason.trim())),
    unsuspend: () => run('unsuspend', () => unsuspendUser(userId)),
    forceLogout: () => run('logout', () => forceLogout(userId), 'Signed out of every session.'),
    remove: () => run('delete', () => deleteUser(userId)),
    restore: () => run('restore', () => restoreUser(userId)),
  };
}
