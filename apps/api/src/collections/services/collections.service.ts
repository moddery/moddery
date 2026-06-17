import { Injectable, NotFoundException } from '@nestjs/common';
import { type ProjectStatus } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddProjectToCollectionInput } from '../dto/add-project-to-collection.input.js';
import { type CreateCollectionInput } from '../dto/create-collection.input.js';
import { type RemoveProjectFromCollectionInput } from '../dto/remove-project-from-collection.input.js';
import { type UpdateCollectionInput } from '../dto/update-collection.input.js';

interface CollectionRow {
  _count: {
    projects: number;
  };
  color: string | null;
  createdAt: Date;
  description: string | null;
  iconUrl: string | null;
  id: string;
  name: string;
  owner: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
  projects: {
    addedBy: {
      avatarUrl: string | null;
      displayName: string | null;
      id: string;
      username: string;
    } | null;
    createdAt: Date;
    project: {
      approvedAt: Date | null;
      archivedAt: Date | null;
      color: string | null;
      categories: { category: { slug: string } }[];
      description: string;
      discordUrl: string | null;
      downloads: number;
      followers: number;
      gallery: {
        createdAt: Date;
        description: string | null;
        displayUrl: string;
        featured: boolean;
        rawUrl: string;
        sortOrder: number;
        title: string | null;
      }[];
      gameVersions: { gameVersion: { version: string } }[];
      iconUrl: string | null;
      id: string;
      issuesUrl: string | null;
      kind: string;
      license: { key: string; name: string; url: string | null } | null;
      links: { kind: string; label: string | null; url: string }[];
      loaders: { loader: string }[];
      organization: {
        color: string | null;
        iconUrl: string | null;
        id: string;
        name: string;
        slug: string;
      } | null;
      publishedAt: Date | null;
      queuedAt: Date | null;
      requestedStatus: ProjectStatus | null;
      team: {
        members: {
          user: {
            avatarUrl: string | null;
            displayName: string | null;
            id: string;
            username: string;
          };
        }[];
      };
      slug: string;
      sourceUrl: string | null;
      status: ProjectStatus;
      summary: string;
      title: string;
      updatedAt: Date;
      wikiUrl: string | null;
    };
    sortOrder: number;
  }[];
  slug: string;
  updatedAt: Date;
  visibility: string;
}

type CollectionProjectItemRow = CollectionRow['projects'][number];

export interface CollectionSearchResultContract {
  collections: ReturnType<typeof collectionRowToContract>[];
  totalHits: number;
}

export interface CollectionProjectItemSearchResultContract {
  items: ReturnType<typeof collectionProjectItemRowToContract>[];
  totalHits: number;
}

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async addProjectToCollection(
    input: AddProjectToCollectionInput,
    userId: string,
  ) {
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: input.collectionId,
        ownerId: userId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: input.projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const projectCount = await this.prisma.collectionProject.count({
      where: { collectionId: collection.id },
    });

    await this.prisma.collectionProject.upsert({
      create: {
        addedById: userId,
        collectionId: collection.id,
        projectId: project.id,
        sortOrder: projectCount,
      },
      update: {},
      where: {
        collectionId_projectId: {
          collectionId: collection.id,
          projectId: project.id,
        },
      },
    });

    return this.findCollectionForOwner(collection.id, userId);
  }

  async createCollection(input: CreateCollectionInput, ownerId: string) {
    const color = input.color?.trim() ?? '';
    const description = input.description?.trim() ?? '';
    const iconUrl = input.iconUrl?.trim() ?? '';
    const collection = await this.prisma.collection.create({
      data: {
        color: color.length === 0 ? null : color,
        description: description.length === 0 ? null : description,
        iconUrl: iconUrl.length === 0 ? null : iconUrl,
        name: input.name.trim(),
        ownerId,
        slug: input.slug.trim(),
        visibility: input.visibility,
      },
      select: collectionSelect(6),
    });

    return collectionRowToContract(collection);
  }

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
        select: collectionSelect(6),
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
      select: collectionSelect(100),
      where: {
        owner: {
          username: {
            equals: ownerUsername,
            mode: 'insensitive',
          },
        },
        slug,
        visibility: { in: ['PUBLIC', 'UNLISTED'] },
      },
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
      where: {
        owner: {
          username: {
            equals: ownerUsername,
            mode: 'insensitive',
          },
        },
        slug,
        visibility: { in: ['PUBLIC', 'UNLISTED'] },
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const where = { collectionId: collection.id };
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

  async removeProjectFromCollection(
    input: RemoveProjectFromCollectionInput,
    ownerId: string,
  ) {
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: input.collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: input.projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.collectionProject.delete({
      where: {
        collectionId_projectId: {
          collectionId: collection.id,
          projectId: project.id,
        },
      },
    });

    return this.findCollectionForOwner(collection.id, ownerId);
  }

  async updateCollection(input: UpdateCollectionInput, ownerId: string) {
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: input.collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.update({
      data: {
        color:
          input.color === undefined ? undefined : nullableTrim(input.color),
        description:
          input.description === undefined
            ? undefined
            : nullableTrim(input.description),
        iconUrl:
          input.iconUrl === undefined ? undefined : nullableTrim(input.iconUrl),
        name: input.name == null ? undefined : input.name.trim(),
        slug: input.slug == null ? undefined : input.slug.trim(),
        visibility: input.visibility ?? undefined,
      },
      where: { id: collection.id },
    });

    return this.findCollectionForOwner(collection.id, ownerId);
  }

  private async findCollectionForOwner(collectionId: string, ownerId: string) {
    const collection = await this.prisma.collection.findFirst({
      select: collectionSelect(6),
      where: {
        id: collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    return collectionRowToContract(collection);
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
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

function collectionSelect(projectTake: number) {
  return {
    _count: {
      select: {
        projects: true,
      },
    },
    color: true,
    createdAt: true,
    description: true,
    iconUrl: true,
    id: true,
    name: true,
    owner: {
      select: {
        avatarUrl: true,
        displayName: true,
        id: true,
        username: true,
      },
    },
    projects: {
      orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'desc' as const }],
      select: collectionProjectItemSelect(),
      take: projectTake,
    },
    slug: true,
    updatedAt: true,
    visibility: true,
  };
}

function collectionProjectItemSelect() {
  return {
    addedBy: {
      select: {
        avatarUrl: true,
        displayName: true,
        id: true,
        username: true,
      },
    },
    createdAt: true,
    project: {
      select: projectSelect(),
    },
    sortOrder: true,
  };
}

function projectSelect() {
  return {
    approvedAt: true,
    archivedAt: true,
    color: true,
    categories: {
      select: {
        category: {
          select: { slug: true },
        },
      },
    },
    description: true,
    discordUrl: true,
    downloads: true,
    followers: true,
    gallery: {
      orderBy: { sortOrder: 'asc' as const },
      select: {
        createdAt: true,
        description: true,
        displayUrl: true,
        featured: true,
        rawUrl: true,
        sortOrder: true,
        title: true,
      },
    },
    gameVersions: {
      select: {
        gameVersion: {
          select: { version: true },
        },
      },
    },
    iconUrl: true,
    id: true,
    issuesUrl: true,
    kind: true,
    license: {
      select: {
        key: true,
        name: true,
        url: true,
      },
    },
    links: {
      select: {
        kind: true,
        label: true,
        url: true,
      },
    },
    loaders: {
      select: { loader: true },
    },
    organization: {
      select: {
        color: true,
        iconUrl: true,
        id: true,
        name: true,
        slug: true,
      },
    },
    publishedAt: true,
    queuedAt: true,
    requestedStatus: true,
    team: {
      select: {
        members: {
          orderBy: [
            { isOwner: 'desc' as const },
            { sortOrder: 'asc' as const },
          ],
          select: {
            user: {
              select: {
                avatarUrl: true,
                displayName: true,
                id: true,
                username: true,
              },
            },
          },
          take: 1,
          where: { acceptedAt: { not: null } },
        },
      },
    },
    slug: true,
    sourceUrl: true,
    status: true,
    summary: true,
    title: true,
    updatedAt: true,
    wikiUrl: true,
  };
}

function collectionRowToContract(collection: CollectionRow) {
  const items = collection.projects.map(collectionProjectItemRowToContract);

  return {
    color: collection.color,
    createdAt: collection.createdAt,
    description: collection.description,
    iconUrl: collection.iconUrl,
    id: collection.id,
    name: collection.name,
    owner: collection.owner,
    projectCount: collection._count.projects,
    items,
    projects: items.map((item) => item.project),
    slug: collection.slug,
    updatedAt: collection.updatedAt,
    visibility: collection.visibility,
  };
}

function collectionProjectItemRowToContract(item: CollectionProjectItemRow) {
  return {
    addedBy: item.addedBy,
    createdAt: item.createdAt,
    project: projectRowToContract(item.project),
    sortOrder: item.sortOrder,
  };
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

function projectRowToContract(
  project: CollectionRow['projects'][number]['project'],
) {
  return {
    approvedAt: project.approvedAt,
    archivedAt: project.archivedAt,
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
    color: project.color,
    discordUrl: project.discordUrl,
    downloads: project.downloads,
    followers: project.followers,
    gallery: project.gallery.map((image) => ({
      ...image,
      createdAt: image.createdAt,
    })),
    gameVersions: project.gameVersions.map(
      ({ gameVersion }) => gameVersion.version,
    ),
    iconUrl: project.iconUrl,
    id: project.id,
    issuesUrl: project.issuesUrl,
    kind: project.kind,
    license: {
      id: project.license?.key ?? 'unknown',
      name: project.license?.name ?? 'Unknown',
      url: project.license?.url ?? null,
    },
    links: project.links,
    loaders: project.loaders.map(({ loader }) => loader),
    organization: project.organization,
    owner: project.team.members[0]?.user ?? null,
    publishedAt: project.publishedAt,
    queuedAt: project.queuedAt,
    requestedStatus: project.requestedStatus,
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt,
    wikiUrl: project.wikiUrl,
  };
}
