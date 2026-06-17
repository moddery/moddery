import { ForbiddenException } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { UpdateUserAccountInput } from '../dto/update-user-account.input.js';
import { UpdateViewerProfileInput } from '../dto/update-viewer-profile.input.js';
import { UsersService } from '../services/users.service.js';
import { FriendshipSummary } from './friendship-summary.model.js';
import { UserProfile } from './user-profile.model.js';

@Resolver(() => UserProfile)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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

  @Query(() => UserProfile, { nullable: true })
  viewer(@CurrentUser() user: AuthenticatedUser): Promise<UserProfile | null> {
    return this.usersService.findById(user.id);
  }

  @Query(() => [UserProfile])
  adminUsers(@CurrentUser() user: AuthenticatedUser) {
    assertAdmin(user);
    return this.usersService.findAdminUsers();
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
    return this.usersService.findViewerFriendship(user.id, username);
  }

  @Query(() => [FriendshipSummary])
  viewerFriends(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary[]> {
    return this.usersService.findViewerFriends(user.id);
  }

  @Query(() => [FriendshipSummary])
  viewerFriendRequests(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary[]> {
    return this.usersService.findViewerFriendRequests(user.id);
  }

  @Query(() => [FriendshipSummary])
  viewerBlockedUsers(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary[]> {
    return this.usersService.findViewerBlockedUsers(user.id);
  }

  @Mutation(() => FriendshipSummary)
  sendFriendRequest(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary> {
    return this.usersService.sendFriendRequest(user.id, username);
  }

  @Mutation(() => FriendshipSummary)
  acceptFriendRequest(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary> {
    return this.usersService.acceptFriendRequest(user.id, username);
  }

  @Mutation(() => Boolean)
  removeFriend(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return this.usersService.removeFriend(user.id, username);
  }

  @Mutation(() => FriendshipSummary)
  blockUser(
    @Args('username', { type: () => String }) username: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FriendshipSummary> {
    return this.usersService.blockUser(user.id, username);
  }

  @Mutation(() => UserProfile)
  updateUserAccount(
    @Args('input') input: UpdateUserAccountInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertAdmin(user);
    return this.usersService.updateUserAccount(input, user.id);
  }
}

function assertAdmin(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN') {
    return;
  }

  throw new ForbiddenException('Admin access required');
}
