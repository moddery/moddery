import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../decorators/current-user.decorator.js';
import { CreateApiTokenInput } from '../dto/create-api-token.input.js';
import { Public } from '../decorators/public.decorator.js';
import { LoginInput } from '../dto/login.input.js';
import { RegisterInput } from '../dto/register.input.js';
import { ApiTokensService } from '../services/api-tokens.service.js';
import { AuthService } from '../services/auth.service.js';
import { type AuthenticatedUser } from '../services/auth-token.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { ApiTokenSummary, CreatedApiToken } from './api-token.model.js';
import { AuthPayload } from './auth-payload.model.js';
import { AuthUser } from './auth-user.model.js';
import { SessionSummary } from './session.model.js';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly apiTokensService: ApiTokensService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput, @Context('req') request: GqlRequest) {
    return this.authService.login(input, requestMetadata(request));
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
  register(
    @Args('input') input: RegisterInput,
    @Context('req') request: GqlRequest,
  ) {
    return this.authService.register(input, requestMetadata(request));
  }

  @Query(() => [ApiTokenSummary])
  viewerApiTokens(
    @CurrentUser() user: AuthenticatedUser,
    @Args('includeRevoked', { nullable: true, type: () => Boolean })
    includeRevoked?: boolean | null,
  ) {
    return this.apiTokensService.findViewerTokens(user.id, { includeRevoked });
  }

  @Query(() => [SessionSummary])
  viewerSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Args('includeRevoked', { nullable: true, type: () => Boolean })
    includeRevoked?: boolean | null,
  ) {
    return this.authService.findViewerSessions(user.id, { includeRevoked });
  }

  @Mutation(() => CreatedApiToken)
  createApiToken(
    @Args('input') input: CreateApiTokenInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.apiTokensService.createViewerToken({
      expiresInDays: input.expiresInDays,
      name: input.name,
      scopes: input.scopes,
      user,
    });
  }

  @Mutation(() => ApiTokenSummary)
  revokeApiToken(
    @Args('tokenId') tokenId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.apiTokensService.revokeViewerToken({
      tokenId,
      userId: user.id,
    });
  }

  @Mutation(() => SessionSummary)
  revokeSession(
    @Args('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.revokeViewerSession({
      sessionId,
      userId: user.id,
    });
  }
}

interface GqlRequest {
  readonly headers?: Record<string, string | string[] | undefined>;
  readonly ip?: string;
  readonly socket?: {
    readonly remoteAddress?: string;
  };
}

function requestMetadata(request: GqlRequest) {
  return {
    ipAddress: firstPresent(
      firstHeader(request.headers?.['x-forwarded-for'])?.split(',')[0],
      request.ip,
      request.socket?.remoteAddress,
    ),
    userAgent: firstHeader(request.headers?.['user-agent']) ?? null,
  };
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function firstPresent(...values: (string | undefined)[]): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}
