import { BadRequestException, Injectable } from '@nestjs/common';
import { isGameVersionTag } from '@moddery/shared';
import { Loader, type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  type VersionSearchResultContract,
  type VersionSummaryContract,
  versionRowToContract,
  versionSelect,
} from './version-read-model.js';

@Injectable()
export class VersionDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProjectSlug(
    projectSlug: string,
  ): Promise<VersionSummaryContract[]> {
    const result = await this.searchByProjectSlug(projectSlug, {
      limit: 100,
      offset: 0,
    });

    return result.versions;
  }

  async searchByProjectSlug(
    projectSlug: string,
    {
      gameVersion = null,
      limit = 20,
      loader = null,
      offset = 0,
      search = null,
    }: {
      gameVersion?: string | null;
      limit?: number;
      loader?: string | null;
      offset?: number;
      search?: string | null;
    } = {},
  ): Promise<VersionSearchResultContract> {
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const where = versionSearchWhere(projectSlug, {
      gameVersion,
      loader,
      search,
    });

    const [totalHits, versions] = await Promise.all([
      this.prisma.version.count({ where }),
      this.prisma.version.findMany({
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
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
}

function versionSearchWhere(
  projectSlug: string,
  {
    gameVersion,
    loader,
    search,
  }: {
    gameVersion?: string | null;
    loader?: string | null;
    search?: string | null;
  },
): Prisma.VersionWhereInput {
  const normalizedGameVersion = nullableTrim(gameVersion);
  const normalizedLoader = nullableTrim(loader)?.toLowerCase() ?? null;
  const normalizedSearch = nullableTrim(search);

  if (
    normalizedGameVersion !== null &&
    !isGameVersionTag(normalizedGameVersion)
  ) {
    throw new BadRequestException('Unsupported game version');
  }

  const loaderFilter =
    normalizedLoader === null ? null : loaderToEnum(normalizedLoader);
  if (normalizedLoader !== null && loaderFilter === null) {
    throw new BadRequestException('Unsupported loader');
  }

  return {
    ...(normalizedGameVersion === null
      ? {}
      : {
          gameVersions: {
            some: {
              gameVersion: { version: normalizedGameVersion },
            },
          },
        }),
    ...(loaderFilter === null
      ? {}
      : {
          loaders: {
            some: { loader: loaderFilter },
          },
        }),
    project: { slug: projectSlug, status: 'APPROVED' },
    ...(normalizedSearch === null
      ? {}
      : {
          OR: [
            {
              name: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
            {
              versionNumber: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
          ],
        }),
    status: 'APPROVED',
  };
}

function loaderToEnum(loader: string): Loader | null {
  if (loader === 'fabric') return Loader.FABRIC;
  if (loader === 'forge') return Loader.FORGE;
  if (loader === 'neoforge') return Loader.NEOFORGE;
  if (loader === 'quilt') return Loader.QUILT;
  return null;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
