import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

export interface UserProjectRow {
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

export interface UserProfileRow {
  _count: {
    collections: number;
    projectFollows: number;
    teamMemberships: number;
  };
  avatarUrl: string | null;
  bio: string | null;
  collections: UserCollectionRow[];
  createdAt: Date;
  displayName: string | null;
  email: string | null;
  emailVerifiedAt: Date | null;
  friendRequestsReceived: { id: string }[];
  friendRequestsSent: { id: string }[];
  id: string;
  newsletterOptIn: boolean;
  role: string;
  status: string;
  teamMemberships: UserProjectMembershipRow[];
  twoFactorEnabled: boolean;
  username: string;
}

interface UserProjectMembershipRow {
  team: {
    project: UserProjectRow | null;
  };
}

interface UserCollectionRow {
  _count: {
    projects: number;
  };
  color: string | null;
  createdAt: Date;
  description: string | null;
  iconUrl: string | null;
  id: string;
  name: string;
  projects: UserCollectionProjectItemRow[];
  slug: string;
  updatedAt: Date;
  visibility: string;
}

interface UserCollectionProjectItemRow {
  addedBy: FriendshipUserRow | null;
  createdAt: Date;
  project: UserProjectRow;
  sortOrder: number;
}

export interface FriendshipUserRow {
  avatarUrl: string | null;
  displayName: string | null;
  id: string;
  username: string;
}

export interface UserSearchResultContract {
  totalHits: number;
  users: ReturnType<typeof userProfileRowToContract>[];
}

export interface UserProjectSearchResultContract {
  projects: ReturnType<typeof projectRowToContract>[];
  totalHits: number;
}

export interface UserCollectionSearchResultContract {
  collections: ReturnType<typeof userCollectionRowToContract>[];
  totalHits: number;
}

export function userProfileSelect({
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
      select: userCollectionSelect(),
      take: 4,
      where: collectionVisibilityFilter,
    },
    createdAt: true,
    displayName: true,
    email: includePrivateAccountFields,
    emailVerifiedAt: includePrivateAccountFields,
    friendRequestsReceived: {
      select: { id: true },
      where: { state: 'ACCEPTED' as const },
    },
    friendRequestsSent: {
      select: { id: true },
      where: { state: 'ACCEPTED' as const },
    },
    id: true,
    newsletterOptIn: includePrivateAccountFields,
    role: true,
    status: true,
    teamMemberships: {
      orderBy: [{ isOwner: 'desc' as const }, { sortOrder: 'asc' as const }],
      select: userProjectMembershipSelect(),
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

export function userProjectMembershipSelect() {
  return {
    team: {
      select: {
        project: {
          select: projectSelect(),
        },
      },
    },
  };
}

function userCollectionSelect() {
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
    projects: {
      orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'desc' as const }],
      select: userCollectionProjectItemSelect(),
      take: 4,
    },
    slug: true,
    updatedAt: true,
    visibility: true,
  };
}

export function publicUserCollectionSelect() {
  return {
    ...userCollectionSelect(),
    owner: {
      select: friendshipUserSelect(),
    },
  };
}

function userCollectionProjectItemSelect() {
  return {
    addedBy: {
      select: friendshipUserSelect(),
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

export function userProfileRowToContract(
  user: UserProfileRow,
  {
    includePrivateAccountFields,
  }: {
    includePrivateAccountFields: boolean;
  },
) {
  const owner = {
    avatarUrl: user.avatarUrl,
    displayName: user.displayName,
    id: user.id,
    username: user.username,
  };
  const collections = user.collections.map((collection) =>
    userCollectionRowToContract(collection, owner),
  );

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
    friendCount:
      user.friendRequestsReceived.length + user.friendRequestsSent.length,
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

export function userCollectionRowToContract(
  collection: UserCollectionRow,
  owner: FriendshipUserRow,
) {
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
    owner,
    projectCount: collection._count.projects,
    projects: items.map((item) => item.project),
    slug: collection.slug,
    updatedAt: collection.updatedAt,
    visibility: collection.visibility,
  };
}

function friendshipUserSelect() {
  return {
    avatarUrl: true,
    displayName: true,
    id: true,
    username: true,
  };
}

export function projectRowToContract(project: UserProjectRow) {
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
