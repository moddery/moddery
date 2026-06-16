import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';
import { AccountRole, AccountStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type UpdateUserAccountInput } from '../dto/update-user-account.input.js';
import { type UpdateViewerProfileInput } from '../dto/update-viewer-profile.input.js';

interface UserProjectRow {
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
  kind: ProjectKind;
  license: { key: string; name: string; url: string | null } | null;
  links: { kind: string; label: string | null; url: string }[];
  loaders: { loader: string }[];
  slug: string;
  sourceUrl: string | null;
  status: ProjectStatus;
  summary: string;
  title: string;
  updatedAt: Date;
  wikiUrl: string | null;
}

interface UserProfileRow {
  _count: {
    collections: number;
    projectFollows: number;
    teamMemberships: number;
  };
  avatarUrl: string | null;
  bio: string | null;
  collections: {
    _count: {
      projects: number;
    };
    color: string | null;
    createdAt: Date;
    description: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    projects: { project: UserProjectRow }[];
    slug: string;
    updatedAt: Date;
    visibility: string;
  }[];
  createdAt: Date;
  displayName: string | null;
  id: string;
  role: string;
  status: string;
  teamMemberships: {
    team: {
      project: UserProjectRow | null;
    };
  }[];
  username: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      select: userProfileSelect({ includePrivateCollections: true }),
      where: { id },
    });

    return user === null ? null : userProfileRowToContract(user);
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      select: userProfileSelect({ includePrivateCollections: false }),
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    return user === null ? null : userProfileRowToContract(user);
  }

  async updateViewerProfile(id: string, input: UpdateViewerProfileInput) {
    await this.prisma.user.update({
      data: {
        avatarUrl:
          input.avatarUrl === undefined
            ? undefined
            : nullableTrim(input.avatarUrl),
        bio: input.bio === undefined ? undefined : nullableTrim(input.bio),
        displayName:
          input.displayName === undefined
            ? undefined
            : nullableTrim(input.displayName),
      },
      where: { id },
    });

    return this.findById(id);
  }

  async findAdminUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }],
      select: userProfileSelect({ includePrivateCollections: true }),
      take: 50,
    });

    return users.map(userProfileRowToContract);
  }

  async updateUserAccount(input: UpdateUserAccountInput, actorId: string) {
    const role = accountRole(input.role);
    const status = accountStatus(input.status);

    if (
      input.userId === actorId &&
      ((role !== undefined && role !== AccountRole.ADMIN) ||
        (status !== undefined && status !== AccountStatus.ACTIVE))
    ) {
      throw new ForbiddenException('Admins cannot restrict their own account');
    }

    const user = await this.prisma.user.findUnique({
      select: { id: true },
      where: { id: input.userId },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      data: {
        role,
        status,
      },
      where: { id: input.userId },
    });

    const updated = await this.findById(input.userId);
    if (updated === null) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

function userProfileSelect({
  includePrivateCollections,
}: {
  includePrivateCollections: boolean;
}) {
  const collectionVisibilityFilter = includePrivateCollections
    ? undefined
    : { visibility: 'PUBLIC' as const };

  return {
    _count: {
      select: {
        collections: collectionVisibilityFilter
          ? { where: collectionVisibilityFilter }
          : true,
        projectFollows: true,
        teamMemberships: {
          where: {
            acceptedAt: { not: null },
            team: { project: { is: { status: 'APPROVED' as const } } },
          },
        },
      },
    },
    avatarUrl: true,
    bio: true,
    collections: {
      orderBy: [{ updatedAt: 'desc' as const }],
      select: {
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
        projects: {
          orderBy: [
            { sortOrder: 'asc' as const },
            { createdAt: 'desc' as const },
          ],
          select: {
            project: {
              select: projectSelect(),
            },
          },
          take: 4,
        },
        slug: true,
        updatedAt: true,
        visibility: true,
      },
      take: 4,
      where: collectionVisibilityFilter,
    },
    createdAt: true,
    displayName: true,
    id: true,
    role: true,
    status: true,
    teamMemberships: {
      orderBy: [{ isOwner: 'desc' as const }, { sortOrder: 'asc' as const }],
      select: {
        team: {
          select: {
            project: {
              select: projectSelect(),
            },
          },
        },
      },
      take: 8,
      where: {
        acceptedAt: { not: null },
        team: { project: { is: { status: 'APPROVED' as const } } },
      },
    },
    username: true,
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
    slug: true,
    sourceUrl: true,
    status: true,
    summary: true,
    title: true,
    updatedAt: true,
    wikiUrl: true,
  };
}

function userProfileRowToContract(user: UserProfileRow) {
  return {
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    collectionCount: user._count.collections,
    collections: user.collections.map((collection) => ({
      color: collection.color,
      createdAt: collection.createdAt,
      description: collection.description,
      iconUrl: collection.iconUrl,
      id: collection.id,
      name: collection.name,
      owner: {
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        id: user.id,
        username: user.username,
      },
      projectCount: collection._count.projects,
      projects: collection.projects.map(({ project }) =>
        projectRowToContract(project),
      ),
      slug: collection.slug,
      updatedAt: collection.updatedAt,
      visibility: collection.visibility,
    })),
    createdAt: user.createdAt,
    displayName: user.displayName,
    followedProjectCount: user._count.projectFollows,
    id: user.id,
    projectCount: user._count.teamMemberships,
    projects: user.teamMemberships.flatMap(({ team }) =>
      team.project === null ? [] : [projectRowToContract(team.project)],
    ),
    role: user.role,
    status: user.status,
    username: user.username,
  };
}

function accountRole(
  value: string | null | undefined,
): AccountRole | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === AccountRole.USER) return AccountRole.USER;
  if (normalized === AccountRole.MODERATOR) return AccountRole.MODERATOR;
  if (normalized === AccountRole.ADMIN) return AccountRole.ADMIN;
  throw new ForbiddenException('Unsupported account role');
}

function accountStatus(
  value: string | null | undefined,
): AccountStatus | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === AccountStatus.ACTIVE) return AccountStatus.ACTIVE;
  if (normalized === AccountStatus.SUSPENDED) return AccountStatus.SUSPENDED;
  if (normalized === AccountStatus.DELETED) return AccountStatus.DELETED;
  throw new ForbiddenException('Unsupported account status');
}

function projectRowToContract(project: UserProjectRow) {
  return {
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
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
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt,
    wikiUrl: project.wikiUrl,
  };
}
