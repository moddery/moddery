import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  acceptFriendRequest,
  blockUser,
  fetchViewerFriendship,
  removeFriend,
  sendFriendRequest,
  useAuthTokenPresent,
} from '../../lib/users.ts';

export function useFriendshipActionState(username: string) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signedIn = useAuthTokenPresent();
  const relationshipQuery = useQuery({
    enabled: signedIn,
    queryFn: () => fetchViewerFriendship(username),
    queryKey: ['users', username, 'friendship'],
  });
  const relationship = relationshipQuery.data?.friendship ?? null;
  const isSelf =
    relationshipQuery.data?.viewerUsername?.toLowerCase() ===
    username.toLowerCase();

  async function run(action: () => Promise<unknown>, nextMessage: string) {
    setBusy(true);
    setMessage(null);

    try {
      await action();
      setMessage(nextMessage);
      await relationshipQuery.refetch();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  return {
    acceptFriendRequest: () =>
      run(() => acceptFriendRequest(username), 'Friend request accepted'),
    blockUser: () => run(() => blockUser(username), 'User blocked'),
    busy: busy || relationshipQuery.isFetching,
    cancelFriendRequest: () =>
      run(() => removeFriend(username), 'Friend request canceled'),
    isSelf,
    message,
    relationship,
    removeFriend: () => run(() => removeFriend(username), 'Friend removed'),
    signedIn,
    unblockUser: () => run(() => removeFriend(username), 'User unblocked'),
    sendFriendRequest: () =>
      run(() => sendFriendRequest(username), 'Friend request sent'),
  };
}
