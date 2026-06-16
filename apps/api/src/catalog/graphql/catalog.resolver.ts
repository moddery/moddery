import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { AddProjectTeamMemberInput } from '../dto/add-project-team-member.input.js';
import { AddProjectGalleryImageInput } from '../dto/add-project-gallery-image.input.js';
import { CatalogQueryInput } from '../dto/catalog-query.input.js';
import { CreateProjectInput } from '../dto/create-project.input.js';
import { RemoveProjectTeamMemberInput } from '../dto/remove-project-team-member.input.js';
import { UpdateProjectInput } from '../dto/update-project.input.js';
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

  @Mutation(() => [ProjectMemberSummary])
  addProjectTeamMember(
    @Args('input') input: AddProjectTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.addProjectTeamMember(input, user.id);
  }

  @Mutation(() => ProjectSummary)
  async addProjectGalleryImage(
    @Args('input') input: AddProjectGalleryImageInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return projectToGraphql(
      await this.catalogService.addProjectGalleryImage(input, user.id),
    );
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

  @Mutation(() => ProjectSummary)
  async updateProject(
    @Args('input') input: UpdateProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return projectToGraphql(
      await this.catalogService.updateProject(input, user.id),
    );
  }

  @Mutation(() => [ProjectMemberSummary])
  removeProjectTeamMember(
    @Args('input') input: RemoveProjectTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.removeProjectTeamMember(input, user.id);
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
