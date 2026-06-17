import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isGameVersionTag, type DependencyKind } from '@moddery/shared';
import { HashAlgorithm, Loader, type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { type CreateVersionInput } from '../dto/create-version.input.js';
import { type RecordFileScanInput } from '../dto/record-file-scan.input.js';
import {
  type UpdateVersionDependenciesInput,
  type VersionDependencyInput,
} from '../dto/update-version-dependencies.input.js';
import { type UpdateVersionInput } from '../dto/update-version.input.js';

interface VersionRow {
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

@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createVersion(
    input: CreateVersionInput,
    authorId: string,
  ): Promise<VersionSummaryContract> {
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
        slug: true,
        team: {
          select: {
            members: {
              select: { userId: true },
              take: 1,
              where: {
                acceptedAt: { not: null },
                userId: authorId,
              },
            },
          },
        },
      },
      where: { slug: input.projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    if (project.team.members.length === 0) {
      throw new ForbiddenException('Project membership required');
    }

    const version = await this.prisma.$transaction(async (tx) => {
      const created = await tx.version.create({
        data: {
          authorId,
          changelog: nullableTrim(input.changelog),
          channel: input.channel,
          name: input.name.trim(),
          projectId: project.id,
          publishedAt: new Date(),
          status: 'APPROVED',
          versionNumber: input.versionNumber.trim(),
        },
        select: { id: true },
      });

      await replaceVersionGameVersions(
        tx,
        created.id,
        input.gameVersions ?? [],
      );
      await replaceVersionLoaders(tx, created.id, input.loaders ?? []);
      await createVersionFiles(tx, created.id, input.files);

      return tx.version.findUniqueOrThrow({
        select: versionSelect(),
        where: { id: created.id },
      });
    });

    return versionRowToContract(version);
  }

  async findByProjectSlug(
    projectSlug: string,
  ): Promise<VersionSummaryContract[]> {
    const versions: VersionRow[] = await this.prisma.version.findMany({
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: versionSelect(),
      where: {
        project: { slug: projectSlug },
        status: 'APPROVED',
      },
    });

    return versions.map(versionRowToContract);
  }

  async updateVersion(
    input: UpdateVersionInput,
    userId: string,
  ): Promise<VersionSummaryContract> {
    const version = await this.findManagedVersion(input.versionId, userId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.version.update({
        data: versionUpdateData(input),
        where: { id: version.id },
      });

      if (input.gameVersions !== undefined && input.gameVersions !== null) {
        await replaceVersionGameVersions(tx, version.id, input.gameVersions);
      }

      if (input.loaders !== undefined && input.loaders !== null) {
        await replaceVersionLoaders(tx, version.id, input.loaders);
      }

      return tx.version.findUniqueOrThrow({
        select: versionSelect(),
        where: { id: version.id },
      });
    });

    return versionRowToContract(updated);
  }

  async updateVersionDependencies(
    input: UpdateVersionDependenciesInput,
    userId: string,
  ): Promise<VersionSummaryContract> {
    const version = await this.findManagedVersion(input.versionId, userId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.versionDependency.deleteMany({
        where: { versionId: version.id },
      });

      for (const dependency of input.dependencies.slice(0, 32)) {
        await createVersionDependency(tx, version.id, dependency);
      }

      return tx.version.findUniqueOrThrow({
        select: versionSelect(),
        where: { id: version.id },
      });
    });

    return versionRowToContract(updated);
  }

  async recordFileScan(
    input: RecordFileScanInput,
    user: AuthenticatedUser,
  ): Promise<VersionSummaryContract> {
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new ForbiddenException('Moderator access required');
    }

    const file = await this.prisma.versionFile.findUnique({
      select: {
        id: true,
        versionId: true,
      },
      where: { id: input.fileId },
    });

    if (file === null) {
      throw new NotFoundException('File not found');
    }

    const details = parseScanDetails(input.details);
    await this.prisma.fileScan.create({
      data: {
        details,
        fileId: file.id,
        status: requiredTrim(input.status, 'Scan status is required'),
        verdict: nullableTrim(input.verdict),
      },
    });

    const updated = await this.prisma.version.findUniqueOrThrow({
      select: versionSelect(),
      where: { id: file.versionId },
    });

    return versionRowToContract(updated);
  }

  private async findManagedVersion(versionId: string, userId: string) {
    const version = await this.prisma.version.findFirst({
      select: {
        id: true,
        project: {
          select: {
            team: {
              select: {
                members: {
                  select: { userId: true },
                  take: 1,
                  where: {
                    acceptedAt: { not: null },
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      where: { id: versionId },
    });

    if (version === null) {
      throw new NotFoundException('Version not found');
    }

    if (version.project.team.members.length === 0) {
      throw new ForbiddenException('Project membership required');
    }

    return version;
  }
}

async function createVersionDependency(
  tx: Prisma.TransactionClient,
  versionId: string,
  input: VersionDependencyInput,
): Promise<void> {
  const targetProjectSlug = nullableTrim(input.targetProjectSlug);
  const externalFileName = nullableTrim(input.externalFileName);
  const targetVersionId = nullableTrim(input.targetVersionId);

  if (
    targetProjectSlug === null &&
    externalFileName === null &&
    targetVersionId === null
  ) {
    throw new BadRequestException('Dependency target required');
  }

  const targetProject =
    targetProjectSlug === null
      ? null
      : await tx.project.findUnique({
          select: { id: true },
          where: { slug: targetProjectSlug },
        });

  if (targetProjectSlug !== null && targetProject === null) {
    throw new NotFoundException('Dependency project not found');
  }

  if (targetVersionId !== null) {
    const targetVersion = await tx.version.findUnique({
      select: { id: true },
      where: { id: targetVersionId },
    });

    if (targetVersion === null) {
      throw new NotFoundException('Dependency version not found');
    }
  }

  await tx.versionDependency.create({
    data: {
      dependencyKind: input.dependencyKind,
      externalFileName,
      targetProjectId: targetProject?.id ?? null,
      targetVersionId,
      versionId,
    },
  });
}

function versionSelect() {
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

async function replaceVersionGameVersions(
  tx: Prisma.TransactionClient,
  versionId: string,
  versions: readonly string[],
): Promise<void> {
  await tx.versionGameVersion.deleteMany({ where: { versionId } });

  for (const version of uniqueNormalized(versions).filter(isGameVersionTag)) {
    const gameVersion = await tx.gameVersion.upsert({
      create: { version },
      update: {},
      where: { version },
    });
    await tx.versionGameVersion.create({
      data: { gameVersionId: gameVersion.id, versionId },
    });
  }
}

async function replaceVersionLoaders(
  tx: Prisma.TransactionClient,
  versionId: string,
  loaders: readonly string[],
): Promise<void> {
  await tx.versionLoader.deleteMany({ where: { versionId } });

  for (const loader of uniqueNormalized(loaders).flatMap((value) => {
    const mapped = loaderToEnum(value);
    return mapped === null ? [] : [mapped];
  })) {
    await tx.versionLoader.create({ data: { loader, versionId } });
  }
}

function versionUpdateData(
  input: UpdateVersionInput,
): Prisma.VersionUpdateInput {
  return {
    ...(input.changelog === undefined
      ? {}
      : { changelog: nullableTrim(input.changelog) }),
    ...(input.channel === undefined || input.channel === null
      ? {}
      : { channel: input.channel }),
    ...(input.name === undefined ? {} : { name: input.name?.trim() ?? '' }),
    ...(input.versionNumber === undefined
      ? {}
      : { versionNumber: input.versionNumber?.trim() ?? '' }),
  };
}

async function createVersionFiles(
  tx: Prisma.TransactionClient,
  versionId: string,
  files: CreateVersionInput['files'],
): Promise<void> {
  for (const file of files.slice(0, 8)) {
    const created = await tx.versionFile.create({
      data: {
        bucket: 'external',
        fileName: file.fileName.trim(),
        isPrimary: file.primary,
        key: `${versionId}/${file.fileName.trim()}`,
        sizeBytes: BigInt(file.sizeBytes),
        url: file.url.trim(),
        versionId,
      },
      select: { id: true },
    });

    for (const hash of file.hashes?.slice(0, 8) ?? []) {
      const algorithm = hashAlgorithm(hash.algorithm);
      if (algorithm === null) continue;

      const value = hash.value.trim().toLowerCase();
      if (value.length === 0) continue;

      await tx.fileHash.upsert({
        create: {
          algorithm,
          fileId: created.id,
          value,
        },
        update: { value },
        where: {
          fileId_algorithm: {
            algorithm,
            fileId: created.id,
          },
        },
      });
    }
  }
}

function hashAlgorithm(value: string): HashAlgorithm | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === HashAlgorithm.SHA1) return HashAlgorithm.SHA1;
  if (normalized === HashAlgorithm.SHA256) return HashAlgorithm.SHA256;
  if (normalized === HashAlgorithm.SHA512) return HashAlgorithm.SHA512;
  return null;
}

function loaderToEnum(loader: string): Loader | null {
  if (loader === 'fabric') return Loader.FABRIC;
  if (loader === 'forge') return Loader.FORGE;
  if (loader === 'neoforge') return Loader.NEOFORGE;
  if (loader === 'quilt') return Loader.QUILT;
  return null;
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

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredTrim(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

function parseScanDetails(
  value: string | null | undefined,
): Prisma.InputJsonValue | undefined {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed) as Prisma.InputJsonValue;
  } catch {
    throw new BadRequestException('Scan details must be valid JSON');
  }
}

function versionRowToContract(version: VersionRow): VersionSummaryContract {
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
