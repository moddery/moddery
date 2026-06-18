import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { AddProjectTeamMemberInput } from '../dto/add-project-team-member.input.js';
import { AddProjectGalleryImageInput } from '../dto/add-project-gallery-image.input.js';
import { CatalogQueryInput } from '../dto/catalog-query.input.js';
import { CreateProjectInput } from '../dto/create-project.input.js';
import { ModerateProjectInput } from '../dto/moderate-project.input.js';
import { RemoveProjectTeamMemberInput } from '../dto/remove-project-team-member.input.js';
import { UpdateProjectInput } from '../dto/update-project.input.js';
import { CatalogService } from '../services/catalog.service.js';
import { ProjectFollowsService } from '../services/project-follows.service.js';
import { ProjectGalleryService } from '../services/project-gallery.service.js';
import { ProjectManagementService } from '../services/project-management.service.js';
import { ProjectMembersService } from '../services/project-members.service.js';
import { ProjectModerationService } from '../services/project-moderation.service.js';
import {
  ModerationActionSearchResult,
  ModerationActionSummary,
} from './moderation-action-summary.model.js';
import {
  ProjectFollowState,
  ProjectMemberSearchResult,
  ProjectMemberSummary,
  ProjectSearchResult,
  ProjectSummary,
} from './project-summary.model.js';

@Resolver(() => ProjectSummary)
export class CatalogResolver {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly projectFollowsService: ProjectFollowsService,
    private readonly projectGalleryService: ProjectGalleryService,
    private readonly projectManagementService: ProjectManagementService,
    private readonly projectMembersService: ProjectMembersService,
    private readonly projectModerationService: ProjectModerationService,
  ) {}

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
  @Query(() => ProjectSearchResult)
  async projectSearch(
    @Args('query', { nullable: true, type: () => CatalogQueryInput })
    query?: CatalogQueryInput,
  ) {
    const result = await this.catalogService.searchProjects(query);

    return {
      projects: result.projects.map(projectToGraphql),
      totalHits: result.totalHits,
    };
  }

  @Query(() => [ProjectSummary])
  async viewerFollowedProjects(@CurrentUser() user: AuthenticatedUser) {
    const projects =
      await this.projectFollowsService.findViewerFollowedProjectList(user.id);

    return projects.map(projectToGraphql);
  }

  @Query(() => ProjectSearchResult)
  async viewerFollowedProjectSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    const result = await this.projectFollowsService.findViewerFollowedProjects(
      user.id,
      {
        limit: limit ?? undefined,
        offset: offset ?? undefined,
      },
    );

    return {
      projects: result.projects.map(projectToGraphql),
      totalHits: result.totalHits,
    };
  }

  @Query(() => [ProjectSummary])
  async moderationProjects(@CurrentUser() user: AuthenticatedUser) {
    assertCanModerate(user);
    const projects =
      await this.projectModerationService.findProjectModerationList();

    return projects.map(projectToGraphql);
  }

  @Query(() => ProjectSearchResult)
  async moderationProjectSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    assertCanModerate(user);
    const result =
      await this.projectModerationService.findProjectsForModeration({
        limit: limit ?? undefined,
        offset: offset ?? undefined,
      });

    return {
      projects: result.projects.map(projectToGraphql),
      totalHits: result.totalHits,
    };
  }

  @Query(() => [ModerationActionSummary])
  projectModerationActions(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);
    return this.projectModerationService.findProjectModerationActionList(
      projectSlug,
    );
  }

  @Query(() => ModerationActionSearchResult)
  projectModerationActionSearch(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    assertCanModerate(user);
    return this.projectModerationService.findProjectModerationActions(
      projectSlug,
      {
        limit: limit ?? undefined,
        offset: offset ?? undefined,
      },
    );
  }

  @Public()
  @Query(() => [ProjectMemberSummary])
  projectMembers(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
  ) {
    return this.projectMembersService.findProjectMembers(projectSlug);
  }

  @Public()
  @Query(() => ProjectMemberSearchResult)
  projectMemberSearch(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    return this.projectMembersService.findProjectMemberSearch(projectSlug, {
      limit: limit ?? undefined,
      offset: offset ?? undefined,
    });
  }

  @Mutation(() => [ProjectMemberSummary])
  addProjectTeamMember(
    @Args('input') input: AddProjectTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectMembersService.addProjectTeamMember(input, user.id);
  }

  @Mutation(() => ProjectSummary)
  async addProjectGalleryImage(
    @Args('input') input: AddProjectGalleryImageInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return projectToGraphql(
      await this.projectGalleryService.addProjectGalleryImage(input, user.id),
    );
  }

  @Mutation(() => ProjectSummary)
  async createProject(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return projectToGraphql(
      await this.projectManagementService.createProject(input, user.id),
    );
  }

  @Mutation(() => ProjectSummary)
  async updateProject(
    @Args('input') input: UpdateProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return projectToGraphql(
      await this.projectManagementService.updateProject(input, user.id),
    );
  }

  @Mutation(() => ProjectSummary)
  async moderateProject(
    @Args('input') input: ModerateProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);

    return projectToGraphql(
      await this.projectModerationService.moderateProject(input, user.id),
    );
  }

  @Mutation(() => ProjectSummary)
  async lockProjectForModeration(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);

    return projectToGraphql(
      await this.projectModerationService.lockProjectForModeration(
        projectSlug,
        user.id,
      ),
    );
  }

  @Mutation(() => ProjectSummary)
  async releaseProjectModerationLock(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanModerate(user);

    return projectToGraphql(
      await this.projectModerationService.releaseProjectModerationLock(
        projectSlug,
        user.id,
      ),
    );
  }

  @Mutation(() => [ProjectMemberSummary])
  removeProjectTeamMember(
    @Args('input') input: RemoveProjectTeamMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectMembersService.removeProjectTeamMember(input, user.id);
  }

  @Query(() => ProjectFollowState, { nullable: true })
  viewerProjectFollowState(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectFollowsService.findViewerProjectFollowState(
      projectSlug,
      user.id,
    );
  }

  @Mutation(() => ProjectFollowState)
  followProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectFollowsService.followProject(projectSlug, user.id);
  }

  @Mutation(() => ProjectFollowState)
  unfollowProject(
    @Args('projectSlug', { type: () => String }) projectSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectFollowsService.unfollowProject(projectSlug, user.id);
  }
}

function assertCanModerate(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
    return;
  }

  throw new ForbiddenException('Moderator access required');
}

function projectToGraphql(project: {
  gallery: readonly { createdAt: string }[];
  moderationLock?: { createdAt: string; expiresAt: string } | null;
  updatedAt: string;
}) {
  return {
    ...project,
    gallery: project.gallery.map((image) => ({
      ...image,
      createdAt: new Date(image.createdAt),
    })),
    moderationLock:
      project.moderationLock === null || project.moderationLock === undefined
        ? null
        : {
            ...project.moderationLock,
            createdAt: new Date(project.moderationLock.createdAt),
            expiresAt: new Date(project.moderationLock.expiresAt),
          },
    updatedAt: new Date(project.updatedAt),
  };
}
