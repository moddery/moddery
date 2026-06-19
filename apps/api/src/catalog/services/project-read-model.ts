import { type ProjectSummaryContract } from '@moddery/shared';

export interface ProjectRow {
  approvedAt: Date | null;
  archivedAt: Date | null;
  color: string | null;
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
  moderationLock: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    moderator: {
      displayName: string | null;
      id: string;
      username: string;
    };
  } | null;
  organization: {
    color: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    slug: string;
  } | null;
  publishedAt: Date | null;
  queuedAt: Date | null;
  requestedStatus: ProjectSummaryContract['status'] | null;
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

export interface ProjectSearchResultContract {
  projects: ProjectSummaryContract[];
  totalHits: number;
}

export function projectBySlugCacheKey(slug: string): string {
  return `catalog:project-by-slug:${slug}`;
}

export function projectSelect() {
  return {
    approvedAt: true,
    archivedAt: true,
    categories: {
      select: {
        category: {
          select: { slug: true },
        },
      },
    },
    color: true,
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
    moderationLock: {
      select: {
        createdAt: true,
        expiresAt: true,
        id: true,
        moderator: {
          select: {
            displayName: true,
            id: true,
            username: true,
          },
        },
      },
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

export function projectRowToContract(
  project: ProjectRow,
): ProjectSummaryContract {
  return {
    approvedAt: project.approvedAt?.toISOString() ?? null,
    archivedAt: project.archivedAt?.toISOString() ?? null,
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
    color: project.color,
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
    moderationLock:
      project.moderationLock === null
        ? null
        : {
            ...project.moderationLock,
            createdAt: project.moderationLock.createdAt.toISOString(),
            expiresAt: project.moderationLock.expiresAt.toISOString(),
          },
    organization: project.organization,
    owner: project.team.members[0]?.user ?? null,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    queuedAt: project.queuedAt?.toISOString() ?? null,
    requestedStatus: project.requestedStatus,
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt.toISOString(),
    wikiUrl: project.wikiUrl,
  };
}

export function projectSearchTags(project: ProjectSummaryContract): string[] {
  return [
    `kind:${project.kind}`,
    ...project.categories.map((category) => `category:${category}`),
    ...project.gameVersions.map((gameVersion) => `game-version:${gameVersion}`),
    ...licenseSearchTags(project.license.id),
    ...project.loaders.map((loader) => `loader:${loader.toLowerCase()}`),
  ];
}

export function projectContractToSearch(project: ProjectSummaryContract) {
  return {
    categories: [...project.categories],
    color: project.color ?? null,
    description: project.body,
    downloads: project.downloads,
    followers: project.followers,
    gameVersions: [...project.gameVersions],
    iconUrl: project.iconUrl ?? null,
    id: project.id,
    kind: project.kind,
    licenseKey: normalizedLicenseKey(project.license.id),
    loaders: project.loaders.map((loader) => loader.toLowerCase()),
    slug: project.slug,
    summary: project.summary,
    tags: projectSearchTags(project),
    title: project.title,
    titleSort: project.title.toLowerCase(),
    updatedAt: project.updatedAt,
  };
}

function licenseSearchTags(licenseKey: string): string[] {
  const normalized = normalizedLicenseKey(licenseKey);
  return normalized === null ? [] : [`license:${normalized}`];
}

function normalizedLicenseKey(licenseKey: string): string | null {
  const normalized = licenseKey.trim().toLowerCase();
  return normalized === '' || normalized === 'unknown' ? null : normalized;
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
