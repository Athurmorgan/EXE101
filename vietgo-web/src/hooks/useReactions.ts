import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useMutation } from './useMutation';
import { getPlaceReactionCounts, react, removeReaction, type CommentTarget } from '@/lib/api/community';
import { readMyReaction, writeMyReaction, type MyReaction } from '@/lib/reactionStore';
import type { ReactionCounts, ReactionType } from '@/types/api';

/** Reaction counts (places only) and the signed-in user's own reaction. */
export function useReactions(target: CommentTarget) {
  const { user } = useAuth();
  const storeKey = `${user?.id ?? 'guest'}:${target.kind}:${target.id}`;
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [mine, setMine] = useState<MyReaction | null>(null);

  useEffect(() => setMine(readMyReaction(storeKey)), [storeKey]);

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

  function remember(value: MyReaction | null) {
    setMine(value);
    writeMyReaction(storeKey, value);
  }

  /** Picking your current reaction again removes it; picking another switches. */
  const toggle = useMutation(async (type: ReactionType) => {
    if (mine?.type === type) {
      await removeReaction(mine.id);
      bump(type, -1);
      remember(null);
    } else {
      const reaction = await react(target, type);
      bump(mine?.type, -1);
      bump(type, 1);
      remember({ id: reaction.id, type });
    }
  }, 'Could not save your reaction.');

  return { counts, showCounts: target.kind === 'place', mine, toggle };
}
