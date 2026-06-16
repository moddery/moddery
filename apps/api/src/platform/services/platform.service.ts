import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PROJECT_KINDS,
  SUPPORTED_LOADERS,
  type ProjectKind,
} from '@moddery/shared';
import { ProjectKind as PrismaProjectKind } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type UpsertCategoryInput } from '../dto/upsert-category.input.js';
import { type UpsertGameVersionInput } from '../dto/upsert-game-version.input.js';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async metadata() {
    const [categories, gameVersions] = await Promise.all([
      this.findCategories(),
      this.prisma.gameVersion.findMany({
        orderBy: { version: 'desc' },
        select: { version: true },
        where: { isActive: true },
      }),
    ]);

    return {
      categories,
      gameVersions: gameVersions.map((gameVersion) => gameVersion.version),
      loaders: [...SUPPORTED_LOADERS],
      projectKinds: [...PROJECT_KINDS],
    };
  }

  findCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ projectKind: 'asc' }, { name: 'asc' }],
      select: {
        description: true,
        name: true,
        projectKind: true,
        slug: true,
      },
    });
  }

  findGameVersions() {
    return this.prisma.gameVersion.findMany({
      orderBy: { version: 'desc' },
      select: {
        isActive: true,
        version: true,
      },
    });
  }

  upsertCategory(input: UpsertCategoryInput) {
    const slug = normalizedSlug(input.slug);
    const name = requiredTrim(input.name, 'Category name is required');
    const projectKind = nullableProjectKind(input.projectKind);

    return this.prisma.category.upsert({
      create: {
        description: nullableTrim(input.description),
        name,
        projectKind,
        slug,
      },
      update: {
        description: nullableTrim(input.description),
        name,
        projectKind,
      },
      where: { slug },
    });
  }

  upsertGameVersion(input: UpsertGameVersionInput) {
    const version = requiredTrim(input.version, 'Game version is required');

    return this.prisma.gameVersion.upsert({
      create: {
        isActive: input.isActive,
        version,
      },
      update: {
        isActive: input.isActive,
      },
      where: { version },
    });
  }
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

function normalizedSlug(value: string): string {
  const slug = requiredTrim(value, 'Slug is required').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug)) {
    throw new BadRequestException('Slug must be URL safe');
  }

  return slug;
}

function nullableProjectKind(
  value: string | null | undefined,
): ProjectKind | null {
  const normalized = value?.trim().toUpperCase() ?? '';
  if (normalized === '') return null;
  if (normalized === PrismaProjectKind.MOD) return PrismaProjectKind.MOD;
  if (normalized === PrismaProjectKind.MODPACK)
    return PrismaProjectKind.MODPACK;
  if (normalized === PrismaProjectKind.RESOURCE_PACK) {
    return PrismaProjectKind.RESOURCE_PACK;
  }
  if (normalized === PrismaProjectKind.SHADER) return PrismaProjectKind.SHADER;
  if (normalized === PrismaProjectKind.PLUGIN) return PrismaProjectKind.PLUGIN;
  if (normalized === PrismaProjectKind.DATAPACK)
    return PrismaProjectKind.DATAPACK;
  throw new BadRequestException('Unsupported project kind');
}
