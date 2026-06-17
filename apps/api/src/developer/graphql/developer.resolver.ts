import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { CreateOAuthClientInput } from '../dto/create-oauth-client.input.js';
import { DeveloperService } from '../services/developer.service.js';
import {
  CreatedOAuthClient,
  OAuthClientSummary,
} from './oauth-client.model.js';

@Resolver(() => OAuthClientSummary)
export class DeveloperResolver {
  constructor(private readonly developerService: DeveloperService) {}

  @Query(() => [OAuthClientSummary])
  viewerOAuthClients(@CurrentUser() user: AuthenticatedUser) {
    return this.developerService.findViewerOAuthClients(user.id);
  }

  @Mutation(() => CreatedOAuthClient)
  createOAuthClient(
    @Args('input') input: CreateOAuthClientInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.developerService.createViewerOAuthClient({
      input,
      ownerId: user.id,
    });
  }

  @Mutation(() => OAuthClientSummary)
  revokeOAuthClient(
    @Args('clientId') clientId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.developerService.revokeViewerOAuthClient({
      clientId,
      ownerId: user.id,
    });
  }
}
