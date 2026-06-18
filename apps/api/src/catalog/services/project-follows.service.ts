import { Injectable } from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import {
  projectBySlugCacheKey,
  projectRowToContract,
  projectSelect,
  type ProjectSearchResultContract,
} from './project-read-model.js';

export interface ProjectFollowStateContract {
  following: boolean;
  followers: number;
  projectSlug: string;
}

@Injectable()
export class ProjectFollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findViewerProjectFollowState(
    projectSlug: string,
    userId: string,
  ): Promise<ProjectFollowStateContract | undefined> {
    const project = await this.prisma.project.findUnique({
      select: {
        followers: true,
        follows: {
          select: { userId: true },
          take: 1,
          where: { userId },
        },
        slug: true,
      },
      where: { slug: projectSlug },
    });

    if (project === null) return undefined;

    return {
      followers: project.followers,
      following: project.follows.length > 0,
      projectSlug: project.slug,
    };
  }

  async findViewerFollowedProjects(
    userId: string,
    {
      limit = 50,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<ProjectSearchResultContract> {
    const where = {
      project: { status: 'APPROVED' as const },
      userId,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, follows] = await Promise.all([
      this.prisma.projectFollow.count({ where }),
      this.prisma.projectFollow.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          project: {
            select: projectSelect(),
          },
        },
        skip,
        take,
        where,
      }),
    ]);

    return {
      projects: follows.map((follow) => projectRowToContract(follow.project)),
      totalHits,
    };
  }

  async findViewerFollowedProjectList(
    userId: string,
  ): Promise<ProjectSummaryContract[]> {
    const result = await this.findViewerFollowedProjects(userId);

    return result.projects;
  }

  followProject(
    projectSlug: string,
    userId: string,
  ): Promise<ProjectFollowStateContract> {
    return this.updateProjectFollow(projectSlug, userId, true);
  }

  unfollowProject(
    projectSlug: string,
    userId: string,
  ): Promise<ProjectFollowStateContract> {
    return this.updateProjectFollow(projectSlug, userId, false);
  }

  private async updateProjectFollow(
    projectSlug: string,
    userId: string,
    following: boolean,
  ): Promise<ProjectFollowStateContract> {
    const state = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUniqueOrThrow({
        select: { id: true, slug: true },
        where: { slug: projectSlug },
      });

      if (following) {
        await tx.projectFollow.upsert({
          create: {
            projectId: project.id,
            userId,
          },
          update: {},
          where: {
            userId_projectId: {
              projectId: project.id,
              userId,
            },
          },
        });
      } else {
        await tx.projectFollow.deleteMany({
          where: {
            projectId: project.id,
            userId,
          },
        });
      }

      const followers = await tx.projectFollow.count({
        where: { projectId: project.id },
      });

      await tx.project.update({
        data: { followers },
        where: { id: project.id },
      });

      return {
        followers,
        following,
        projectSlug: project.slug,
      };
    });
    await this.redis.delete(projectBySlugCacheKey(state.projectSlug));

    return state;
  }
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
