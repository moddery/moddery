import { type DependencyKind } from '@moddery/shared';
import { type Prisma } from '@prisma/client';

export interface VersionRow {
  author: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  changelog: string | null;
  channel: string;
  dependencies: {
    dependencyKind: DependencyKind;
    externalFileName: string | null;
    id: string;
    targetProject: {
      id: string;
      kind: string;
      slug: string;
      title: string;
    } | null;
    targetVersion: {
      id: string;
      versionNumber: string;
    } | null;
  }[];
  downloads: number;
  featured: boolean;
  createdAt: Date;
  files: {
    fileName: string;
    hashes: {
      algorithm: string;
      value: string;
    }[];
    id: string;
    isPrimary: boolean;
    kind: string;
    scans: {
      createdAt: Date;
      details: Prisma.JsonValue | null;
      id: string;
      status: string;
      verdict: string | null;
    }[];
    sizeBytes: bigint;
    url: string;
  }[];
  gameVersions: { gameVersion: { version: string } }[];
  id: string;
  loaders: { loader: string }[];
  name: string;
  project: { slug: string };
  publishedAt: Date | null;
  requestedStatus: string | null;
  sortOrder: number;
  status: string;
  updatedAt: Date;
  versionNumber: string;
}

export interface VersionSummaryContract {
  author: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  changelog: string | null;
  channel: string;
  datePublished: Date | null;
  dependencies: {
    dependencyKind: DependencyKind;
    externalFileName: string | null;
    id: string;
    targetProject: {
      id: string;
      kind: string;
      slug: string;
      title: string;
    } | null;
    targetVersion: {
      id: string;
      versionNumber: string;
    } | null;
  }[];
  downloads: number;
  featured: boolean;
  createdAt: Date;
  files: {
    fileName: string;
    hashes: {
      algorithm: string;
      value: string;
    }[];
    id: string;
    kind: string;
    primary: boolean;
    scans: {
      createdAt: Date;
      details: string | null;
      id: string;
      status: string;
      verdict: string | null;
    }[];
    sizeBytes: string;
    url: string;
  }[];
  gameVersions: string[];
  id: string;
  loaders: string[];
  name: string;
  projectSlug: string;
  requestedStatus: string | null;
  sortOrder: number;
  status: string;
  updatedAt: Date;
  versionNumber: string;
}

export interface VersionSearchResultContract {
  totalHits: number;
  versions: VersionSummaryContract[];
}

export function versionSelect() {
  return {
    author: {
      select: {
        avatarUrl: true,
        displayName: true,
        id: true,
        username: true,
      },
    },
    changelog: true,
    channel: true,
    createdAt: true,
    dependencies: {
      orderBy: [{ dependencyKind: 'asc' as const }, { id: 'asc' as const }],
      select: {
        dependencyKind: true,
        externalFileName: true,
        id: true,
        targetProject: {
          select: {
            id: true,
            kind: true,
            slug: true,
            title: true,
          },
        },
        targetVersion: {
          select: {
            id: true,
            versionNumber: true,
          },
        },
      },
    },
    downloads: true,
    featured: true,
    files: {
      orderBy: [{ isPrimary: 'desc' as const }, { fileName: 'asc' as const }],
      select: {
        fileName: true,
        hashes: {
          orderBy: { algorithm: 'asc' as const },
          select: {
            algorithm: true,
            value: true,
          },
        },
        id: true,
        isPrimary: true,
        kind: true,
        scans: {
          orderBy: { createdAt: 'desc' as const },
          select: {
            createdAt: true,
            details: true,
            id: true,
            status: true,
            verdict: true,
          },
          take: 3,
        },
        sizeBytes: true,
        url: true,
      },
    },
    gameVersions: {
      select: {
        gameVersion: {
          select: { version: true },
        },
      },
    },
    id: true,
    loaders: {
      select: { loader: true },
    },
    name: true,
    project: {
      select: { slug: true },
    },
    publishedAt: true,
    requestedStatus: true,
    sortOrder: true,
    status: true,
    updatedAt: true,
    versionNumber: true,
  };
}

export function versionRowToContract(
  version: VersionRow,
): VersionSummaryContract {
  return {
    author: version.author,
    changelog: version.changelog,
    channel: version.channel,
    createdAt: version.createdAt,
    datePublished: version.publishedAt,
    dependencies: version.dependencies,
    downloads: version.downloads,
    featured: version.featured,
    files: version.files.map((file) => ({
      fileName: file.fileName,
      hashes: file.hashes,
      id: file.id,
      kind: file.kind,
      primary: file.isPrimary,
      scans: file.scans.map((scan) => ({
        createdAt: scan.createdAt,
        details:
          scan.details === null ? null : JSON.stringify(scan.details, null, 2),
        id: scan.id,
        status: scan.status,
        verdict: scan.verdict,
      })),
      sizeBytes: file.sizeBytes.toString(),
      url: file.url,
    })),
    gameVersions: version.gameVersions.map(
      ({ gameVersion }) => gameVersion.version,
    ),
    id: version.id,
    loaders: version.loaders.map(({ loader }) => loader.toLowerCase()),
    name: version.name,
    projectSlug: version.project.slug,
    requestedStatus: version.requestedStatus,
    sortOrder: version.sortOrder,
    status: version.status,
    updatedAt: version.updatedAt,
    versionNumber: version.versionNumber,
  };
}
