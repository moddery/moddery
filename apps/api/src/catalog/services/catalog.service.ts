import { Injectable } from '@nestjs/common';
import { isGameVersionTag, type ProjectSummaryContract } from '@moddery/shared';
import { Loader, type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { SearchService } from '../../search/search.service.js';
import { type CatalogQueryInput } from '../dto/catalog-query.input.js';
import { type CreateProjectInput } from '../dto/create-project.input.js';

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
  license: { key: string; name: string; url: string | null } | null;
  links: { kind: string; label: string | null; url: string }[];
  loaders: { loader: ProjectSummaryContract['loaders'][number] }[];
  discordUrl: string | null;
  issuesUrl: string | null;
  sourceUrl: string | null;
  wikiUrl: string | null;
  slug: string;
  status: ProjectSummaryContract['status'];
  summary: string;
  title: string;
  updatedAt: Date;
}

interface ProjectMemberRow {
  acceptedAt: Date | null;
  isOwner: boolean;
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface ProjectMemberContract {
  accepted: boolean;
  owner: boolean;
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface ProjectFollowStateContract {
  following: boolean;
  followers: number;
  projectSlug: string;
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
      select: projectSelect(),
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
      select: projectSelect(),
      where: { slug },
    });

    if (project !== null) {
      return projectRowToContract(project);
    }

    return undefined;
  }

  async createProject(
    input: CreateProjectInput,
    ownerId: string,
  ): Promise<ProjectSummaryContract> {
    const slug = normalizeSlug(input.slug);
    const now = new Date();
    const license = await this.prisma.license.upsert({
      create: {
        key: 'unknown',
        name: 'Unknown',
      },
      update: {},
      where: { key: 'unknown' },
    });

    const project = await this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          members: {
            create: {
              acceptedAt: now,
              isOwner: true,
              permissions: [
                'MANAGE_DETAILS',
                'MANAGE_MEMBERS',
                'MANAGE_SETTINGS',
                'MANAGE_VERSIONS',
                'VIEW_ANALYTICS',
              ],
              role: 'Owner',
              userId: ownerId,
            },
          },
          targetKind: 'PROJECT',
        },
      });

      const created = await tx.project.create({
        data: {
          approvedAt: now,
          description: input.description.trim(),
          kind: input.kind,
          licenseId: license.id,
          publishedAt: now,
          slug,
          status: 'APPROVED',
          summary: input.summary.trim(),
          teamId: team.id,
          title: input.title.trim(),
        },
        select: { id: true },
      });

      await replaceProjectCategories(tx, created.id, input.categories ?? []);
      await replaceProjectGameVersions(
        tx,
        created.id,
        input.gameVersions ?? [],
      );
      await replaceProjectLoaders(tx, created.id, input.loaders ?? []);

      return tx.project.findUniqueOrThrow({
        select: projectSelect(),
        where: { id: created.id },
      });
    });

    const contract = projectRowToContract(project);
    await this.searchService.indexProjects([projectContractToSearch(contract)]);

    return contract;
  }

  async findProjectMembers(
    projectSlug: string,
  ): Promise<ProjectMemberContract[]> {
    const project = await this.prisma.project.findUnique({
      select: {
        team: {
          select: {
            members: {
              orderBy: [{ isOwner: 'desc' }, { sortOrder: 'asc' }],
              select: {
                acceptedAt: true,
                isOwner: true,
                role: true,
                sortOrder: true,
                user: {
                  select: {
                    avatarUrl: true,
                    displayName: true,
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
      where: { slug: projectSlug },
    });

    return (project?.team.members ?? []).map(projectMemberRowToContract);
  }

  async findViewerProjectFollowState(
    projectSlug: string,
    userId: string,
  ): Promise<ProjectFollowStateContract | undefined> {
    const project = await this.prisma.project.findUnique({
      select: {
        followers: true,
        follows: {
          select: { userId: true },
          take: 1,
          where: { userId },
        },
        slug: true,
      },
      where: { slug: projectSlug },
    });

    if (project === null) return undefined;

    return {
      followers: project.followers,
      following: project.follows.length > 0,
      projectSlug: project.slug,
    };
  }

  async followProject(
    projectSlug: string,
    userId: string,
  ): Promise<ProjectFollowStateContract> {
    return this.updateProjectFollow(projectSlug, userId, true);
  }

  async unfollowProject(
    projectSlug: string,
    userId: string,
  ): Promise<ProjectFollowStateContract> {
    return this.updateProjectFollow(projectSlug, userId, false);
  }

  private async updateProjectFollow(
    projectSlug: string,
    userId: string,
    following: boolean,
  ): Promise<ProjectFollowStateContract> {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUniqueOrThrow({
        select: { id: true, slug: true },
        where: { slug: projectSlug },
      });

      if (following) {
        await tx.projectFollow.upsert({
          create: {
            projectId: project.id,
            userId,
          },
          update: {},
          where: {
            userId_projectId: {
              projectId: project.id,
              userId,
            },
          },
        });
      } else {
        await tx.projectFollow.deleteMany({
          where: {
            projectId: project.id,
            userId,
          },
        });
      }

      const followers = await tx.projectFollow.count({
        where: { projectId: project.id },
      });

      await tx.project.update({
        data: { followers },
        where: { id: project.id },
      });

      return {
        followers,
        following,
        projectSlug: project.slug,
      };
    });
  }
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
    discordUrl: true,
    issuesUrl: true,
    sourceUrl: true,
    wikiUrl: true,
    slug: true,
    status: true,
    summary: true,
    title: true,
    updatedAt: true,
  };
}

async function replaceProjectCategories(
  tx: Prisma.TransactionClient,
  projectId: string,
  categories: readonly string[],
): Promise<void> {
  const slugs = uniqueNormalized(categories).slice(0, 12);
  if (slugs.length === 0) return;

  for (const slug of slugs) {
    const category = await tx.category.upsert({
      create: {
        name: titleize(slug),
        slug,
      },
      update: {},
      where: { slug },
    });

    await tx.projectCategory.create({
      data: {
        categoryId: category.id,
        projectId,
      },
    });
  }
}

async function replaceProjectGameVersions(
  tx: Prisma.TransactionClient,
  projectId: string,
  versions: readonly string[],
): Promise<void> {
  const normalized = uniqueNormalized(versions)
    .filter(isGameVersionTag)
    .slice(0, 12);
  if (normalized.length === 0) return;

  for (const version of normalized) {
    const gameVersion = await tx.gameVersion.upsert({
      create: { version },
      update: {},
      where: { version },
    });

    await tx.projectGameVersion.create({
      data: {
        gameVersionId: gameVersion.id,
        projectId,
      },
    });
  }
}

async function replaceProjectLoaders(
  tx: Prisma.TransactionClient,
  projectId: string,
  loaders: readonly string[],
): Promise<void> {
  const normalized = uniqueNormalized(loaders)
    .map(loaderToEnum)
    .filter((loader) => loader !== null)
    .slice(0, 8);

  for (const loader of normalized) {
    await tx.projectLoader.create({
      data: {
        loader,
        projectId,
      },
    });
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
    license: {
      id: project.license?.key ?? 'unknown',
      name: project.license?.name ?? 'Unknown',
      url: project.license?.url ?? null,
    },
    links: projectLinksToContract(project),
    loaders: project.loaders.map(({ loader }) => loader),
    slug: project.slug,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt.toISOString(),
  };
}

function projectLinksToContract(project: ProjectRow) {
  return [
    ...directProjectLinks(project),
    ...project.links.map((link) => ({
      kind: link.kind,
      label: link.label,
      url: link.url,
    })),
  ];
}

function directProjectLinks(project: ProjectRow) {
  return [
    { kind: 'SOURCE', label: 'Source', url: project.sourceUrl },
    { kind: 'ISSUES', label: 'Issues', url: project.issuesUrl },
    { kind: 'WIKI', label: 'Wiki', url: project.wikiUrl },
    { kind: 'DISCORD', label: 'Discord', url: project.discordUrl },
  ].flatMap((link) => (link.url === null ? [] : [{ ...link, url: link.url }]));
}

function projectMemberRowToContract(
  member: ProjectMemberRow,
): ProjectMemberContract {
  return {
    accepted: member.acceptedAt !== null,
    owner: member.isOwner,
    role: member.role,
    sortOrder: member.sortOrder,
    user: member.user,
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

function projectContractToSearch(project: ProjectSummaryContract) {
  return {
    categories: [...project.categories],
    description: project.body,
    downloads: project.downloads,
    followers: project.followers,
    gameVersions: [...project.gameVersions],
    iconUrl: project.iconUrl ?? null,
    id: project.id,
    kind: project.kind,
    loaders: project.loaders.map((loader) => loader.toLowerCase()),
    slug: project.slug,
    summary: project.summary,
    tags: projectSearchTags(project),
    title: project.title,
    updatedAt: project.updatedAt,
  };
}

function loaderToEnum(loader: string): Loader | null {
  if (loader === 'fabric') return Loader.FABRIC;
  if (loader === 'forge') return Loader.FORGE;
  if (loader === 'neoforge') return Loader.NEOFORGE;
  if (loader === 'quilt') return Loader.QUILT;
  return null;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueNormalized(values: readonly string[]): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0),
    ),
  ];
}
