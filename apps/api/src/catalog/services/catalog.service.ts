import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isGameVersionTag, type ProjectSummaryContract } from '@moddery/shared';
import {
  Loader,
  LinkKind,
  ModerationActionKind,
  TeamPermission,
  type Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { SearchService } from '../../search/search.service.js';
import { type AddProjectTeamMemberInput } from '../dto/add-project-team-member.input.js';
import { type AddProjectGalleryImageInput } from '../dto/add-project-gallery-image.input.js';
import { type CatalogQueryInput } from '../dto/catalog-query.input.js';
import { type CreateProjectInput } from '../dto/create-project.input.js';
import { type ModerateProjectInput } from '../dto/moderate-project.input.js';
import { type RemoveProjectTeamMemberInput } from '../dto/remove-project-team-member.input.js';
import { type UpdateProjectInput } from '../dto/update-project.input.js';

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

export interface ModerationActionContract {
  createdAt: Date;
  id: string;
  kind: string;
  moderator: {
    displayName: string | null;
    id: string;
    username: string;
  };
  projectId: string;
  reason: string | null;
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

  async findProjectsForModeration(): Promise<ProjectSummaryContract[]> {
    const projects: ProjectRow[] = await this.prisma.project.findMany({
      orderBy: [{ queuedAt: 'asc' }, { createdAt: 'asc' }],
      select: projectSelect(),
      take: 50,
      where: {
        status: { in: ['PENDING_REVIEW', 'REJECTED', 'ARCHIVED'] },
      },
    });

    return projects.map(projectRowToContract);
  }

  async findProjectModerationActions(
    projectSlug: string,
  ): Promise<ModerationActionContract[]> {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const actions = await this.prisma.moderationAction.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        id: true,
        kind: true,
        moderator: {
          select: {
            displayName: true,
            id: true,
            username: true,
          },
        },
        projectId: true,
        reason: true,
      },
      take: 25,
      where: { projectId: project.id },
    });

    return actions.map((action) => ({
      ...action,
      kind: action.kind,
      projectId: action.projectId ?? project.id,
    }));
  }

  async moderateProject(
    input: ModerateProjectInput,
    moderatorId: string,
  ): Promise<ProjectSummaryContract> {
    const action = moderationAction(input.action);
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: input.projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        data: moderationProjectData(action, now),
        where: { id: project.id },
      });
      await tx.moderationAction.create({
        data: {
          kind: action,
          moderatorId,
          projectId: project.id,
          reason: nullableTrim(input.reason),
        },
      });

      return tx.project.findUniqueOrThrow({
        select: projectSelect(),
        where: { id: project.id },
      });
    });

    const contract = projectRowToContract(updated);
    if (contract.status === 'APPROVED') {
      await this.searchService.indexProjects([
        projectContractToSearch(contract),
      ]);
    }

    return contract;
  }

  async addProjectGalleryImage(
    input: AddProjectGalleryImageInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    const project = await this.findManagedProject(input.projectSlug, userId);

    await this.prisma.projectGalleryImage.create({
      data: {
        description: nullableTrim(input.description),
        displayUrl: input.displayUrl.trim(),
        featured: input.featured,
        projectId: project.id,
        rawUrl: input.rawUrl.trim(),
        sortOrder: input.sortOrder ?? 0,
        title: nullableTrim(input.title),
      },
    });

    const updated = await this.prisma.project.findUniqueOrThrow({
      select: projectSelect(),
      where: { id: project.id },
    });

    return projectRowToContract(updated);
  }

  async updateProject(
    input: UpdateProjectInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    const existing = await this.findManagedProject(input.projectSlug, userId);

    const project = await this.prisma.$transaction(async (tx) => {
      const licenseId = await updatedLicenseId(tx, input);

      await tx.project.update({
        data: projectUpdateData(input, licenseId),
        where: { id: existing.id },
      });

      if (input.categories !== undefined && input.categories !== null) {
        await replaceProjectCategories(tx, existing.id, input.categories);
      }

      if (input.gameVersions !== undefined && input.gameVersions !== null) {
        await replaceProjectGameVersions(tx, existing.id, input.gameVersions);
      }

      if (input.loaders !== undefined && input.loaders !== null) {
        await replaceProjectLoaders(tx, existing.id, input.loaders);
      }

      if (input.links !== undefined && input.links !== null) {
        await replaceProjectLinks(tx, existing.id, input.links);
      }

      return tx.project.findUniqueOrThrow({
        select: projectSelect(),
        where: { id: existing.id },
      });
    });

    const contract = projectRowToContract(project);
    await this.searchService.indexProjects([projectContractToSearch(contract)]);

    return contract;
  }

  private async findManagedProject(projectSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: {
        slug: projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              userId,
            },
          },
        },
      },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async findProjectForMemberManagement(
    projectSlug: string,
    userId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      select: {
        id: true,
        teamId: true,
      },
      where: {
        slug: projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: 'MANAGE_MEMBERS' } },
              ],
              userId,
            },
          },
        },
      },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return project;
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

  async addProjectTeamMember(
    input: AddProjectTeamMemberInput,
    userId: string,
  ): Promise<ProjectMemberContract[]> {
    const project = await this.findProjectForMemberManagement(
      input.projectSlug,
      userId,
    );
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: input.username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.teamMember.upsert({
      create: {
        acceptedAt: new Date(),
        permissions: projectMemberPermissions(input.permissions),
        role: input.role.trim() || 'Member',
        teamId: project.teamId,
        userId: user.id,
      },
      update: {
        acceptedAt: new Date(),
        permissions: projectMemberPermissions(input.permissions),
        role: input.role.trim() || 'Member',
      },
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: user.id,
        },
      },
    });

    return this.findProjectMembers(input.projectSlug);
  }

  async removeProjectTeamMember(
    input: RemoveProjectTeamMemberInput,
    userId: string,
  ): Promise<ProjectMemberContract[]> {
    const project = await this.findProjectForMemberManagement(
      input.projectSlug,
      userId,
    );
    const member = await this.prisma.teamMember.findFirst({
      select: {
        id: true,
        isOwner: true,
        user: { select: { username: true } },
      },
      where: {
        teamId: project.teamId,
        user: { username: { equals: input.username, mode: 'insensitive' } },
      },
    });

    if (member === null) {
      throw new NotFoundException('Team member not found');
    }

    if (member.isOwner) {
      throw new ForbiddenException('Project owner cannot be removed');
    }

    await this.prisma.teamMember.delete({ where: { id: member.id } });

    return this.findProjectMembers(input.projectSlug);
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
  await tx.projectCategory.deleteMany({ where: { projectId } });
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
  await tx.projectGameVersion.deleteMany({ where: { projectId } });
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
  await tx.projectLoader.deleteMany({ where: { projectId } });

  for (const loader of normalized) {
    await tx.projectLoader.create({
      data: {
        loader,
        projectId,
      },
    });
  }
}

async function replaceProjectLinks(
  tx: Prisma.TransactionClient,
  projectId: string,
  links: readonly NonNullable<UpdateProjectInput['links']>[number][],
): Promise<void> {
  const normalized = links
    .map((link) => ({
      kind: linkKind(link.kind),
      label: nullableTrim(link.label),
      url: requiredText(link.url),
    }))
    .slice(0, 16);

  await tx.projectLink.deleteMany({ where: { projectId } });

  for (const link of normalized) {
    await tx.projectLink.create({
      data: {
        ...link,
        projectId,
      },
    });
  }
}

async function updatedLicenseId(
  tx: Prisma.TransactionClient,
  input: UpdateProjectInput,
): Promise<string | undefined> {
  if (input.licenseKey === undefined) {
    return undefined;
  }

  const key = requiredText(input.licenseKey).toLowerCase();
  const name = nullableTrim(input.licenseName) ?? key;
  const url = optionalUrl(input.licenseUrl);
  const license = await tx.license.upsert({
    create: { key, name, url },
    update: { name, url },
    where: { key },
  });

  return license.id;
}

function projectUpdateData(
  input: UpdateProjectInput,
  licenseId: string | undefined,
): Prisma.ProjectUpdateInput {
  return {
    ...(input.description === undefined
      ? {}
      : { description: input.description?.trim() ?? '' }),
    ...(input.discordUrl === undefined
      ? {}
      : { discordUrl: optionalUrl(input.discordUrl) }),
    ...(input.iconUrl === undefined
      ? {}
      : { iconUrl: optionalUrl(input.iconUrl) }),
    ...(input.issuesUrl === undefined
      ? {}
      : { issuesUrl: optionalUrl(input.issuesUrl) }),
    ...(licenseId === undefined
      ? {}
      : { license: { connect: { id: licenseId } } }),
    ...(input.sourceUrl === undefined
      ? {}
      : { sourceUrl: optionalUrl(input.sourceUrl) }),
    ...(input.summary === undefined
      ? {}
      : { summary: input.summary?.trim() ?? '' }),
    ...(input.title === undefined ? {} : { title: input.title?.trim() ?? '' }),
    ...(input.wikiUrl === undefined
      ? {}
      : { wikiUrl: optionalUrl(input.wikiUrl) }),
  };
}

function optionalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredText(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    throw new ForbiddenException('Required project metadata is missing');
  }
  return trimmed;
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function linkKind(value: string): LinkKind {
  const normalized = value.trim().toUpperCase();
  if (normalized in LinkKind) {
    return LinkKind[normalized as keyof typeof LinkKind];
  }

  throw new ForbiddenException('Unsupported project link kind');
}

function moderationAction(action: string): ModerationActionKind {
  const normalized = action.trim().toUpperCase();
  if (normalized === ModerationActionKind.APPROVE) {
    return ModerationActionKind.APPROVE;
  }
  if (normalized === ModerationActionKind.REJECT) {
    return ModerationActionKind.REJECT;
  }
  if (normalized === ModerationActionKind.ARCHIVE) {
    return ModerationActionKind.ARCHIVE;
  }
  if (normalized === ModerationActionKind.RESTORE) {
    return ModerationActionKind.RESTORE;
  }

  throw new ForbiddenException('Unsupported moderation action');
}

function moderationProjectData(
  action: ModerationActionKind,
  now: Date,
): Prisma.ProjectUpdateInput {
  if (action === ModerationActionKind.APPROVE) {
    return {
      approvedAt: now,
      publishedAt: now,
      requestedStatus: null,
      status: 'APPROVED',
    };
  }

  if (action === ModerationActionKind.REJECT) {
    return {
      requestedStatus: null,
      status: 'REJECTED',
    };
  }

  if (action === ModerationActionKind.ARCHIVE) {
    return {
      archivedAt: now,
      requestedStatus: null,
      status: 'ARCHIVED',
    };
  }

  return {
    archivedAt: null,
    requestedStatus: null,
    status: 'APPROVED',
  };
}

function projectRowToContract(project: ProjectRow): ProjectSummaryContract {
  return {
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
    discordUrl: project.discordUrl,
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
    issuesUrl: project.issuesUrl,
    kind: project.kind,
    license: {
      id: project.license?.key ?? 'unknown',
      name: project.license?.name ?? 'Unknown',
      url: project.license?.url ?? null,
    },
    links: projectLinksToContract(project),
    loaders: project.loaders.map(({ loader }) => loader),
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt.toISOString(),
    wikiUrl: project.wikiUrl,
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

function projectMemberPermissions(
  permissions: readonly string[] | null | undefined,
): TeamPermission[] {
  const allowed = new Set<TeamPermission>([
    TeamPermission.MANAGE_DETAILS,
    TeamPermission.MANAGE_MEMBERS,
    TeamPermission.MANAGE_SETTINGS,
    TeamPermission.MANAGE_VERSIONS,
    TeamPermission.VIEW_ANALYTICS,
  ]);

  return [...new Set(permissions ?? [])].flatMap((permission) =>
    allowed.has(permission as TeamPermission)
      ? [permission as TeamPermission]
      : [],
  );
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
