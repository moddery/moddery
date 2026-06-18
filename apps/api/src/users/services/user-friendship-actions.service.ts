import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendState } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  findFriendshipBetween,
  findFriendTarget,
  friendshipRowToContract,
  friendshipSelect,
} from './user-friendship-contracts.js';

@Injectable()
export class UserFriendshipActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendFriendRequest(viewerId: string, username: string) {
    const target = await findFriendTarget(this.prisma, username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    if (target.id === viewerId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    const existing = await findFriendshipBetween(
      this.prisma,
      viewerId,
      target.id,
    );
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
    const target = await findFriendTarget(this.prisma, username);
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
    const target = await findFriendTarget(this.prisma, username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    const existing = await findFriendshipBetween(
      this.prisma,
      viewerId,
      target.id,
    );
    if (existing === null) {
      return true;
    }

    await this.prisma.friend.delete({
      where: { id: existing.id },
    });

    return true;
  }

  async blockUser(viewerId: string, username: string) {
    const target = await findFriendTarget(this.prisma, username);
    if (target === null) {
      throw new NotFoundException('User not found');
    }

    if (target.id === viewerId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const existing = await findFriendshipBetween(
      this.prisma,
      viewerId,
      target.id,
    );
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
}
