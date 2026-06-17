import { Check, ShieldOff, UserRoundMinus, X } from 'lucide-react';
import { type ReactNode } from 'react';

import { type FriendshipSummary } from '../../../../lib/users.ts';

export function FriendRow({
  busy,
  friendship,
  onAccept,
  onBlock,
  onRemove,
}: {
  busy: boolean;
  friendship: FriendshipSummary;
  onAccept?: (username: string) => void;
  onBlock?: (username: string) => void;
  onRemove: (username: string) => void;
}) {
  const name = friendship.user.displayName ?? friendship.user.username;
  const showAccept =
    friendship.state === 'PENDING' && friendship.direction === 'INCOMING';
  const isBlocked = friendship.state === 'BLOCKED';

  return (
    <div className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0">
      <div className="min-w-0">
        <a
          href={`/users/${friendship.user.username}`}
          className="block truncate text-sm font-bold text-ink transition-colors hover:text-accent"
        >
          {name}
        </a>
        <p className="text-xs font-semibold uppercase text-muted">
          @{friendship.user.username} · {friendship.direction.toLowerCase()}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {showAccept && (
          <IconButton
            busy={busy}
            label={`Accept ${friendship.user.username}`}
            onClick={() => onAccept?.(friendship.user.username)}
          >
            <Check className="size-4" />
          </IconButton>
        )}
        {!isBlocked && onBlock && (
          <IconButton
            busy={busy}
            label={`Block ${friendship.user.username}`}
            onClick={() => onBlock(friendship.user.username)}
          >
            <ShieldOff className="size-4" />
          </IconButton>
        )}
        <IconButton
          busy={busy}
          label={
            isBlocked
              ? `Unblock ${friendship.user.username}`
              : `Remove ${friendship.user.username}`
          }
          onClick={() => onRemove(friendship.user.username)}
        >
          {isBlocked || friendship.state !== 'PENDING' ? (
            <UserRoundMinus className="size-4" />
          ) : (
            <X className="size-4" />
          )}
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({
  busy,
  children,
  label,
  onClick,
}: {
  busy: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md bg-control text-ink transition-colors hover:bg-control-hover disabled:cursor-wait disabled:opacity-60"
      aria-label={label}
    >
      {children}
    </button>
  );
}
