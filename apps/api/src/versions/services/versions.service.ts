import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isGameVersionTag } from '@moddery/shared';
import {
  HashAlgorithm,
  Loader,
  type Prisma,
  VersionStatus,
} from '@prisma/client';

import { AuditService } from '../../audit/audit.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import { SearchService } from '../../search/search.service.js';
import { projectBySlugCacheKey } from '../../catalog/services/project-read-model.js';
import { type CreateVersionInput } from '../dto/create-version.input.js';
import { type ModerateVersionInput } from '../dto/moderate-version.input.js';
import { type UpdateVersionDependenciesInput } from '../dto/update-version-dependencies.input.js';
import { type UpdateVersionInput } from '../dto/update-version.input.js';
import { VersionDependenciesService } from './version-dependencies.service.js';
import { findManagedVersion } from './version-management.js';
import {
  type VersionSearchResultContract,
  type VersionSummaryContract,
  versionRowToContract,
  versionSelect,
} from './version-read-model.js';

const MAX_VERSION_FILES = 8;
const MAX_FILE_HASHES = 8;

@Injectable()
export class VersionsService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
    private readonly versionDependenciesService: VersionDependenciesService,
    private readonly redis: RedisService,
    private readonly search: SearchService,
  ) {}

  async createVersion(
    input: CreateVersionInput,
    authorId: string,
  ): Promise<VersionSummaryContract> {
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
        slug: true,
        status: true,
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

    if (project.status !== 'APPROVED') {
      throw new BadRequestException(
        'Project must be approved before publishing versions',
      );
    }

    validateVersionFiles(input.files);
    const versionNumber = input.versionNumber.trim();
    if (versionNumber.length === 0) {
      throw new BadRequestException('Version number is required');
    }

    const touchedAt = new Date();
    const version = await this.prisma.$transaction(async (tx) => {
      const existingVersion = await tx.version.findUnique({
        select: { id: true },
        where: {
          projectId_versionNumber: {
            projectId: project.id,
            versionNumber,
          },
        },
      });

      if (existingVersion !== null) {
        throw new BadRequestException('Version number already exists');
      }

      const created = await tx.version.create({
        data: {
          authorId,
          changelog: nullableTrim(input.changelog),
          channel: input.channel,
          name: input.name.trim(),
          projectId: project.id,
          requestedStatus: 'APPROVED',
          status: 'PENDING_REVIEW',
          versionNumber,
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
      await tx.project.update({
        data: { updatedAt: touchedAt },
        where: { id: project.id },
      });

      return tx.version.findUniqueOrThrow({
        select: versionSelect(),
        where: { id: created.id },
      });
    });
    await this.refreshProjectAfterVersionChange({
      projectId: project.id,
      projectSlug: project.slug,
      updatedAt: touchedAt,
    });

    return versionRowToContract(version);
  }

  async findVersionsForModeration({
    limit = 50,
    offset = 0,
  }: {
    limit?: number;
    offset?: number;
  } = {}): Promise<VersionSearchResultContract> {
    const where = {
      status: {
        in: [
          VersionStatus.PENDING_REVIEW,
          VersionStatus.REJECTED,
          VersionStatus.ARCHIVED,
        ],
      },
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, versions] = await Promise.all([
      this.prisma.version.count({ where }),
      this.prisma.version.findMany({
        orderBy: [{ createdAt: 'asc' }],
        select: versionSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      totalHits,
      versions: versions.map(versionRowToContract),
    };
  }

  async moderateVersion(
    input: ModerateVersionInput,
    moderatorId: string,
  ): Promise<VersionSummaryContract> {
    const action = moderationAction(input.action);
    const version = await this.prisma.version.findUnique({
      select: {
        id: true,
        name: true,
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
        requestedStatus: true,
        status: true,
        versionNumber: true,
      },
      where: { id: input.versionId },
    });

    if (version === null) {
      throw new NotFoundException('Version not found');
    }

    const touchedAt = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.version.update({
        data: moderationVersionData(action, touchedAt),
        where: { id: version.id },
      });
      await tx.project.update({
        data: { updatedAt: touchedAt },
        where: { id: version.project.id },
      });

      return tx.version.findUniqueOrThrow({
        select: versionSelect(),
        where: { id: version.id },
      });
    });
    await this.refreshProjectAfterVersionChange({
      projectId: version.project.id,
      projectSlug: version.project.slug,
      updatedAt: touchedAt,
    });
    await this.auditService.recordVersionModeration({
      action,
      actorId: moderatorId,
      after: versionAuditSnapshot(updated),
      before: versionAuditSnapshot(version),
      reason: nullableTrim(input.reason),
    });

    return versionRowToContract(updated);
  }

  async findManagedProjectVersionSearch(
    projectSlug: string,
    userId: string,
    {
      limit = 50,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<VersionSearchResultContract> {
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
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
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    if (project.team.members.length === 0) {
      throw new ForbiddenException('Project membership required');
    }

    const where = { projectId: project.id };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, versions] = await Promise.all([
      this.prisma.version.count({ where }),
      this.prisma.version.findMany({
        orderBy: [
          { sortOrder: 'asc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        select: versionSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      totalHits,
      versions: versions.map(versionRowToContract),
    };
  }

  async updateVersion(
    input: UpdateVersionInput,
    userId: string,
  ): Promise<VersionSummaryContract> {
    validateVersionUpdate(input);
    const version = await findManagedVersion(
      this.prisma,
      input.versionId,
      userId,
    );

    const touchedAt = new Date();
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

      await tx.project.update({
        data: { updatedAt: touchedAt },
        where: { id: version.project.id },
      });

      return tx.version.findUniqueOrThrow({
        select: versionSelect(),
        where: { id: version.id },
      });
    });
    await this.refreshProjectAfterVersionChange({
      projectId: version.project.id,
      projectSlug: version.project.slug,
      updatedAt: touchedAt,
    });

    return versionRowToContract(updated);
  }

  async updateVersionDependencies(
    input: UpdateVersionDependenciesInput,
    userId: string,
  ): Promise<VersionSummaryContract> {
    const version =
      await this.versionDependenciesService.updateVersionDependencies(
        input,
        userId,
      );
    await this.refreshProjectAfterVersionChange({
      projectId: version.projectId,
      projectSlug: version.projectSlug,
      updatedAt: version.projectUpdatedAt,
    });

    return version.summary;
  }

  private async refreshProjectAfterVersionChange({
    projectId,
    projectSlug,
    updatedAt,
  }: {
    projectId: string;
    projectSlug: string;
    updatedAt: Date;
  }): Promise<void> {
    await Promise.all([
      this.redis.delete(projectBySlugCacheKey(projectSlug)),
      this.search.updateProjectUpdatedAt(projectId, updatedAt.toISOString()),
    ]);
  }
}

function validateVersionUpdate(input: UpdateVersionInput): void {
  if (input.status !== undefined || input.requestedStatus !== undefined) {
    throw new BadRequestException('Version status is managed by moderation');
  }

  if (input.name !== undefined && input.name?.trim().length === 0) {
    throw new BadRequestException('Version name is required');
  }

  if (
    input.versionNumber !== undefined &&
    input.versionNumber?.trim().length === 0
  ) {
    throw new BadRequestException('Version number is required');
  }
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
    ...(input.featured === undefined || input.featured === null
      ? {}
      : { featured: input.featured }),
    ...(input.name === undefined ? {} : { name: input.name?.trim() ?? '' }),
    ...(input.requestedStatus === undefined
      ? {}
      : {
          requestedStatus:
            input.requestedStatus === null
              ? null
              : versionStatus(input.requestedStatus),
        }),
    ...(input.sortOrder === undefined || input.sortOrder === null
      ? {}
      : { sortOrder: input.sortOrder }),
    ...(input.status === undefined || input.status === null
      ? {}
      : { status: versionStatus(input.status) }),
    ...(input.versionNumber === undefined
      ? {}
      : { versionNumber: input.versionNumber?.trim() ?? '' }),
  };
}

function versionStatus(value: string): VersionStatus {
  if (Object.values(VersionStatus).includes(value as VersionStatus)) {
    return value as VersionStatus;
  }

  throw new BadRequestException('Unsupported version status');
}

function moderationAction(action: string): VersionModerationAction {
  const normalized = action.trim().toUpperCase();
  if (normalized === 'APPROVE') return 'APPROVE';
  if (normalized === 'REJECT') return 'REJECT';
  if (normalized === 'ARCHIVE') return 'ARCHIVE';
  if (normalized === 'RESTORE') return 'RESTORE';

  throw new ForbiddenException('Unsupported moderation action');
}

function moderationVersionData(
  action: VersionModerationAction,
  now: Date,
): Prisma.VersionUpdateInput {
  if (action === 'APPROVE') {
    return {
      publishedAt: now,
      requestedStatus: null,
      status: VersionStatus.APPROVED,
    };
  }

  if (action === 'REJECT') {
    return {
      requestedStatus: null,
      status: VersionStatus.REJECTED,
    };
  }

  if (action === 'ARCHIVE') {
    return {
      requestedStatus: null,
      status: VersionStatus.ARCHIVED,
    };
  }

  return {
    requestedStatus: VersionStatus.APPROVED,
    status: VersionStatus.PENDING_REVIEW,
  };
}

type VersionModerationAction = 'APPROVE' | 'ARCHIVE' | 'REJECT' | 'RESTORE';

function versionAuditSnapshot(version: VersionAuditRow) {
  return {
    id: version.id,
    name: version.name,
    projectSlug: version.project.slug,
    requestedStatus: version.requestedStatus,
    status: version.status,
    versionNumber: version.versionNumber,
  };
}

interface VersionAuditRow {
  id: string;
  name: string;
  project: {
    slug: string;
  };
  requestedStatus: string | null;
  status: string;
  versionNumber: string;
}

async function createVersionFiles(
  tx: Prisma.TransactionClient,
  versionId: string,
  files: CreateVersionInput['files'],
): Promise<void> {
  for (const file of files) {
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

    for (const hash of file.hashes ?? []) {
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

function validateVersionFiles(files: CreateVersionInput['files']): void {
  if (files.length === 0) {
    throw new BadRequestException('At least one version file is required');
  }

  if (files.length > MAX_VERSION_FILES) {
    throw new BadRequestException('A version can include at most 8 files');
  }

  if (!files.some((file) => file.primary)) {
    throw new BadRequestException('A primary version file is required');
  }

  for (const file of files) {
    if (file.fileName.trim().length === 0) {
      throw new BadRequestException('Version file name is required');
    }

    if (file.url.trim().length === 0) {
      throw new BadRequestException('Version file URL is required');
    }

    if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes <= 0) {
      throw new BadRequestException('Version file size must be positive');
    }

    if ((file.hashes?.length ?? 0) > MAX_FILE_HASHES) {
      throw new BadRequestException(
        'A version file can include at most 8 hashes',
      );
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
