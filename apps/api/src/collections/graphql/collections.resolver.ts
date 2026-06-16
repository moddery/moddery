import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { AddProjectToCollectionInput } from '../dto/add-project-to-collection.input.js';
import { CreateCollectionInput } from '../dto/create-collection.input.js';
import { CollectionsService } from '../services/collections.service.js';
import { CollectionSummary } from './collection-summary.model.js';

@Resolver(() => CollectionSummary)
export class CollectionsResolver {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public()
  @Query(() => [CollectionSummary])
  publicCollections() {
    return this.collectionsService.findPublicCollections();
  }

  @Mutation(() => CollectionSummary)
  addProjectToCollection(
    @Args('input') input: AddProjectToCollectionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.addProjectToCollection(input, user.id);
  }

  @Mutation(() => CollectionSummary)
  createCollection(
    @Args('input') input: CreateCollectionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.createCollection(input, user.id);
  }
}
