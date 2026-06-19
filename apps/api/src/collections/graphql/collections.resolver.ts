import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import {
  PaginationArgs,
  paginationOptions,
} from '../../common/graphql/pagination.js';
import { AddProjectToCollectionInput } from '../dto/add-project-to-collection.input.js';
import { CreateCollectionInput } from '../dto/create-collection.input.js';
import { RemoveProjectFromCollectionInput } from '../dto/remove-project-from-collection.input.js';
import { UpdateCollectionProjectInput } from '../dto/update-collection-project.input.js';
import { UpdateCollectionInput } from '../dto/update-collection.input.js';
import { CollectionsService } from '../services/collections.service.js';
import { PublicCollectionsService } from '../services/public-collections.service.js';
import {
  CollectionProjectItemSearchResult,
  CollectionSearchResult,
  CollectionSummary,
} from './collection-summary.model.js';

@Resolver(() => CollectionSummary)
export class CollectionsResolver {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly publicCollectionsService: PublicCollectionsService,
  ) {}

  @Public()
  @Query(() => [CollectionSummary])
  publicCollections(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
  ) {
    return this.publicCollectionsService.findPublicCollectionList({ search });
  }

  @Public()
  @Query(() => CollectionSearchResult)
  publicCollectionSearch(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
    @Args() pagination?: PaginationArgs,
  ) {
    return this.publicCollectionsService.findPublicCollections({
      ...paginationOptions(pagination ?? {}),
      search,
    });
  }

  @Public()
  @Query(() => CollectionSummary)
  publicCollectionBySlug(
    @Args('ownerUsername') ownerUsername: string,
    @Args('slug') slug: string,
  ) {
    return this.publicCollectionsService.findPublicCollectionBySlug(
      ownerUsername,
      slug,
    );
  }

  @Public()
  @Query(() => CollectionProjectItemSearchResult)
  publicCollectionItemSearch(
    @Args('ownerUsername') ownerUsername: string,
    @Args('slug') slug: string,
    @Args() pagination?: PaginationArgs,
  ) {
    return this.publicCollectionsService.findPublicCollectionItems(
      ownerUsername,
      slug,
      paginationOptions(pagination ?? {}),
    );
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

  @Mutation(() => CollectionSummary)
  removeProjectFromCollection(
    @Args('input') input: RemoveProjectFromCollectionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.removeProjectFromCollection(input, user.id);
  }

  @Mutation(() => CollectionSummary)
  updateCollection(
    @Args('input') input: UpdateCollectionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.updateCollection(input, user.id);
  }

  @Mutation(() => CollectionSummary)
  updateCollectionProject(
    @Args('input') input: UpdateCollectionProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.collectionsService.updateCollectionProject(input, user.id);
  }
}
