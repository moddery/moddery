import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, FriendState } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';

interface FriendshipUserRow {
  avatarUrl: string | null;
  displayName: string | null;
  id: string;
  username: string;
}

interface FriendshipRow {
  acceptedAt: Date | null;
  addressee: FriendshipUserRow;
  addresseeId: string;
  createdAt: Date;
  id: string;
  requester: FriendshipUserRow;
  requesterId: string;
  state: FriendState;
}

export interface FriendshipSearchResultContract {
  friendships: ReturnType<typeof friendshipRowToContract>[];
  totalHits: number;
}

@Injectable()
export class UserFriendshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findViewerFriendship(viewerId: string, username: string) {
    const target = await this.findFriendTarget(username);
    if (target === null || target.id === viewerId) return null;

    const friendship = await this.findFriendshipBetween(viewerId, target.id);
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

  async sendFriendRequest(viewerId: string, username: string) {
    const target = await this.findFriendTarget(username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    if (target.id === viewerId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    const existing = await this.findFriendshipBetween(viewerId, target.id);
    if (existing !== null) {
      if (
        existing.state === FriendState.PENDING &&
        existing.requesterId === target.id
      ) {
        return this.acceptFriendRequest(viewerId, username);
      }

      return friendshipRowToContract(existing, viewerId);
    }

    const friendship = await this.prisma.friend.create({
      data: {
        addresseeId: target.id,
        requesterId: viewerId,
      },
      select: friendshipSelect(),
    });

    return friendshipRowToContract(friendship, viewerId);
  }

  async acceptFriendRequest(viewerId: string, username: string) {
    const target = await this.findFriendTarget(username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.friend.findFirst({
      select: friendshipSelect(),
      where: {
        addresseeId: viewerId,
        requesterId: target.id,
        state: FriendState.PENDING,
      },
    });

    if (existing === null) {
      throw new NotFoundException('Friend request not found');
    }

    const friendship = await this.prisma.friend.update({
      data: {
        acceptedAt: new Date(),
        state: FriendState.ACCEPTED,
      },
      select: friendshipSelect(),
      where: { id: existing.id },
    });

    return friendshipRowToContract(friendship, viewerId);
  }

  async removeFriend(viewerId: string, username: string) {
    const target = await this.findFriendTarget(username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.findFriendshipBetween(viewerId, target.id);
    if (existing === null) {
      return true;
    }

    await this.prisma.friend.delete({
      where: { id: existing.id },
    });

    return true;
  }

  async blockUser(viewerId: string, username: string) {
    const target = await this.findFriendTarget(username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    if (target.id === viewerId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const existing = await this.findFriendshipBetween(viewerId, target.id);
    if (existing !== null) {
      const friendship = await this.prisma.friend.update({
        data: {
          acceptedAt: null,
          addresseeId: target.id,
          requesterId: viewerId,
          state: FriendState.BLOCKED,
        },
        select: friendshipSelect(),
        where: { id: existing.id },
      });

      return friendshipRowToContract(friendship, viewerId);
    }

    const friendship = await this.prisma.friend.create({
      data: {
        addresseeId: target.id,
        requesterId: viewerId,
        state: FriendState.BLOCKED,
      },
      select: friendshipSelect(),
    });

    return friendshipRowToContract(friendship, viewerId);
  }

  private findFriendTarget(username: string) {
    return this.prisma.user.findFirst({
      select: friendshipUserSelect(),
      where: {
        status: AccountStatus.ACTIVE,
        username: { equals: username, mode: 'insensitive' },
      },
    });
  }

  private findFriendshipBetween(userId: string, targetId: string) {
    return this.prisma.friend.findFirst({
      select: friendshipSelect(),
      where: {
        OR: [
          { addresseeId: targetId, requesterId: userId },
          { addresseeId: userId, requesterId: targetId },
        ],
      },
    });
  }
}

function friendshipSelect() {
  return {
    acceptedAt: true,
    addressee: { select: friendshipUserSelect() },
    addresseeId: true,
    createdAt: true,
    id: true,
    requester: { select: friendshipUserSelect() },
    requesterId: true,
    state: true,
  };
}

function friendshipUserSelect() {
  return {
    avatarUrl: true,
    displayName: true,
    id: true,
    username: true,
  };
}

function friendshipRowToContract(friendship: FriendshipRow, viewerId: string) {
  const viewerIsRequester = friendship.requesterId === viewerId;
  const user = viewerIsRequester ? friendship.addressee : friendship.requester;

  return {
    acceptedAt: friendship.acceptedAt,
    createdAt: friendship.createdAt,
    direction:
      friendship.state === FriendState.BLOCKED
        ? viewerIsRequester
          ? 'OUTGOING'
          : 'INCOMING'
        : friendship.state === FriendState.ACCEPTED
          ? 'MUTUAL'
          : viewerIsRequester
            ? 'OUTGOING'
            : 'INCOMING',
    id: friendship.id,
    state: friendship.state,
    user,
  };
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
