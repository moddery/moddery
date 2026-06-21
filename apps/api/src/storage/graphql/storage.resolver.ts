import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequireCredentialScopes } from '../../auth/decorators/credential-scopes.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { PrepareOwnerUploadInput } from '../dto/prepare-owner-upload.input.js';
import { PrepareProjectUploadInput } from '../dto/prepare-project-upload.input.js';
import { StorageService } from '../storage.service.js';
import { ProjectUploadTarget } from './project-upload.model.js';

@Resolver(() => ProjectUploadTarget)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @RequireCredentialScopes('write:projects')
  @Mutation(() => ProjectUploadTarget)
  prepareProjectUpload(
    @Args('input') input: PrepareProjectUploadInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.storageService.prepareProjectUpload(input, user.id);
  }

  @RequireCredentialScopes('write:projects')
  @Mutation(() => ProjectUploadTarget)
  prepareOwnerUpload(
    @Args('input') input: PrepareOwnerUploadInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.storageService.prepareOwnerUpload(input, user.id);
  }
}
