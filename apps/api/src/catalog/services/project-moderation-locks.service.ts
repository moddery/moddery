import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import {
  projectBySlugCacheKey,
  projectRowToContract,
  projectSelect,
} from './project-read-model.js';

@Injectable()
export class ProjectModerationLocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async lockProjectForModeration(
    projectSlug: string,
    moderatorId: string,
  ): Promise<ProjectSummaryContract> {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await this.prisma.moderationLock.upsert({
      create: {
        expiresAt,
        moderatorId,
        projectId: project.id,
      },
      update: {
        expiresAt,
        moderatorId,
      },
      where: { projectId: project.id },
    });

    const updated = await this.prisma.project.findUniqueOrThrow({
      select: projectSelect(),
      where: { id: project.id },
    });
    const contract = projectRowToContract(updated);
    await this.invalidateProjectBySlugCache(contract.slug);

    return contract;
  }

  async releaseProjectModerationLock(
    projectSlug: string,
    moderatorId: string,
  ): Promise<ProjectSummaryContract> {
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
        moderationLock: {
          select: { moderatorId: true },
        },
      },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    if (
      project.moderationLock !== null &&
      project.moderationLock.moderatorId !== moderatorId
    ) {
      throw new ForbiddenException('Only the lock owner can release this lock');
    }

    await this.prisma.moderationLock.deleteMany({
      where: { projectId: project.id },
    });

    const updated = await this.prisma.project.findUniqueOrThrow({
      select: projectSelect(),
      where: { id: project.id },
    });
    const contract = projectRowToContract(updated);
    await this.invalidateProjectBySlugCache(contract.slug);

    return contract;
  }

  private invalidateProjectBySlugCache(slug: string): Promise<void> {
    return this.redis.delete(projectBySlugCacheKey(slug));
  }
}
