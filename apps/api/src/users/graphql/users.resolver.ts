import { ForbiddenException } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { paginationOptions } from '../../common/graphql/pagination.js';
import { UpdateUserAccountInput } from '../dto/update-user-account.input.js';
import { UpdateViewerProfileInput } from '../dto/update-viewer-profile.input.js';
import { UserAdminService } from '../services/user-admin.service.js';
import { UserDirectoryService } from '../services/user-directory.service.js';
import { UserFriendshipsService } from '../services/user-friendships.service.js';
import { UsersService } from '../services/users.service.js';
import {
  FriendshipSearchResult,
  FriendshipSummary,
} from './friendship-summary.model.js';
import {
  UserCollectionSearchResult,
  UserProfile,
  UserProjectSearchResult,
  UserSearchResult,
} from './user-profile.model.js';

@Resolver(() => UserProfile)
export class UsersResolver {
  constructor(
    private readonly userAdminService: UserAdminService,
    private readonly userDirectoryService: UserDirectoryService,
    private readonly userFriendshipsService: UserFriendshipsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField(() => Boolean)
  isAdmin(@Parent() user: UserProfile): boolean {
    return user.role === 'ADMIN';
  }

  @Public()
  @Query(() => UserProfile, { nullable: true })
  userByUsername(
    @Args('username', { type: () => String }) username: string,
  ): Promise<UserProfile | null> {
    return this.usersService.findByUsername(username);
  }

  @Public()
  @Query(() => [UserProfile])
  publicUsers(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
  ): Promise<UserProfile[]> {
    return this.userDirectoryService.findPublicUserList({ search });
  }

  @Public()
  @Query(() => UserSearchResult)
  publicUserSearch(
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<UserSearchResult> {
    return this.userDirectoryService.findPublicUsers({
      ...paginationOptions({ limit, offset }),
      search,
    });
  }

  @Public()
  @Query(() => UserProjectSearchResult)
  publicUserProjectSearch(
    @Args('username', { type: () => String }) username: string,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<UserProjectSearchResult> {
    return this.userDirectoryService.findPublicUserProjects(
      username,
      paginationOptions({ limit, offset }),
    );
  }

  @Public()
  @Query(() => UserCollectionSearchResult)
  publicUserCollectionSearch(
    @Args('username', { type: () => String }) username: string,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<UserCollectionSearchResult> {
    return this.userDirectoryService.findPublicUserCollections(
      username,
      paginationOptions({ limit, offset }),
    );
  }

  @Query(() => UserProfile, { nullable: true })
  viewer(@CurrentUser() user: AuthenticatedUser): Promise<UserProfile | null> {
    return this.usersService.findById(user.id);
  }

  @Query(() => [UserProfile])
  adminUsers(@CurrentUser() user: AuthenticatedUser): Promise<UserProfile[]> {
    assertAdmin(user);
    return this.userAdminService.findAdminUserList();
  }

  @Query(() => UserSearchResult)
  adminUserSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('search', { nullable: true, type: () => String })
    search?: string | null,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<UserSearchResult> {
    assertAdmin(user);
    return this.userAdminService.findAdminUsers({
      ...paginationOptions({ limit, offset }),
      search,
    });
  }

  @Mutation(() => UserProfile, { nullable: true })
  updateViewerProfile(
    @Args('input') input: UpdateViewerProfileInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfile | null> {
    return this.usersService.updateViewerProfile(user.id, input);
  }

  @Query(() => FriendshipSummary, { nullable: true })
  viewerFriendship(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary | null> {
    return this.userFriendshipsService.findViewerFriendship(user.id, username);
  }

  @Query(() => [FriendshipSummary])
  viewerFriends(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary[]> {
    return this.userFriendshipsService.findViewerFriendList(user.id);
  }

  @Query(() => FriendshipSearchResult)
  viewerFriendSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<FriendshipSearchResult> {
    return this.userFriendshipsService.findViewerFriends(
      user.id,
      paginationOptions({ limit, offset }),
    );
  }

  @Query(() => [FriendshipSummary])
  viewerFriendRequests(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary[]> {
    return this.userFriendshipsService.findViewerFriendRequestList(user.id);
  }

  @Query(() => FriendshipSearchResult)
  viewerFriendRequestSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<FriendshipSearchResult> {
    return this.userFriendshipsService.findViewerFriendRequests(
      user.id,
      paginationOptions({ limit, offset }),
    );
  }

  @Query(() => [FriendshipSummary])
  viewerBlockedUsers(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary[]> {
    return this.userFriendshipsService.findViewerBlockedUserList(user.id);
  }

  @Query(() => FriendshipSearchResult)
  viewerBlockedUserSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ): Promise<FriendshipSearchResult> {
    return this.userFriendshipsService.findViewerBlockedUsers(
      user.id,
      paginationOptions({ limit, offset }),
    );
  }

  @Mutation(() => FriendshipSummary)
  sendFriendRequest(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary> {
    return this.userFriendshipsService.sendFriendRequest(user.id, username);
  }

  @Mutation(() => FriendshipSummary)
  acceptFriendRequest(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary> {
    return this.userFriendshipsService.acceptFriendRequest(user.id, username);
  }

  @Mutation(() => Boolean)
  removeFriend(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return this.userFriendshipsService.removeFriend(user.id, username);
  }

  @Mutation(() => FriendshipSummary)
  blockUser(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary> {
    return this.userFriendshipsService.blockUser(user.id, username);
  }

  @Mutation(() => UserProfile)
  updateUserAccount(
    @Args('input') input: UpdateUserAccountInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfile> {
    assertAdmin(user);
    return this.userAdminService.updateUserAccount(input, user.id);
  }
}

function assertAdmin(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN') {
    return;
  }

  throw new ForbiddenException('Admin access required');
}
