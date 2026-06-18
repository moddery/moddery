import { AccountStatus, FriendState } from '@prisma/client';

import { type PrismaService } from '../../prisma/prisma.service.js';

export interface FriendshipUserRow {
  avatarUrl: string | null;
  displayName: string | null;
  id: string;
  username: string;
}

export interface FriendshipRow {
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

export function friendshipSelect() {
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

export function friendshipUserSelect() {
  return {
    avatarUrl: true,
    displayName: true,
    id: true,
    username: true,
  };
}

export function findFriendTarget(prisma: PrismaService, username: string) {
  return prisma.user.findFirst({
    select: friendshipUserSelect(),
    where: {
      status: AccountStatus.ACTIVE,
      username: { equals: username, mode: 'insensitive' },
    },
  });
}

export function findFriendshipBetween(
  prisma: PrismaService,
  userId: string,
  targetId: string,
) {
  return prisma.friend.findFirst({
    select: friendshipSelect(),
    where: {
      OR: [
        { addresseeId: targetId, requesterId: userId },
        { addresseeId: userId, requesterId: targetId },
      ],
    },
  });
}

export function friendshipRowToContract(
  friendship: FriendshipRow,
  viewerId: string,
) {
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

export function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
