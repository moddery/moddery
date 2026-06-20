import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { AuditService } from '../../audit/audit.service.js';
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
  MAX_PROJECT_CATEGORIES,
  MAX_PROJECT_GAME_VERSIONS,
  MAX_PROJECT_LINKS,
  MAX_PROJECT_LOADERS,
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
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly redis: RedisService,
  ) {}

  async createProject(
    input: CreateProjectInput,
    ownerId: string,
  ): Promise<ProjectSummaryContract> {
    const slug = normalizeSlug(input.slug);
    validateProjectIdentity(input, slug);
    validateProjectMetadataLimits(input);
    await this.requireVerifiedCreatorEmail(ownerId);

    const existingProject = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug },
    });

    if (existingProject !== null) {
      throw new BadRequestException('Project slug already exists');
    }

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
          color: nullableTrim(input.color),
          description: input.description.trim(),
          iconUrl: nullableTrim(input.iconUrl),
          kind: input.kind,
          licenseId: license.id,
          queuedAt: now,
          requestedStatus: 'APPROVED',
          slug,
          status: 'PENDING_REVIEW',
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
    await this.invalidateProjectBySlugCache(contract.slug);

    return contract;
  }

  async updateProject(
    input: UpdateProjectInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    validateProjectUpdateIdentity(input);
    validateProjectMetadataLimits(input);
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
    if (contract.status === 'APPROVED') {
      await this.searchService.indexProjects([
        projectContractToSearch(contract),
      ]);
    } else {
      await this.searchService.deleteProject(contract.id);
    }
    await this.invalidateProjectBySlugCache(contract.slug);

    return contract;
  }

  private async findManagedProject(projectSlug: string, userId: string) {
    const slug = projectSlug.trim();
    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: {
        slug,
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
      await this.recordProjectUpdateDenied(userId, slug);
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async requireVerifiedCreatorEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      select: { emailVerifiedAt: true },
      where: { id: userId },
    });

    if (user?.emailVerifiedAt === undefined || user.emailVerifiedAt === null) {
      throw new ForbiddenException('Verified email required');
    }
  }

  private invalidateProjectBySlugCache(slug: string): Promise<void> {
    return this.redis.delete(projectBySlugCacheKey(slug));
  }

  private async recordProjectUpdateDenied(
    userId: string,
    slug: string,
  ): Promise<void> {
    if (slug.length === 0) return;

    const existingProject = await this.prisma.project.findUnique({
      select: { id: true, slug: true },
      where: { slug },
    });

    if (existingProject === null) return;

    await this.auditService.recordPermissionDenied({
      actorId: userId,
      attemptedAction: 'PROJECT_UPDATE',
      resource: {
        id: existingProject.id,
        kind: 'PROJECT',
        slug: existingProject.slug,
      },
    });
  }
}

function validateProjectIdentity(
  input: CreateProjectInput,
  slug: string,
): void {
  if (slug.length < 3) {
    throw new BadRequestException('Project slug must be at least 3 characters');
  }

  if (input.title.trim().length === 0) {
    throw new BadRequestException('Project title is required');
  }

  if (input.summary.trim().length === 0) {
    throw new BadRequestException('Project summary is required');
  }

  if (input.description.trim().length === 0) {
    throw new BadRequestException('Project description is required');
  }
}

function validateProjectUpdateIdentity(input: UpdateProjectInput): void {
  if (input.projectSlug.trim().length === 0) {
    throw new BadRequestException('Project is required');
  }

  if (input.title !== undefined && (input.title?.trim() ?? '').length === 0) {
    throw new BadRequestException('Project title is required');
  }

  if (
    input.summary !== undefined &&
    (input.summary?.trim() ?? '').length === 0
  ) {
    throw new BadRequestException('Project summary is required');
  }

  if (
    input.description !== undefined &&
    (input.description?.trim() ?? '').length === 0
  ) {
    throw new BadRequestException('Project description is required');
  }
}

function validateProjectMetadataLimits(
  input: CreateProjectInput | UpdateProjectInput,
): void {
  if (
    input.categories !== undefined &&
    input.categories !== null &&
    uniqueNormalized(input.categories).length > MAX_PROJECT_CATEGORIES
  ) {
    throw new BadRequestException(
      'A project can include at most 12 categories',
    );
  }

  if (
    input.gameVersions !== undefined &&
    input.gameVersions !== null &&
    uniqueNormalized(input.gameVersions).length > MAX_PROJECT_GAME_VERSIONS
  ) {
    throw new BadRequestException(
      'A project can include at most 12 game versions',
    );
  }

  if (
    input.loaders !== undefined &&
    input.loaders !== null &&
    uniqueNormalized(input.loaders).length > MAX_PROJECT_LOADERS
  ) {
    throw new BadRequestException('A project can include at most 8 loaders');
  }

  if (
    'links' in input &&
    input.links !== undefined &&
    input.links !== null &&
    input.links.length > MAX_PROJECT_LINKS
  ) {
    throw new BadRequestException('A project can include at most 16 links');
  }
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
