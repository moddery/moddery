import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

import {
  hasAuthToken,
  setProjectFollowing,
  type ProjectDetails,
  type ProjectFollowState,
} from '../../../lib/catalog.ts';
import { cn } from '../../../lib/cn.ts';
import { formatCount } from '../../../lib/format.ts';

export function FollowProjectButton({
  project,
  initialState,
}: {
  project: ProjectDetails;
  initialState: ProjectFollowState | null;
}) {
  const [state, setState] = useState<ProjectFollowState | null>(initialState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const following = state?.following ?? false;
  const followers = state?.followers ?? project.followers;

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  async function toggleFollow() {
    if (!hasAuthToken()) {
      setMessage('Sign in to follow projects.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      setState(await setProjectFollowing(project.slug, !following));
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Could not update follow.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void toggleFollow()}
        className={cn(
          'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          following
            ? 'bg-accent-selected text-ink hover:bg-control-hover'
            : 'bg-control text-ink hover:bg-control-hover',
        )}
      >
        <Heart className="size-4 text-accent-icon" />
        {following ? 'Following' : 'Follow'}
        <span className="text-muted tabular-nums">
          {formatCount(followers, 1)}
        </span>
      </button>
      {message && (
        <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
      )}
    </div>
  );
}
