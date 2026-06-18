import { Injectable } from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import { SearchService } from '../../search/search.service.js';
import { type CatalogQueryInput } from '../dto/catalog-query.input.js';
import {
  projectBySlugCacheKey,
  projectRowToContract,
  projectSelect,
  type ProjectRow,
  type ProjectSearchResultContract,
} from './project-read-model.js';

const PROJECT_BY_SLUG_CACHE_TTL_SECONDS = 60;

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly redis: RedisService,
  ) {}

  async findProjects(
    query: CatalogQueryInput = {},
  ): Promise<ProjectSummaryContract[]> {
    const result = await this.searchProjects(query);

    return result.projects;
  }

  async searchProjects(
    query: CatalogQueryInput = {},
  ): Promise<ProjectSearchResultContract> {
    const searchResult = await this.searchService.searchProjects({
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      sort: query.sort,
      tags: searchTagsFromQuery(query),
    });

    if (searchResult.ids.length === 0) {
      return {
        projects: [],
        totalHits: searchResult.total,
      };
    }

    const projects: ProjectRow[] = await this.prisma.project.findMany({
      select: projectSelect(),
      where: {
        id: { in: [...searchResult.ids] },
        status: 'APPROVED',
      },
    });

    const projectsById = new Map(
      projects.map((project) => [project.id, projectRowToContract(project)]),
    );

    return {
      projects: searchResult.ids.flatMap((id) => {
        const project = projectsById.get(id);
        return project === undefined ? [] : [project];
      }),
      totalHits: searchResult.total,
    };
  }

  async findProjectBySlug(
    slug: string,
  ): Promise<ProjectSummaryContract | undefined> {
    const cacheKey = projectBySlugCacheKey(slug);
    const cached = await this.redis.getJson<ProjectSummaryContract>(cacheKey);

    if (cached !== undefined) return cached;

    const project = await this.prisma.project.findUnique({
      select: projectSelect(),
      where: { slug },
    });

    if (project !== null) {
      const contract = projectRowToContract(project);
      await this.redis.setJson(cacheKey, contract, {
        ttlSeconds: PROJECT_BY_SLUG_CACHE_TTL_SECONDS,
      });

      return contract;
    }

    return undefined;
  }
}

function searchTagsFromQuery(query: CatalogQueryInput): string[] {
  return [
    ...(query.tags ?? []),
    ...(query.loader === undefined ? [] : [`loader:${query.loader}`]),
    ...(query.gameVersion === undefined
      ? []
      : [`game-version:${query.gameVersion}`]),
  ];
}
