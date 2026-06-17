import { useQuery } from '@tanstack/react-query';
import { type FormEvent } from 'react';
import { useState } from 'react';

import {
  acceptFriendRequest,
  blockUser,
  fetchViewerBlockedUserSearch,
  fetchViewerFriendRequestSearch,
  fetchViewerFriendSearch,
  removeFriend,
  sendFriendRequest,
} from '../../../lib/users.ts';
import { FriendGroup, FriendList } from './friends-panel/FriendLists.tsx';
import { DashboardField } from './shared.tsx';

const friendPageSize = 20;

export function FriendsPanel() {
  const [blockedPage, setBlockedPage] = useState(1);
  const [busyUsername, setBusyUsername] = useState<string | null>(null);
  const [friendsPage, setFriendsPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [requestsPage, setRequestsPage] = useState(1);
  const [username, setUsername] = useState('');
  const friendsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerFriendSearch(friendsPage, friendPageSize, signal),
    queryKey: ['dashboard', 'friends', friendsPage],
  });
  const requestsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerFriendRequestSearch(requestsPage, friendPageSize, signal),
    queryKey: ['dashboard', 'friend-requests', requestsPage],
  });
  const blockedQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerBlockedUserSearch(blockedPage, friendPageSize, signal),
    queryKey: ['dashboard', 'blocked-users', blockedPage],
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
      setBlockedPage(1);
      setFriendsPage(1);
      setRequestsPage(1);
      await refresh();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Friend update failed',
      );
    } finally {
      setBusyUsername(null);
    }
  }

  async function requestFriend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
      return;
    }

    await run(trimmedUsername, async () => {
      await sendFriendRequest(trimmedUsername);
      setUsername('');
    });
  }

  const blockedResult = blockedQuery.data;
  const friendsResult = friendsQuery.data;
  const requestsResult = requestsQuery.data;
  const blockedTotal = blockedResult?.totalHits ?? 0;
  const friendsTotal = friendsResult?.totalHits ?? 0;
  const requestsTotal = requestsResult?.totalHits ?? 0;
  const blockedUsers = blockedResult?.friendships ?? [];
  const friends = friendsResult?.friendships ?? [];
  const requests = requestsResult?.friendships ?? [];

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

      <form onSubmit={requestFriend} className="mt-4 flex max-w-xl gap-2">
        <div className="min-w-0 flex-1">
          <DashboardField
            required
            label="Add friend"
            placeholder="username"
            value={username}
            onChange={setUsername}
          />
        </div>
        <button
          type="submit"
          disabled={busyUsername === username.trim()}
          className="mt-6 rounded-lg bg-accent px-4 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
        >
          Add
        </button>
      </form>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <FriendGroup
          label={`Requests (${requestsTotal.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={busyUsername}
            emptyLabel="No pending friend requests."
            friendships={requests}
            onPage={setRequestsPage}
            onAccept={(username) =>
              run(username, () => acceptFriendRequest(username))
            }
            onBlock={(username) => run(username, () => blockUser(username))}
            onRemove={(username) => run(username, () => removeFriend(username))}
            page={requestsPage}
            totalHits={requestsTotal}
            totalPages={Math.ceil(requestsTotal / friendPageSize)}
          />
        </FriendGroup>

        <FriendGroup
          label={`Friends (${friendsTotal.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={busyUsername}
            emptyLabel="No friends yet."
            friendships={friends}
            onPage={setFriendsPage}
            onBlock={(username) => run(username, () => blockUser(username))}
            onRemove={(username) => run(username, () => removeFriend(username))}
            page={friendsPage}
            totalHits={friendsTotal}
            totalPages={Math.ceil(friendsTotal / friendPageSize)}
          />
        </FriendGroup>

        <FriendGroup
          label={`Blocked (${blockedTotal.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={busyUsername}
            emptyLabel="No blocked users."
            friendships={blockedUsers}
            onPage={setBlockedPage}
            onRemove={(username) => run(username, () => removeFriend(username))}
            page={blockedPage}
            totalHits={blockedTotal}
            totalPages={Math.ceil(blockedTotal / friendPageSize)}
          />
        </FriendGroup>
      </div>
    </section>
  );
}
