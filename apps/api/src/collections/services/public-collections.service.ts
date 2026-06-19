import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionVisibility, type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  collectionProjectItemRowToContract,
  collectionProjectItemSelect,
  collectionRowToContract,
  collectionSelect,
  type CollectionProjectItemSearchResultContract,
  type CollectionSearchResultContract,
} from './collection-contracts.js';

@Injectable()
export class PublicCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicCollections({
    limit = 50,
    offset = 0,
    search,
  }: {
    limit?: number;
    offset?: number;
    search?: string | null;
  } = {}): Promise<CollectionSearchResultContract> {
    const where = publicCollectionWhere(search);
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, collections] = await Promise.all([
      this.prisma.collection.count({ where }),
      this.prisma.collection.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        select: collectionSelect(6, { publicProjectsOnly: true }),
        skip,
        take,
        where,
      }),
    ]);

    return {
      collections: collections.map(collectionRowToContract),
      totalHits,
    };
  }

  async findPublicCollectionList({
    search,
  }: {
    search?: string | null;
  } = {}) {
    const result = await this.findPublicCollections({ search });

    return result.collections;
  }

  async findPublicCollectionBySlug(ownerUsername: string, slug: string) {
    const collection = await this.prisma.collection.findFirst({
      select: collectionSelect(100, { publicProjectsOnly: true }),
      where: publicCollectionSlugWhere(ownerUsername, slug),
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    return collectionRowToContract(collection);
  }

  async findPublicCollectionItems(
    ownerUsername: string,
    slug: string,
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<CollectionProjectItemSearchResultContract> {
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: publicCollectionSlugWhere(ownerUsername, slug),
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const where = publicCollectionProjectWhere(collection.id);
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, items] = await Promise.all([
      this.prisma.collectionProject.count({ where }),
      this.prisma.collectionProject.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: collectionProjectItemSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      items: items.map(collectionProjectItemRowToContract),
      totalHits,
    };
  }
}

function publicCollectionProjectWhere(collectionId: string) {
  return { collectionId, project: { status: 'APPROVED' as const } };
}

function publicCollectionSlugWhere(
  ownerUsername: string,
  slug: string,
): Prisma.CollectionWhereInput {
  return {
    owner: {
      username: {
        equals: ownerUsername,
        mode: 'insensitive' as const,
      },
    },
    slug,
    visibility: {
      in: [CollectionVisibility.PUBLIC, CollectionVisibility.UNLISTED],
    },
  };
}

function publicCollectionWhere(search: string | null | undefined) {
  const trimmed = search?.trim() ?? '';
  const base = { visibility: 'PUBLIC' as const };

  if (trimmed === '') {
    return base;
  }

  return {
    ...base,
    OR: [
      { name: { contains: trimmed, mode: 'insensitive' as const } },
      { slug: { contains: trimmed, mode: 'insensitive' as const } },
      { description: { contains: trimmed, mode: 'insensitive' as const } },
      {
        owner: {
          is: {
            OR: [
              {
                username: {
                  contains: trimmed,
                  mode: 'insensitive' as const,
                },
              },
              {
                displayName: {
                  contains: trimmed,
                  mode: 'insensitive' as const,
                },
              },
            ],
          },
        },
      },
      {
        projects: {
          some: {
            project: {
              OR: [
                { title: { contains: trimmed, mode: 'insensitive' as const } },
                {
                  summary: {
                    contains: trimmed,
                    mode: 'insensitive' as const,
                  },
                },
                { slug: { contains: trimmed, mode: 'insensitive' as const } },
              ],
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
