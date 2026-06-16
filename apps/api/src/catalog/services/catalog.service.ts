import { Injectable } from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { SearchService } from '../../search/search.service.js';
import { type CatalogQueryInput } from '../dto/catalog-query.input.js';

interface ProjectRow {
  description: string;
  categories: { category: { slug: string } }[];
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
  kind: ProjectSummaryContract['kind'];
  loaders: { loader: ProjectSummaryContract['loaders'][number] }[];
  slug: string;
  status: ProjectSummaryContract['status'];
  summary: string;
  title: string;
  updatedAt: Date;
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  async findProjects(
    query: CatalogQueryInput = {},
  ): Promise<ProjectSummaryContract[]> {
    const searchResult = await this.searchService.searchProjects({
      search: query.search,
      sort: query.sort,
      tags: searchTagsFromQuery(query),
    });

    if (searchResult.ids.length === 0) {
      return [];
    }

    const projects: ProjectRow[] = await this.prisma.project.findMany({
      select: {
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
          orderBy: { sortOrder: 'asc' },
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
        loaders: {
          select: { loader: true },
        },
        slug: true,
        status: true,
        summary: true,
        title: true,
        updatedAt: true,
      },
      where: {
        id: { in: [...searchResult.ids] },
        status: 'APPROVED',
      },
    });

    const projectsById = new Map(
      projects.map((project) => [project.id, projectRowToContract(project)]),
    );

    return searchResult.ids.flatMap((id) => {
      const project = projectsById.get(id);
      return project === undefined ? [] : [project];
    });
  }

  async findProjectBySlug(
    slug: string,
  ): Promise<ProjectSummaryContract | undefined> {
    const project = await this.prisma.project.findUnique({
      select: {
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
          orderBy: { sortOrder: 'asc' },
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
        loaders: {
          select: { loader: true },
        },
        slug: true,
        status: true,
        summary: true,
        title: true,
        updatedAt: true,
      },
      where: { slug },
    });

    if (project !== null) {
      return projectRowToContract(project);
    }

    return undefined;
  }
}

function projectRowToContract(project: ProjectRow): ProjectSummaryContract {
  return {
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
    downloads: project.downloads,
    followers: project.followers,
    gallery: project.gallery.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),
    gameVersions: project.gameVersions.map(
      ({ gameVersion }) => gameVersion.version,
    ),
    iconUrl: project.iconUrl,
    id: project.id,
    kind: project.kind,
    loaders: project.loaders.map(({ loader }) => loader),
    slug: project.slug,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt.toISOString(),
  };
}

function searchTagsFromQuery(query: CatalogQueryInput): string[] {
  return [
    ...(query.tags ?? []),
    ...(query.loader === undefined ? [] : [`loader:${query.loader}`]),
    ...(query.gameVersion === undefined
      ? []
      : [`game-version:${query.gameVersion}`]),
  ];
}

export function projectSearchTags(project: ProjectSummaryContract): string[] {
  return [
    `kind:${project.kind}`,
    ...project.categories.map((category) => `category:${category}`),
    ...project.gameVersions.map((gameVersion) => `game-version:${gameVersion}`),
    ...project.loaders.map((loader) => `loader:${loader.toLowerCase()}`),
  ];
}
