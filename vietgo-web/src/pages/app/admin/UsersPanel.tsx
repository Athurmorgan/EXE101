import { useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminUsers, useUserActions } from '@/hooks/useAdminUsers';
import { formatDate, initials } from '@/lib/format';
import type { AdminUser, Role, UserStatus } from '@/types/api';
import { cn } from '@/lib/cn';
import { Alert } from '@/components/app-ui/Alert';
import { Button } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Input } from '@/components/app-ui/Input';
import { Select } from '@/components/app-ui/Field';
import { Skeleton } from '@/components/app-ui/Skeleton';

const ROLES: Role[] = ['USER', 'MANAGER', 'ADMIN'];
const STATUSES: UserStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED'];

const STATUS_TONE: Record<string, string> = {
  ACTIVE: 'bg-mint text-forest',
  PENDING: 'bg-ink/5 text-muted',
  SUSPENDED: 'bg-red/10 text-red-dark',
  DELETED: 'bg-ink text-cream',
};

export function UsersPanel() {
  const { query, users, meta, loaded, loading, error, reload, filter: patch, goToPage } = useAdminUsers();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Select
          label="Role"
          value={query.role ?? ''}
          onChange={(e) => patch({ role: (e.target.value || undefined) as Role | undefined })}
          containerClassName="sm:w-44"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={query.status ?? ''}
          onChange={(e) => patch({ status: (e.target.value || undefined) as UserStatus | undefined })}
          containerClassName="sm:w-44"
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <label className="flex h-11 items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={Boolean(query.includeDeleted)}
            onChange={(e) => patch({ includeDeleted: e.target.checked || undefined })}
            className="h-4 w-4 accent-forest"
          />
          Show deleted
        </label>
        {meta && <span className="text-sm text-muted sm:ml-auto sm:pb-3">{meta.total} users</span>}
      </div>

      {error && <Alert className="mt-6">{error}</Alert>}

      {loading && !loaded ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users match" className="mt-6" />
      ) : (
        <ul className={cn('mt-6 divide-y divide-ink/10 border-y border-ink/10', loading && 'opacity-60')}>
          {users.map((u) => (
            <UserRow key={u.id} user={u} onChanged={reload} />
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasPrevPage}
            onClick={() => goToPage(meta.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted tabular-nums">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasNextPage}
            onClick={() => goToPage(meta.page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

function UserRow({ user, onChanged }: { user: AdminUser; onChanged: () => void }) {
  const { user: me } = useAuth();
  const isMe = me?.id === user.id;
  const deleted = Boolean(user.deletedAt) || user.status === 'DELETED';
  const suspended = user.status === 'SUSPENDED';

  const actions = useUserActions(user.id, onChanged);
  const { busy, error, notice } = actions;
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState('');

  /** Runs an action and closes the suspend form once it succeeds. */
  async function run(action: () => Promise<boolean>) {
    if (await action()) setSuspending(false);
  }

  return (
    <li className="py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-forest/10 text-xs font-semibold text-forest"
          >
            {initials(user.fullName)}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="truncate font-medium text-ink">{user.fullName}</span>
              {isMe && <span className="text-xs text-muted">(you)</span>}
              <span className={cn('px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase', STATUS_TONE[deleted ? 'DELETED' : user.status])}>
                {deleted ? 'DELETED' : user.status}
              </span>
            </p>
            <p className="truncate text-xs text-muted">
              {user.email} · joined {formatDate(user.createdAt)}
              {suspended && user.suspendReason && <> · “{user.suspendReason}”</>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={`Role for ${user.fullName}`}
            value={user.role}
            disabled={isMe || deleted || busy !== null}
            onChange={(e) => run(() => actions.changeRole(e.target.value as Role))}
            className="h-9 border border-ink/15 bg-white px-2 text-xs font-medium text-ink disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {deleted ? (
            <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run(actions.restore)}>
              Restore
            </Button>
          ) : (
            <>
              {suspended ? (
                <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run(actions.unsuspend)}>
                  Unsuspend
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled={isMe || busy !== null} onClick={() => setSuspending((v) => !v)}>
                  Suspend…
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={busy !== null}
                onClick={() => run(actions.forceLogout)}
              >
                Force sign-out
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red hover:bg-red/5"
                disabled={isMe || busy !== null}
                onClick={() => {
                  if (window.confirm(`Delete ${user.email}? You can restore it later.`)) void run(actions.remove);
                }}
              >
                Delete
              </Button>
            </>
          )}
          {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label="Working" />}
        </div>
      </div>

      {suspending && (
        <div className="mt-4 flex flex-col gap-3 border-l-2 border-red/40 pl-4 sm:flex-row sm:items-end lg:ml-13">
          <Input
            label="Reason for suspension"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            containerClassName="flex-1"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setSuspending(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={busy !== null} onClick={() => run(() => actions.suspend(reason))}>
              Suspend
            </Button>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red lg:ml-13">{error}</p>}
      {notice && <p className="mt-3 text-sm text-green lg:ml-13">{notice}</p>}
    </li>
  );
}
