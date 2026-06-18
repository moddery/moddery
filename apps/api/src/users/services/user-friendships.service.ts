import { Injectable } from '@nestjs/common';

import { UserFriendshipActionsService } from './user-friendship-actions.service.js';
import {
  type FriendshipSearchResultContract,
  friendshipRowToContract,
} from './user-friendship-contracts.js';
import { UserFriendshipReadsService } from './user-friendship-reads.service.js';

export { friendshipRowToContract };
export type { FriendshipSearchResultContract };

@Injectable()
export class UserFriendshipsService {
  constructor(
    private readonly friendshipActionsService: UserFriendshipActionsService,
    private readonly friendshipReadsService: UserFriendshipReadsService,
  ) {}

  findViewerFriendship(viewerId: string, username: string) {
    return this.friendshipReadsService.findViewerFriendship(viewerId, username);
  }

  findViewerFriends(
    viewerId: string,
    {
      limit,
      offset,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return this.friendshipReadsService.findViewerFriends(viewerId, {
      limit,
      offset,
    });
  }

  findViewerFriendList(viewerId: string) {
    return this.friendshipReadsService.findViewerFriendList(viewerId);
  }

  findViewerFriendRequests(
    viewerId: string,
    {
      limit,
      offset,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return this.friendshipReadsService.findViewerFriendRequests(viewerId, {
      limit,
      offset,
    });
  }

  findViewerFriendRequestList(viewerId: string) {
    return this.friendshipReadsService.findViewerFriendRequestList(viewerId);
  }

  findViewerBlockedUsers(
    viewerId: string,
    {
      limit,
      offset,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return this.friendshipReadsService.findViewerBlockedUsers(viewerId, {
      limit,
      offset,
    });
  }

  findViewerBlockedUserList(viewerId: string) {
    return this.friendshipReadsService.findViewerBlockedUserList(viewerId);
  }

  sendFriendRequest(viewerId: string, username: string) {
    return this.friendshipActionsService.sendFriendRequest(viewerId, username);
  }

  acceptFriendRequest(viewerId: string, username: string) {
    return this.friendshipActionsService.acceptFriendRequest(
      viewerId,
      username,
    );
  }

  removeFriend(viewerId: string, username: string) {
    return this.friendshipActionsService.removeFriend(viewerId, username);
  }

  blockUser(viewerId: string, username: string) {
    return this.friendshipActionsService.blockUser(viewerId, username);
  }
}
