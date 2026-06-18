import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import {
  PaginationArgs,
  paginationOptions,
} from '../../common/graphql/pagination.js';
import { TeamsService } from '../services/teams.service.js';
import {
  TeamInvitationSearchResult,
  TeamInvitationSummary,
} from './team-invitation.model.js';

@Resolver(() => TeamInvitationSummary)
export class TeamsResolver {
  constructor(private readonly teamsService: TeamsService) {}

  @Query(() => [TeamInvitationSummary])
  viewerTeamInvitations(@CurrentUser() user: AuthenticatedUser) {
    return this.teamsService.findViewerInvitationList(user.id);
  }

  @Query(() => TeamInvitationSearchResult)
  viewerTeamInvitationSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args() pagination?: PaginationArgs,
  ) {
    return this.teamsService.findViewerInvitations(
      user.id,
      paginationOptions(pagination ?? {}),
    );
  }

  @Mutation(() => TeamInvitationSummary)
  acceptTeamInvitation(
    @Args('invitationId') invitationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.teamsService.acceptInvitation({
      invitationId,
      userId: user.id,
    });
  }

  @Mutation(() => TeamInvitationSummary)
  declineTeamInvitation(
    @Args('invitationId') invitationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.teamsService.declineInvitation({
      invitationId,
      userId: user.id,
    });
  }
}
