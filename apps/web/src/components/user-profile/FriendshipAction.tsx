import {
  ShieldOff,
  UserPlus,
  UserRoundCheck,
  UserRoundMinus,
} from 'lucide-react';
import { type ReactNode } from 'react';

import { type PublicUserProfile } from '../../lib/users.ts';
import { useFriendshipActionState } from './useFriendshipActionState.ts';

export function FriendshipAction({
  profile,
  onRequestAuth,
}: {
  profile: PublicUserProfile;
  onRequestAuth?: () => void;
}) {
  const state = useFriendshipActionState(profile.username);

  if (state.isSelf) {
    return null;
  }

  if (!state.signedIn) {
    return (
      <FriendshipActions>
        <FriendshipButton
          busy={false}
          icon={<UserPlus className="size-3.5 text-accent-icon" />}
          label="Add friend"
          onClick={() => onRequestAuth?.()}
        />
        <FriendshipButton
          busy={false}
          icon={<ShieldOff className="size-3.5 text-accent-icon" />}
          label="Block"
          onClick={() => onRequestAuth?.()}
        />
      </FriendshipActions>
    );
  }

  const { relationship } = state;

  if (relationship?.state === 'ACCEPTED') {
    return (
      <FriendshipActions>
        <FriendshipButton
          busy={state.busy}
          icon={<UserRoundMinus className="size-3.5 text-accent-icon" />}
          label={state.message ?? 'Friends'}
          onClick={() => void state.removeFriend()}
        />
        <FriendshipButton
          busy={state.busy}
          icon={<ShieldOff className="size-3.5 text-accent-icon" />}
          label="Block"
          onClick={() => void state.blockUser()}
        />
      </FriendshipActions>
    );
  }

  if (relationship?.state === 'BLOCKED') {
    return (
      <FriendshipButton
        busy={state.busy || relationship.direction === 'INCOMING'}
        icon={<ShieldOff className="size-3.5 text-accent-icon" />}
        label={
          relationship.direction === 'INCOMING'
            ? 'Unavailable'
            : (state.message ?? 'Blocked')
        }
        onClick={() => {
          if (relationship.direction === 'OUTGOING') {
            void state.unblockUser();
          }
        }}
      />
    );
  }

  if (relationship?.direction === 'INCOMING') {
    return (
      <FriendshipButton
        busy={state.busy}
        icon={<UserRoundCheck className="size-3.5 text-accent-icon" />}
        label={state.message ?? 'Accept friend'}
        onClick={() => void state.acceptFriendRequest()}
      />
    );
  }

  if (relationship?.direction === 'OUTGOING') {
    return (
      <FriendshipButton
        busy={state.busy}
        icon={<UserRoundMinus className="size-3.5 text-accent-icon" />}
        label={state.message ?? 'Request sent'}
        onClick={() => void state.cancelFriendRequest()}
      />
    );
  }

  return (
    <FriendshipActions>
      <FriendshipButton
        busy={state.busy}
        icon={<UserPlus className="size-3.5 text-accent-icon" />}
        label={state.message ?? 'Add friend'}
        onClick={() => void state.sendFriendRequest()}
      />
      <FriendshipButton
        busy={state.busy}
        icon={<ShieldOff className="size-3.5 text-accent-icon" />}
        label="Block"
        onClick={() => void state.blockUser()}
      />
    </FriendshipActions>
  );
}

function FriendshipActions({ children }: { children: ReactNode }) {
  return <div className="inline-flex items-center gap-1.5">{children}</div>;
}

function FriendshipButton({
  busy,
  icon,
  label,
  onClick,
}: {
  busy: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-control px-2.5 text-xs font-bold text-ink transition-colors hover:bg-control-hover disabled:cursor-wait disabled:opacity-60"
    >
      {icon}
      {label}
    </button>
  );
}
