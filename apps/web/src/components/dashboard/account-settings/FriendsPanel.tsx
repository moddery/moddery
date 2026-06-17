import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  acceptFriendRequest,
  blockUser,
  fetchViewerBlockedUsers,
  fetchViewerFriendRequests,
  fetchViewerFriends,
  removeFriend,
} from '../../../lib/users.ts';
import { FriendGroup, FriendList } from './friends-panel/FriendLists.tsx';

export function FriendsPanel() {
  const [busyUsername, setBusyUsername] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const friendsQuery = useQuery({
    queryFn: fetchViewerFriends,
    queryKey: ['dashboard', 'friends'],
  });
  const requestsQuery = useQuery({
    queryFn: fetchViewerFriendRequests,
    queryKey: ['dashboard', 'friend-requests'],
  });
  const blockedQuery = useQuery({
    queryFn: fetchViewerBlockedUsers,
    queryKey: ['dashboard', 'blocked-users'],
  });

  async function refresh() {
    await Promise.all([
      blockedQuery.refetch(),
      friendsQuery.refetch(),
      requestsQuery.refetch(),
    ]);
  }

  async function run(username: string, action: () => Promise<unknown>) {
    setBusyUsername(username);
    setMessage(null);
    try {
      await action();
      await refresh();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Friend update failed',
      );
    } finally {
      setBusyUsername(null);
    }
  }

  const requests = requestsQuery.data ?? [];
  const friends = friendsQuery.data ?? [];
  const blockedUsers = blockedQuery.data ?? [];

  return (
    <section className="mt-8 border-t border-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Friends
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage friend requests and accepted friends.
          </p>
        </div>
        {message && (
          <span className="text-sm font-semibold text-muted">{message}</span>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <FriendGroup
          label={`Requests (${requests.length.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={busyUsername}
            emptyLabel="No pending friend requests."
            friendships={requests}
            onAccept={(username) =>
              run(username, () => acceptFriendRequest(username))
            }
            onBlock={(username) => run(username, () => blockUser(username))}
            onRemove={(username) => run(username, () => removeFriend(username))}
          />
        </FriendGroup>

        <FriendGroup
          label={`Friends (${friends.length.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={busyUsername}
            emptyLabel="No friends yet."
            friendships={friends}
            onBlock={(username) => run(username, () => blockUser(username))}
            onRemove={(username) => run(username, () => removeFriend(username))}
          />
        </FriendGroup>

        <FriendGroup
          label={`Blocked (${blockedUsers.length.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={busyUsername}
            emptyLabel="No blocked users."
            friendships={blockedUsers}
            onRemove={(username) => run(username, () => removeFriend(username))}
          />
        </FriendGroup>
      </div>
    </section>
  );
}
