import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  projectRowToContract,
  publicUserCollectionSelect,
  type UserCollectionSearchResultContract,
  userCollectionRowToContract,
  userProfileRowToContract,
  userProfileSelect,
  type UserProjectSearchResultContract,
  userProjectMembershipSelect,
  type UserSearchResultContract,
} from './user-read-model.js';

@Injectable()
export class UserDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicUsers({
    limit = 50,
    offset = 0,
    search,
  }: {
    limit?: number;
    offset?: number;
    search?: string | null;
  } = {}): Promise<UserSearchResultContract> {
    const where = publicUserWhere(search);
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: userProfileSelect({
          includePrivateAccountFields: false,
          includePrivateCollections: false,
        }),
        skip,
        take,
        where,
      }),
    ]);

    return {
      totalHits,
      users: users.map((user) =>
        userProfileRowToContract(user, { includePrivateAccountFields: false }),
      ),
    };
  }

  async findPublicUserList({
    search,
  }: {
    search?: string | null;
  } = {}) {
    const result = await this.findPublicUsers({ search });

    return result.users;
  }

  async findPublicUserProjects(
    username: string,
    {
      limit = 20,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<UserProjectSearchResultContract> {
    const user = await this.findActiveUserByUsername(username);
    const where = {
      acceptedAt: { not: null },
      team: { project: { is: { status: 'APPROVED' as const } } },
      userId: user.id,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, memberships] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.findMany({
        orderBy: [
          { isOwner: 'desc' as const },
          { sortOrder: 'asc' as const },
          { createdAt: 'desc' as const },
        ],
        select: userProjectMembershipSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      projects: memberships.flatMap(({ team }) =>
        team.project === null ? [] : [projectRowToContract(team.project)],
      ),
      totalHits,
    };
  }

  async findPublicUserCollections(
    username: string,
    {
      limit = 10,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<UserCollectionSearchResultContract> {
    const user = await this.findActiveUserByUsername(username);
    const where = {
      ownerId: user.id,
      visibility: 'PUBLIC' as const,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, collections] = await Promise.all([
      this.prisma.collection.count({ where }),
      this.prisma.collection.findMany({
        orderBy: [{ updatedAt: 'desc' as const }],
        select: publicUserCollectionSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      collections: collections.map((collection) =>
        userCollectionRowToContract(collection, collection.owner),
      ),
      totalHits,
    };
  }

  private async findActiveUserByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: {
        status: AccountStatus.ACTIVE,
        username: { equals: username, mode: 'insensitive' },
      },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

function publicUserWhere(search: string | null | undefined) {
  const trimmed = search?.trim() ?? '';
  const base = { status: AccountStatus.ACTIVE };

  if (trimmed === '') {
    return base;
  }

  return {
    ...base,
    OR: [
      { username: { contains: trimmed, mode: 'insensitive' as const } },
      { displayName: { contains: trimmed, mode: 'insensitive' as const } },
      { bio: { contains: trimmed, mode: 'insensitive' as const } },
      {
        teamMemberships: {
          some: {
            acceptedAt: { not: null },
            team: {
              project: {
                is: {
                  status: 'APPROVED' as const,
                  OR: [
                    {
                      title: {
                        contains: trimmed,
                        mode: 'insensitive' as const,
                      },
                    },
                    {
                      summary: {
                        contains: trimmed,
                        mode: 'insensitive' as const,
                      },
                    },
                    {
                      slug: {
                        contains: trimmed,
                        mode: 'insensitive' as const,
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ],
  };
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
