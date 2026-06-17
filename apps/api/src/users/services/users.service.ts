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
  kind: ProjectKind;
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
    projects: {
      addedBy: {
        avatarUrl: string | null;
        displayName: string | null;
        id: string;
        username: string;
      } | null;
      createdAt: Date;
      project: UserProjectRow;
      sortOrder: number;
    }[];
    slug: string;
    updatedAt: Date;
    visibility: string;
  }[];
  createdAt: Date;
  displayName: string | null;
  email: string | null;
  emailVerifiedAt: Date | null;
  id: string;
  newsletterOptIn: boolean;
  role: string;
  status: string;
  teamMemberships: {
    team: {
      project: UserProjectRow | null;
    };
  }[];
  twoFactorEnabled: boolean;
  username: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      select: userProfileSelect({
        includePrivateAccountFields: true,
        includePrivateCollections: true,
      }),
      where: { id },
    });

    return user === null
      ? null
      : userProfileRowToContract(user, { includePrivateAccountFields: true });
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      select: userProfileSelect({
        includePrivateAccountFields: false,
        includePrivateCollections: false,
      }),
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    return user === null
      ? null
      : userProfileRowToContract(user, { includePrivateAccountFields: false });
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
        email:
          input.email === undefined ? undefined : nullableTrim(input.email),
        newsletterOptIn: input.newsletterOptIn ?? undefined,
      },
      where: { id },
    });

    return this.findById(id);
  }

  async findAdminUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }],
      select: userProfileSelect({
        includePrivateAccountFields: true,
        includePrivateCollections: true,
      }),
      take: 50,
    });

    return users.map((user) =>
      userProfileRowToContract(user, { includePrivateAccountFields: true }),
    );
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
  includePrivateAccountFields,
  includePrivateCollections,
}: {
  includePrivateAccountFields: boolean;
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
    email: includePrivateAccountFields,
    emailVerifiedAt: includePrivateAccountFields,
    id: true,
    newsletterOptIn: includePrivateAccountFields,
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
    twoFactorEnabled: includePrivateAccountFields,
    username: true,
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

function userProfileRowToContract(
  user: UserProfileRow,
  {
    includePrivateAccountFields,
  }: {
    includePrivateAccountFields: boolean;
  },
) {
  const collections = user.collections.map((collection) => {
    const items = collection.projects.map((item) => ({
      addedBy: item.addedBy,
      createdAt: item.createdAt,
      project: projectRowToContract(item.project),
      sortOrder: item.sortOrder,
    }));

    return {
      color: collection.color,
      createdAt: collection.createdAt,
      description: collection.description,
      iconUrl: collection.iconUrl,
      id: collection.id,
      items,
      name: collection.name,
      owner: {
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        id: user.id,
        username: user.username,
      },
      projectCount: collection._count.projects,
      projects: items.map((item) => item.project),
      slug: collection.slug,
      updatedAt: collection.updatedAt,
      visibility: collection.visibility,
    };
  });

  return {
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    collectionCount: user._count.collections,
    collections,
    createdAt: user.createdAt,
    displayName: user.displayName,
    email: includePrivateAccountFields ? user.email : null,
    emailVerifiedAt: includePrivateAccountFields ? user.emailVerifiedAt : null,
    followedProjectCount: user._count.projectFollows,
    id: user.id,
    newsletterOptIn: includePrivateAccountFields ? user.newsletterOptIn : false,
    projectCount: user._count.teamMemberships,
    projects: user.teamMemberships.flatMap(({ team }) =>
      team.project === null ? [] : [projectRowToContract(team.project)],
    ),
    role: user.role,
    status: user.status,
    twoFactorEnabled: includePrivateAccountFields
      ? user.twoFactorEnabled
      : false,
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
