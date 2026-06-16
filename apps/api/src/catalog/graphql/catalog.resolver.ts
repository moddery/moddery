import { Args, Query, Resolver } from '@nestjs/graphql';

import { CatalogQueryInput } from '../dto/catalog-query.input.js';
import { CatalogService } from '../services/catalog.service.js';
import { ProjectSummary } from './project-summary.model.js';

@Resolver(() => ProjectSummary)
export class CatalogResolver {
  constructor(private readonly catalogService: CatalogService) {}

  @Query(() => ProjectSummary, { nullable: true })
  projectBySlug(@Args('slug', { type: () => String }) slug: string) {
    const project = this.catalogService.findProjectBySlug(slug);

    return project === undefined
      ? undefined
      : { ...project, updatedAt: new Date(project.updatedAt) };
  }

  @Query(() => [ProjectSummary])
  projects(
    @Args('query', { nullable: true, type: () => CatalogQueryInput })
    query?: CatalogQueryInput,
  ) {
    return this.catalogService.findProjects(query).map((project) => ({
      ...project,
      updatedAt: new Date(project.updatedAt),
    }));
  }
}
