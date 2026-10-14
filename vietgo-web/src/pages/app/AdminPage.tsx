import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { ModerationPanel } from './admin/ModerationPanel';
import { UsersPanel } from './admin/UsersPanel';

type Tab = 'moderation' | 'users';

/** Staff console: managers moderate their regions; admins also manage users. */
export function AdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState<Tab>('moderation');

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'moderation', label: 'Moderation' },
    ...(isAdmin ? [{ id: 'users' as const, label: 'Users' }] : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Admin' : 'Manager'}
        title="Staff console"
        lead={
          isAdmin
            ? 'Review what travellers submit and manage accounts.'
            : 'Review stories and places submitted in your regions.'
        }
      />
      <Container className="py-10 sm:py-12">
        {tabs.length > 1 && (
          <div role="tablist" aria-label="Console sections" className="mb-10 inline-flex border border-ink/15 bg-white p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'h-9 px-5 text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-dark text-cream' : 'text-muted hover:text-ink',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {tab === 'users' && isAdmin ? <UsersPanel /> : <ModerationPanel />}
      </Container>
    </>
  );
}
