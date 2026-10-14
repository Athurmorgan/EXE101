import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Lightbulb, Sparkles, ThumbsUp, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPlaceReactionCounts, react, removeReaction, type CommentTarget } from '@/lib/api/community';
import { errorMessage } from '@/lib/api/client';
import { REACTION_TYPES, type ReactionCounts, type ReactionType } from '@/types/api';
import { cn } from '@/lib/cn';

const META: Record<ReactionType, { label: string; icon: LucideIcon }> = {
  like: { label: 'Like', icon: ThumbsUp },
  love: { label: 'Love', icon: Heart },
  wow: { label: 'Wow', icon: Sparkles },
  helpful: { label: 'Helpful', icon: Lightbulb },
};

/*
 * The BE has no "what did I react?" endpoint, only upsert + delete-by-id. We
 * remember the reaction id the upsert returned, per user and target, so the
 * button stays highlighted and can be undone after a reload.
 */
const STORE_KEY = 'vivivu_my_reactions';
type Mine = { id: string; type: ReactionType };

function readMine(key: string): Mine | null {
  try {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, Mine>;
    return all[key] ?? null;
  } catch {
    return null;
  }
}

function writeMine(key: string, value: Mine | null): void {
  try {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, Mine>;
    if (value) all[key] = value;
    else delete all[key];
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — the highlight just won't survive a reload.
  }
}

export function ReactionBar({ target }: { target: CommentTarget }) {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const storeKey = `${user?.id ?? 'guest'}:${target.kind}:${target.id}`;

  const [counts, setCounts] = useState<ReactionCounts>({});
  const [mine, setMine] = useState<Mine | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMine(readMine(storeKey)), [storeKey]);

  useEffect(() => {
    // Only places expose a public count; posts just show your own reaction.
    if (target.kind !== 'place') return;
    let active = true;
    getPlaceReactionCounts(target.id)
      .then((result) => active && setCounts(result))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [target.kind, target.id]);

  function bump(type: ReactionType | undefined, delta: number) {
    if (!type) return;
    setCounts((current) => ({ ...current, [type]: Math.max(0, (current[type] ?? 0) + delta) }));
  }

  async function onPick(type: ReactionType) {
    if (status !== 'authenticated') {
      navigate('/app/login', { state: { from: location } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mine?.type === type) {
        await removeReaction(mine.id);
        bump(type, -1);
        setMine(null);
        writeMine(storeKey, null);
      } else {
        const reaction = await react(target, type);
        bump(mine?.type, -1);
        bump(type, 1);
        const next = { id: reaction.id, type };
        setMine(next);
        writeMine(storeKey, next);
      }
    } catch (err) {
      setError(errorMessage(err, 'Could not save your reaction.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Reactions">
        {REACTION_TYPES.map((type) => {
          const { label, icon: Icon } = META[type];
          const active = mine?.type === type;
          const count = counts[type] ?? 0;
          return (
            <button
              key={type}
              type="button"
              disabled={busy}
              onClick={() => onPick(type)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-9 items-center gap-2 border px-3 text-sm transition-colors disabled:opacity-60',
                active ? 'border-dark bg-dark text-cream' : 'border-ink/15 bg-white text-ink hover:border-ink/40',
              )}
            >
              <Icon className={cn('h-4 w-4', active && type === 'love' && 'fill-current')} aria-hidden />
              {label}
              {target.kind === 'place' && (
                <span className={cn('tabular-nums', active ? 'text-cream/70' : 'text-muted')}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-red">{error}</p>}
    </div>
  );
}
