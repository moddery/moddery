import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

interface OrganizationProjectRow {
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

interface OrganizationRow {
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
  projects: OrganizationProjectRow[];
  slug: string;
  team: {
    _count: {
      members: number;
    };
    members: OrganizationMemberRow[];
  };
  updatedAt: Date;
}

interface OrganizationMemberRow {
  isOwner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface OrganizationSearchResultContract {
  organizations: ReturnType<typeof organizationRowToContract>[];
  totalHits: number;
}

export interface OrganizationMemberSearchResultContract {
  members: ReturnType<typeof organizationMemberRowToContract>[];
  totalHits: number;
}

export interface OrganizationProjectSearchResultContract {
  projects: ReturnType<typeof projectRowToContract>[];
  totalHits: number;
}

export function organizationSelect(
  projectTake: number,
  { includeDraftProjects }: { includeDraftProjects: boolean },
) {
  const projectVisibilityFilter = includeDraftProjects
    ? undefined
    : { status: 'APPROVED' as const };

  return {
    _count: {
      select: {
        projects: projectVisibilityFilter
          ? { where: projectVisibilityFilter }
          : true,
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
      orderBy: [{ updatedAt: 'desc' as const }],
      select: projectSelect(),
      take: projectTake,
      where: projectVisibilityFilter,
    },
    slug: true,
    team: {
      select: {
        _count: {
          select: {
            members: { where: { acceptedAt: { not: null } } },
          },
        },
        members: {
          orderBy: [
            { isOwner: 'desc' as const },
            { sortOrder: 'asc' as const },
          ],
          select: organizationMemberSelect(),
          take: 12,
          where: { acceptedAt: { not: null } },
        },
      },
    },
    updatedAt: true,
  };
}

export function projectSelect() {
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

export function organizationMemberSelect() {
  return {
    isOwner: true,
    permissions: true,
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
  };
}

export function organizationRowToContract(organization: OrganizationRow) {
  return {
    color: organization.color,
    createdAt: organization.createdAt,
    description: organization.description,
    iconUrl: organization.iconUrl,
    id: organization.id,
    memberCount: organization.team._count.members,
    members: organization.team.members.map(organizationMemberRowToContract),
    name: organization.name,
    owner: organization.owner,
    projectCount: organization._count.projects,
    projects: organization.projects.map(projectRowToContract),
    slug: organization.slug,
    updatedAt: organization.updatedAt,
  };
}

export function organizationMemberRowToContract(member: OrganizationMemberRow) {
  return {
    isOwner: member.isOwner,
    permissions: member.permissions,
    role: member.role,
    sortOrder: member.sortOrder,
    user: member.user,
  };
}

export function projectRowToContract(project: OrganizationProjectRow) {
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

export function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}
