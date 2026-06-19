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

import { PrismaService } from '../../prisma/prisma.service.js';
import { type CreateVersionInput } from '../dto/create-version.input.js';
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

@Injectable()
export class VersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly versionDependenciesService: VersionDependenciesService,
  ) {}

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
    const version = await findManagedVersion(
      this.prisma,
      input.versionId,
      userId,
    );

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
    return this.versionDependenciesService.updateVersionDependencies(
      input,
      userId,
    );
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
