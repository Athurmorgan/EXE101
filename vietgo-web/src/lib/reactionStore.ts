import type { ReactionType } from '@/types/api';

/*
 * The BE has no "what did I react?" endpoint, only upsert + delete-by-id. We
 * remember the reaction id the upsert returned, per user and target, so the
 * button stays highlighted and can be undone after a reload.
 */
const STORE_KEY = 'vivivu_my_reactions';

export type MyReaction = { id: string; type: ReactionType };

function readAll(): Record<string, MyReaction> {
  return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, MyReaction>;
}

export function readMyReaction(key: string): MyReaction | null {
  try {
    return readAll()[key] ?? null;
  } catch {
    return null;
  }
}

export function writeMyReaction(key: string, value: MyReaction | null): void {
  try {
    const all = readAll();
    if (value) all[key] = value;
    else delete all[key];
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — the highlight just won't survive a reload.
  }
}
