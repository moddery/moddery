import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { TeamsService } from '../services/teams.service.js';
import { TeamInvitationSummary } from './team-invitation.model.js';

@Resolver(() => TeamInvitationSummary)
export class TeamsResolver {
  constructor(private readonly teamsService: TeamsService) {}

  @Query(() => [TeamInvitationSummary])
  viewerTeamInvitations(@CurrentUser() user: AuthenticatedUser) {
    return this.teamsService.findViewerInvitations(user.id);
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
