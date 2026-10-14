import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addToShortlist } from '@/lib/api/shortlist';
import { Button } from './Button';

/**
 * Saves a place to the signed-in user's shortlist. Guests are sent to the
 * login page and returned here afterwards (via `location.state.from`).
 */
export function ShortlistButton({ placeId, className }: { placeId: string; className?: string }) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function onClick() {
    if (state === 'saved') {
      navigate('/app/shortlist');
      return;
    }
    if (status !== 'authenticated') {
      navigate('/app/login', { state: { from: location } });
      return;
    }
    setState('saving');
    try {
      await addToShortlist(placeId);
      setState('saved');
    } catch {
      setState('error');
    }
  }

  return (
    <div className={className}>
      <Button
        variant={state === 'saved' ? 'outline' : 'dark'}
        onClick={onClick}
        disabled={state === 'saving'}
        className="w-full"
      >
        {state === 'saving' ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : state === 'saved' ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden />
        ) : (
          <Bookmark className="h-4 w-4" aria-hidden />
        )}
        {state === 'saved' ? 'Saved · View shortlist' : 'Save to shortlist'}
      </Button>
      {state === 'error' && (
        <p className="mt-2 text-xs text-red">Couldn't save — is the API running?</p>
      )}
    </div>
  );
}
