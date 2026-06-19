import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  acceptFriendRequest,
  blockUser,
  fetchViewerBlockedUserSearch,
  fetchViewerFriendRequestSearch,
  fetchViewerFriendSearch,
  removeFriend,
  sendFriendRequest,
  type FriendshipSummary,
} from '../../../../lib/users.ts';

export const friendPageSize = 20;
type FriendAction = 'accept' | 'block' | 'remove' | 'request';

export function useFriendsPanelState() {
  const [blockedPage, setBlockedPage] = useState(1);
  const [busyUsername, setBusyUsername] = useState<string | null>(null);
  const [friendsPage, setFriendsPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [requestsPage, setRequestsPage] = useState(1);
  const blockedQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchViewerBlockedUserSearch(blockedPage, friendPageSize, signal),
    queryKey: ['dashboard', 'blocked-users', blockedPage],
  });
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

  async function refresh() {
    await Promise.all([
      blockedQuery.refetch(),
      friendsQuery.refetch(),
      requestsQuery.refetch(),
    ]);
  }

  async function run(username: string, action: FriendAction) {
    setBusyUsername(username);
    setMessage(null);
    try {
      const friendship = await runFriendAction(username, action);
      setMessage(friendActionMessage(action, username, friendship));
      setBlockedPage(1);
      setFriendsPage(1);
      setRequestsPage(1);
      await refresh();
      return true;
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Friend update failed',
      );
      return false;
    } finally {
      setBusyUsername(null);
    }
  }

  return {
    acceptRequest: (username: string) => run(username, 'accept'),
    block: (username: string) => run(username, 'block'),
    blockedPage,
    blockedResult: blockedQuery.data,
    busyUsername,
    friendsPage,
    friendsResult: friendsQuery.data,
    message,
    remove: (username: string) => run(username, 'remove'),
    requestFriend: (username: string) => run(username, 'request'),
    requestsPage,
    requestsResult: requestsQuery.data,
    setBlockedPage,
    setFriendsPage,
    setRequestsPage,
  };
}

async function runFriendAction(username: string, action: FriendAction) {
  switch (action) {
    case 'accept':
      return acceptFriendRequest(username);
    case 'block':
      return blockUser(username);
    case 'remove':
      await removeFriend(username);
      return null;
    case 'request':
      return sendFriendRequest(username);
  }
}

export function friendActionMessage(
  action: FriendAction,
  username: string,
  friendship: Pick<FriendshipSummary, 'direction' | 'user'> | null,
) {
  const name =
    friendship?.user.displayName ?? friendship?.user.username ?? username;

  switch (action) {
    case 'accept':
      return `Accepted ${name}'s friend request.`;
    case 'block':
      return `Blocked ${name}.`;
    case 'remove':
      return `Removed ${username}.`;
    case 'request':
      return friendship?.direction === 'MUTUAL'
        ? `Accepted ${name}'s friend request.`
        : `Sent a friend request to ${name}.`;
  }
}
