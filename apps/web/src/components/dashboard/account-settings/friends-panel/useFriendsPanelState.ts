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
} from '../../../../lib/users.ts';

export const friendPageSize = 20;

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

  return {
    acceptRequest: (username: string) =>
      run(username, () => acceptFriendRequest(username)),
    block: (username: string) => run(username, () => blockUser(username)),
    blockedPage,
    blockedResult: blockedQuery.data,
    busyUsername,
    friendsPage,
    friendsResult: friendsQuery.data,
    message,
    remove: (username: string) => run(username, () => removeFriend(username)),
    requestFriend: (username: string) =>
      run(username, () => sendFriendRequest(username)),
    requestsPage,
    requestsResult: requestsQuery.data,
    setBlockedPage,
    setFriendsPage,
    setRequestsPage,
  };
}
