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
import { UpdateViewerProfileInput } from '../dto/update-viewer-profile.input.js';
import { UsersService } from '../services/users.service.js';
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

  @Mutation(() => UserProfile, { nullable: true })
  updateViewerProfile(
    @Args('input') input: UpdateViewerProfileInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfile | null> {
    return this.usersService.updateViewerProfile(user.id, input);
  }
}
