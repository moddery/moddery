import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { LoginInput } from '../dto/login.input.js';
import { RegisterInput } from '../dto/register.input.js';
import { AuthService } from '../services/auth.service.js';
import { type AuthenticatedUser } from '../services/auth-token.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { AuthPayload } from './auth-payload.model.js';
import { AuthUser } from './auth-user.model.js';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Query(() => AuthUser)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    const profile = await this.usersService.findById(user.id);

    return {
      displayName: profile?.displayName ?? null,
      id: profile?.id ?? user.id,
      isAdmin: (profile?.role ?? user.role) === 'ADMIN',
      role: profile?.role ?? user.role,
      username: profile?.username ?? user.username,
    };
  }

  @Public()
  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }
}
