import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isGameVersionTag } from '@moddery/shared';
import { HashAlgorithm, Loader, type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type CreateVersionInput } from '../dto/create-version.input.js';
import {
  type UpdateVersionDependenciesInput,
  type VersionDependencyInput,
} from '../dto/update-version-dependencies.input.js';
import { type UpdateVersionInput } from '../dto/update-version.input.js';
import {
  type VersionSummaryContract,
  versionRowToContract,
  versionSelect,
} from './version-read-model.js';

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
