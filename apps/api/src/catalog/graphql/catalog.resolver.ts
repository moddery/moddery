import { Args, Query, Resolver } from '@nestjs/graphql';

import { Public } from '../../auth/decorators/public.decorator.js';
import { CatalogQueryInput } from '../dto/catalog-query.input.js';
import { CatalogService } from '../services/catalog.service.js';
import { ProjectSummary } from './project-summary.model.js';

@Resolver(() => ProjectSummary)
export class CatalogResolver {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Query(() => ProjectSummary, { nullable: true })
  async projectBySlug(@Args('slug', { type: () => String }) slug: string) {
    const project = await this.catalogService.findProjectBySlug(slug);

    return project === undefined ? undefined : projectToGraphql(project);
  }

  @Public()
  @Query(() => [ProjectSummary])
  async projects(
    @Args('query', { nullable: true, type: () => CatalogQueryInput })
    query?: CatalogQueryInput,
  ) {
    const projects = await this.catalogService.findProjects(query);

    return projects.map(projectToGraphql);
  }
}

function projectToGraphql(project: {
  gallery: readonly { createdAt: string }[];
  updatedAt: string;
}) {
  return {
    ...project,
    gallery: project.gallery.map((image) => ({
      ...image,
      createdAt: new Date(image.createdAt),
    })),
    updatedAt: new Date(project.updatedAt),
  };
}
