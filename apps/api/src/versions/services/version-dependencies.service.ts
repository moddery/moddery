import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  type UpdateVersionDependenciesInput,
  type VersionDependencyInput,
} from '../dto/update-version-dependencies.input.js';
import {
  type VersionSummaryContract,
  versionRowToContract,
  versionSelect,
} from './version-read-model.js';
import { findManagedVersion } from './version-management.js';

@Injectable()
export class VersionDependenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async updateVersionDependencies(
    input: UpdateVersionDependenciesInput,
    userId: string,
  ): Promise<{
    projectId: string;
    projectSlug: string;
    projectUpdatedAt: Date;
    summary: VersionSummaryContract;
  }> {
    const version = await findManagedVersion(
      this.prisma,
      input.versionId,
      userId,
    );

    const touchedAt = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.versionDependency.deleteMany({
        where: { versionId: version.id },
      });

      for (const dependency of input.dependencies.slice(0, 32)) {
        await createVersionDependency(tx, version.id, dependency);
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

    return {
      projectId: version.project.id,
      projectSlug: version.project.slug,
      projectUpdatedAt: touchedAt,
      summary: versionRowToContract(updated),
    };
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
  const targetCount = [
    targetProjectSlug,
    externalFileName,
    targetVersionId,
  ].filter((target) => target !== null).length;

  if (targetCount === 0) {
    throw new BadRequestException('Dependency target required');
  }

  if (targetCount > 1) {
    throw new BadRequestException('Dependency must have exactly one target');
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

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
