import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddProjectToCollectionInput } from '../dto/add-project-to-collection.input.js';
import { type CreateCollectionInput } from '../dto/create-collection.input.js';

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
    project: {
      categories: { category: { slug: string } }[];
      description: string;
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
      kind: string;
      license: { key: string; name: string; url: string | null } | null;
      links: { kind: string; label: string | null; url: string }[];
      loaders: { loader: string }[];
      slug: string;
      status: string;
      summary: string;
      title: string;
      updatedAt: Date;
    };
  }[];
  slug: string;
  updatedAt: Date;
  visibility: string;
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
    const collection = await this.prisma.collection.create({
      data: {
        color: color.length === 0 ? null : color,
        description: description.length === 0 ? null : description,
        name: input.name.trim(),
        ownerId,
        slug: input.slug.trim(),
        visibility: input.visibility,
      },
      select: collectionSelect(6),
    });

    return collectionRowToContract(collection);
  }

  async findPublicCollections() {
    const collections: CollectionRow[] = await this.prisma.collection.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      select: collectionSelect(6),
      where: { visibility: 'PUBLIC' },
    });

    return collections.map(collectionRowToContract);
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
      select: {
        project: {
          select: projectSelect(),
        },
      },
      take: projectTake,
    },
    slug: true,
    updatedAt: true,
    visibility: true,
  };
}

function projectSelect() {
  return {
    categories: {
      select: {
        category: {
          select: { slug: true },
        },
      },
    },
    description: true,
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
    slug: true,
    status: true,
    summary: true,
    title: true,
    updatedAt: true,
  };
}

function collectionRowToContract(collection: CollectionRow) {
  return {
    color: collection.color,
    createdAt: collection.createdAt,
    description: collection.description,
    iconUrl: collection.iconUrl,
    id: collection.id,
    name: collection.name,
    owner: collection.owner,
    projectCount: collection._count.projects,
    projects: collection.projects.map(({ project }) => ({
      body: project.description,
      categories: project.categories.map(({ category }) => category.slug),
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
      kind: project.kind,
      license: {
        id: project.license?.key ?? 'unknown',
        name: project.license?.name ?? 'Unknown',
        url: project.license?.url ?? null,
      },
      links: project.links,
      loaders: project.loaders.map(({ loader }) => loader),
      slug: project.slug,
      status: project.status,
      summary: project.summary,
      title: project.title,
      updatedAt: project.updatedAt,
    })),
    slug: collection.slug,
    updatedAt: collection.updatedAt,
    visibility: collection.visibility,
  };
}
