import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { CatalogQueryInput } from '../dto/catalog-query.input.js';
import { CreateProjectInput } from '../dto/create-project.input.js';
import { CatalogService } from '../services/catalog.service.js';
import {
  ProjectFollowState,
  ProjectMemberSummary,
  ProjectSummary,
} from './project-summary.model.js';

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

  @Public()
  @Query(() => [ProjectMemberSummary])
  projectMembers(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
  ) {
    return this.catalogService.findProjectMembers(projectSlug);
  }

  @Mutation(() => ProjectSummary)
  async createProject(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return projectToGraphql(
      await this.catalogService.createProject(input, user.id),
    );
  }

  @Query(() => ProjectFollowState, { nullable: true })
  viewerProjectFollowState(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.findViewerProjectFollowState(
      projectSlug,
      user.id,
    );
  }

  @Mutation(() => ProjectFollowState)
  followProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.followProject(projectSlug, user.id);
  }

  @Mutation(() => ProjectFollowState)
  unfollowProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.unfollowProject(projectSlug, user.id);
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
