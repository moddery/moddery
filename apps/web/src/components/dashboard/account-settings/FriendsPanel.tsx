import { AddFriendForm } from './friends-panel/AddFriendForm.tsx';
import { FriendGroup, FriendList } from './friends-panel/FriendLists.tsx';
import {
  friendPageSize,
  useFriendsPanelState,
} from './friends-panel/useFriendsPanelState.ts';

export function FriendsPanel() {
  const friends = useFriendsPanelState();
  const blockedTotal = friends.blockedResult?.totalHits ?? 0;
  const friendsTotal = friends.friendsResult?.totalHits ?? 0;
  const requestsTotal = friends.requestsResult?.totalHits ?? 0;
  const blockedUsers = friends.blockedResult?.friendships ?? [];
  const acceptedFriends = friends.friendsResult?.friendships ?? [];
  const requests = friends.requestsResult?.friendships ?? [];

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
        {friends.message && (
          <span className="text-sm font-semibold text-muted">
            {friends.message}
          </span>
        )}
      </div>

      <AddFriendForm
        busyUsername={friends.busyUsername}
        onRequestFriend={friends.requestFriend}
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <FriendGroup
          label={`Requests (${requestsTotal.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={friends.busyUsername}
            emptyLabel="No pending friend requests."
            friendships={requests}
            onPage={friends.setRequestsPage}
            onAccept={friends.acceptRequest}
            onBlock={friends.block}
            onRemove={friends.remove}
            page={friends.requestsPage}
            totalHits={requestsTotal}
            totalPages={Math.ceil(requestsTotal / friendPageSize)}
          />
        </FriendGroup>

        <FriendGroup
          label={`Friends (${friendsTotal.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={friends.busyUsername}
            emptyLabel="No friends yet."
            friendships={acceptedFriends}
            onPage={friends.setFriendsPage}
            onBlock={friends.block}
            onRemove={friends.remove}
            page={friends.friendsPage}
            totalHits={friendsTotal}
            totalPages={Math.ceil(friendsTotal / friendPageSize)}
          />
        </FriendGroup>

        <FriendGroup
          label={`Blocked (${blockedTotal.toLocaleString('en-US')})`}
        >
          <FriendList
            busyUsername={friends.busyUsername}
            emptyLabel="No blocked users."
            friendships={blockedUsers}
            onPage={friends.setBlockedPage}
            onRemove={friends.remove}
            page={friends.blockedPage}
            totalHits={blockedTotal}
            totalPages={Math.ceil(blockedTotal / friendPageSize)}
          />
        </FriendGroup>
      </div>
    </section>
  );
}
