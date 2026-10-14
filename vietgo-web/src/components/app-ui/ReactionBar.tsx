import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Lightbulb, Sparkles, ThumbsUp, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useReactions } from '@/hooks/useReactions';
import type { CommentTarget } from '@/lib/api/community';
import { REACTION_TYPES, type ReactionType } from '@/types/api';
import { cn } from '@/lib/cn';

const META: Record<ReactionType, { label: string; icon: LucideIcon }> = {
  like: { label: 'Like', icon: ThumbsUp },
  love: { label: 'Love', icon: Heart },
  wow: { label: 'Wow', icon: Sparkles },
  helpful: { label: 'Helpful', icon: Lightbulb },
};

export function ReactionBar({ target }: { target: CommentTarget }) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { counts, showCounts, mine, toggle } = useReactions(target);

  function onPick(type: ReactionType) {
    if (status !== 'authenticated') {
      navigate('/app/login', { state: { from: location } });
      return;
    }
    void toggle.run(type);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Reactions">
        {REACTION_TYPES.map((type) => {
          const { label, icon: Icon } = META[type];
          const active = mine?.type === type;
          return (
            <button
              key={type}
              type="button"
              disabled={toggle.busy}
              onClick={() => onPick(type)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-9 items-center gap-2 border px-3 text-sm transition-colors disabled:opacity-60',
                active ? 'border-dark bg-dark text-cream' : 'border-ink/15 bg-white text-ink hover:border-ink/40',
              )}
            >
              <Icon className={cn('h-4 w-4', active && type === 'love' && 'fill-current')} aria-hidden />
              {label}
              {showCounts && (
                <span className={cn('tabular-nums', active ? 'text-cream/70' : 'text-muted')}>{counts[type] ?? 0}</span>
              )}
            </button>
          );
        })}
      </div>
      {toggle.error && <p className="mt-2 text-xs text-red">{toggle.error}</p>}
    </div>
  );
}
