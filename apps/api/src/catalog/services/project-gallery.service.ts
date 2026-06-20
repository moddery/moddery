import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';
import { TeamPermission } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import { type AddProjectGalleryImageInput } from '../dto/add-project-gallery-image.input.js';
import { type RemoveProjectGalleryImageInput } from '../dto/remove-project-gallery-image.input.js';
import { type UpdateProjectGalleryImageInput } from '../dto/update-project-gallery-image.input.js';
import {
  projectBySlugCacheKey,
  projectRowToContract,
  projectSelect,
} from './project-read-model.js';

@Injectable()
export class ProjectGalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async addProjectGalleryImage(
    input: AddProjectGalleryImageInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    const project = await this.findManagedProject(input.projectSlug, userId);
    const displayUrl = requiredGalleryUrl(input.displayUrl);
    const rawUrl = requiredGalleryUrl(input.rawUrl);

    await this.prisma.projectGalleryImage.create({
      data: {
        description: nullableTrim(input.description),
        displayUrl,
        featured: input.featured,
        projectId: project.id,
        rawUrl,
        sortOrder: input.sortOrder ?? 0,
        title: nullableTrim(input.title),
      },
    });

    return this.reloadProject(project.id);
  }

  async removeProjectGalleryImage(
    input: RemoveProjectGalleryImageInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    const image = await this.findManagedGalleryImage(input.imageId, userId);

    await this.prisma.projectGalleryImage.delete({
      where: { id: image.id },
    });

    return this.reloadProject(image.projectId);
  }

  async updateProjectGalleryImage(
    input: UpdateProjectGalleryImageInput,
    userId: string,
  ): Promise<ProjectSummaryContract> {
    const image = await this.findManagedGalleryImage(input.imageId, userId);
    const displayUrl = requiredGalleryUrl(input.displayUrl);
    const rawUrl = requiredGalleryUrl(input.rawUrl);

    await this.prisma.projectGalleryImage.update({
      data: {
        description: nullableTrim(input.description),
        displayUrl,
        featured: input.featured,
        rawUrl,
        sortOrder: input.sortOrder,
        title: nullableTrim(input.title),
      },
      where: { id: image.id },
    });

    return this.reloadProject(image.projectId);
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
              OR: [
                { isOwner: true },
                { permissions: { has: TeamPermission.MANAGE_DETAILS } },
              ],
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

  private async findManagedGalleryImage(imageId: string, userId: string) {
    const image = await this.prisma.projectGalleryImage.findFirst({
      select: {
        id: true,
        projectId: true,
      },
      where: {
        id: imageId,
        project: {
          team: {
            members: {
              some: {
                acceptedAt: { not: null },
                OR: [
                  { isOwner: true },
                  { permissions: { has: TeamPermission.MANAGE_DETAILS } },
                ],
                userId,
              },
            },
          },
        },
      },
    });

    if (image === null) {
      throw new NotFoundException('Gallery image not found');
    }

    return image;
  }

  private async reloadProject(
    projectId: string,
  ): Promise<ProjectSummaryContract> {
    const updated = await this.prisma.project.findUniqueOrThrow({
      select: projectSelect(),
      where: { id: projectId },
    });
    const contract = projectRowToContract(updated);
    await this.redis.delete(projectBySlugCacheKey(contract.slug));

    return contract;
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredGalleryUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException('Gallery image URL is required');
  }

  return trimmed;
}
