import { Injectable } from '@nestjs/common';
import { FriendState } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  clampInteger,
  findFriendshipBetween,
  findFriendTarget,
  type FriendshipSearchResultContract,
  friendshipRowToContract,
  friendshipSelect,
} from './user-friendship-contracts.js';

@Injectable()
export class UserFriendshipReadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findViewerFriendship(viewerId: string, username: string) {
    const target = await findFriendTarget(this.prisma, username);
    if (target === null || target.id === viewerId) return null;

    const friendship = await findFriendshipBetween(
      this.prisma,
      viewerId,
      target.id,
    );
    return friendship === null
      ? null
      : friendshipRowToContract(friendship, viewerId);
  }

  async findViewerFriends(
    viewerId: string,
    {
      limit = 50,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<FriendshipSearchResultContract> {
    const where = {
      state: FriendState.ACCEPTED,
      OR: [{ requesterId: viewerId }, { addresseeId: viewerId }],
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, friendships] = await Promise.all([
      this.prisma.friend.count({ where }),
      this.prisma.friend.findMany({
        orderBy: [{ acceptedAt: 'desc' }, { createdAt: 'desc' }],
        select: friendshipSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      friendships: friendships.map((friendship) =>
        friendshipRowToContract(friendship, viewerId),
      ),
      totalHits,
    };
  }

  async findViewerFriendList(viewerId: string) {
    const result = await this.findViewerFriends(viewerId);

    return result.friendships;
  }

  async findViewerFriendRequests(
    viewerId: string,
    {
      limit = 50,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<FriendshipSearchResultContract> {
    const where = {
      state: FriendState.PENDING,
      OR: [{ requesterId: viewerId }, { addresseeId: viewerId }],
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, friendships] = await Promise.all([
      this.prisma.friend.count({ where }),
      this.prisma.friend.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: friendshipSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      friendships: friendships.map((friendship) =>
        friendshipRowToContract(friendship, viewerId),
      ),
      totalHits,
    };
  }

  async findViewerFriendRequestList(viewerId: string) {
    const result = await this.findViewerFriendRequests(viewerId);

    return result.friendships;
  }

  async findViewerBlockedUsers(
    viewerId: string,
    {
      limit = 50,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<FriendshipSearchResultContract> {
    const where = {
      requesterId: viewerId,
      state: FriendState.BLOCKED,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, friendships] = await Promise.all([
      this.prisma.friend.count({ where }),
      this.prisma.friend.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        select: friendshipSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      friendships: friendships.map((friendship) =>
        friendshipRowToContract(friendship, viewerId),
      ),
      totalHits,
    };
  }

  async findViewerBlockedUserList(viewerId: string) {
    const result = await this.findViewerBlockedUsers(viewerId);

    return result.friendships;
  }
}
