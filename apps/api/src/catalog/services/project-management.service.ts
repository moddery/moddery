import { Injectable, NotFoundException } from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import { SearchService } from '../../search/search.service.js';
import { type CreateProjectInput } from '../dto/create-project.input.js';
import { type UpdateProjectInput } from '../dto/update-project.input.js';
import {
  projectBySlugCacheKey,
  projectContractToSearch,
  projectRowToContract,
  projectSelect,
} from './project-read-model.js';
import {
  normalizeSlug,
  nullableTrim,
  projectUpdateData,
  replaceProjectCategories,
  replaceProjectGameVersions,
  replaceProjectLinks,
  replaceProjectLoaders,
  updatedLicenseId,
} from './project-write-model.js';

@Injectable()
export class ProjectManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly redis: RedisService,
  ) {}

  async createProject(
    input: CreateProjectInput,
    ownerId: string,
  ): Promise<ProjectSummaryContract> {
    const slug = normalizeSlug(input.slug);
    const now = new Date();
    const license = await this.prisma.license.upsert({
      create: {
        key: 'unknown',
        name: 'Unknown',
      },
      update: {},
      where: { key: 'unknown' },
    });

    const project = await this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          members: {
            create: {
              acceptedAt: now,
              isOwner: true,
              permissions: [
                'MANAGE_DETAILS',
                'MANAGE_MEMBERS',
                'MANAGE_SETTINGS',
                'MANAGE_VERSIONS',
                'VIEW_ANALYTICS',
              ],
              role: 'Owner',
              userId: ownerId,
            },
          },
          targetKind: 'PROJECT',
        },
      });

      const created = await tx.project.create({
        data: {
          approvedAt: now,
          color: nullableTrim(input.color),
          description: input.description.trim(),
          kind: input.kind,
          licenseId: license.id,
          publishedAt: now,
          slug,
          status: 'APPROVED',
          summary: input.summary.trim(),
          teamId: team.id,
          title: input.title.trim(),
        },
        select: { id: true },
      });

      await replaceProjectCategories(tx, created.id, input.categories ?? []);
      await replaceProjectGameVersions(
        tx,
        created.id,
        input.gameVersions ?? [],
      );
      await replaceProjectLoaders(tx, created.id, input.loaders ?? []);

      return tx.project.findUniqueOrThrow({
        select: projectSelect(),
        where: { id: created.id },
      });
    });

    const contract = projectRowToContract(project);
    await this.searchService.indexProjects([projectContractToSearch(contract)]);
    await this.invalidateProjectBySlugCache(contract.slug);

    return contract;
  }

  async updateProject(
    input: UpdateProjectInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    const existing = await this.findManagedProject(input.projectSlug, userId);

    const project = await this.prisma.$transaction(async (tx) => {
      const licenseId = await updatedLicenseId(tx, input);

      await tx.project.update({
        data: projectUpdateData(input, licenseId),
        where: { id: existing.id },
      });

      if (input.categories !== undefined && input.categories !== null) {
        await replaceProjectCategories(tx, existing.id, input.categories);
      }

      if (input.gameVersions !== undefined && input.gameVersions !== null) {
        await replaceProjectGameVersions(tx, existing.id, input.gameVersions);
      }

      if (input.loaders !== undefined && input.loaders !== null) {
        await replaceProjectLoaders(tx, existing.id, input.loaders);
      }

      if (input.links !== undefined && input.links !== null) {
        await replaceProjectLinks(tx, existing.id, input.links);
      }

      return tx.project.findUniqueOrThrow({
        select: projectSelect(),
        where: { id: existing.id },
      });
    });

    const contract = projectRowToContract(project);
    await this.searchService.indexProjects([projectContractToSearch(contract)]);
    await this.invalidateProjectBySlugCache(contract.slug);

    return contract;
  }

  private async findManagedProject(projectSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: {
        slug: projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              userId,
            },
          },
        },
      },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private invalidateProjectBySlugCache(slug: string): Promise<void> {
    return this.redis.delete(projectBySlugCacheKey(slug));
  }
}
