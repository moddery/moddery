import { type ProjectStatus } from '@moddery/shared';

export interface CollectionRow {
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

export type CollectionProjectItemRow = CollectionRow['projects'][number];

export interface CollectionSearchResultContract {
  collections: ReturnType<typeof collectionRowToContract>[];
  totalHits: number;
}

export interface CollectionProjectItemSearchResultContract {
  items: ReturnType<typeof collectionProjectItemRowToContract>[];
  totalHits: number;
}

export function collectionSelect(projectTake: number) {
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

export function collectionProjectItemSelect() {
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

export function collectionRowToContract(collection: CollectionRow) {
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

export function collectionProjectItemRowToContract(
  item: CollectionProjectItemRow,
) {
  return {
    addedBy: item.addedBy,
    createdAt: item.createdAt,
    project: projectRowToContract(item.project),
    sortOrder: item.sortOrder,
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

function projectRowToContract(project: CollectionProjectItemRow['project']) {
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
