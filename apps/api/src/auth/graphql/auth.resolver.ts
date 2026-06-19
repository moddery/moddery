import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../decorators/current-user.decorator.js';
import { ConfirmEmailVerificationInput } from '../dto/confirm-email-verification.input.js';
import { ConfirmPasswordResetInput } from '../dto/confirm-password-reset.input.js';
import { CreateApiTokenInput } from '../dto/create-api-token.input.js';
import { Public } from '../decorators/public.decorator.js';
import { LoginInput } from '../dto/login.input.js';
import { RegisterInput } from '../dto/register.input.js';
import { RequestPasswordResetInput } from '../dto/request-password-reset.input.js';
import { VerifyTwoFactorInput } from '../dto/verify-two-factor.input.js';
import { ApiTokensService } from '../services/api-tokens.service.js';
import { AuthService } from '../services/auth.service.js';
import { type AuthenticatedUser } from '../services/auth-token.service.js';
import {
  PaginationArgs,
  paginationOptions,
} from '../../common/graphql/pagination.js';
import { UsersService } from '../../users/services/users.service.js';
import {
  ApiTokenSearchResult,
  ApiTokenSummary,
  CreatedApiToken,
} from './api-token.model.js';
import { AuthPayload } from './auth-payload.model.js';
import { AuthUser } from './auth-user.model.js';
import { SessionSearchResult, SessionSummary } from './session.model.js';
import { TwoFactorSetup } from './two-factor-setup.model.js';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly apiTokensService: ApiTokensService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput, @Context('req') request: GqlRequest) {
    return this.authService.login(input, requestMetadata(request));
  }

  @Mutation(() => TwoFactorSetup)
  setupTwoFactor(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupTwoFactor(user);
  }

  @Mutation(() => Boolean)
  enableTwoFactor(
    @Args('input') input: VerifyTwoFactorInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.enableTwoFactor(user.id, input.code);
  }

  @Mutation(() => Boolean)
  disableTwoFactor(
    @Args('input') input: VerifyTwoFactorInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.disableTwoFactor(user.id, input.code);
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
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Mutation(() => AuthPayload)
  register(
    @Args('input') input: RegisterInput,
    @Context('req') request: GqlRequest,
  ) {
    return this.authService.register(input, requestMetadata(request));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Mutation(() => Boolean)
  requestPasswordReset(@Args('input') input: RequestPasswordResetInput) {
    return this.authService.requestPasswordReset(input);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Mutation(() => Boolean)
  confirmPasswordReset(@Args('input') input: ConfirmPasswordResetInput) {
    return this.authService.confirmPasswordReset(input);
  }

  @Mutation(() => Boolean)
  requestEmailVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.requestEmailVerification(user.id);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Mutation(() => Boolean)
  confirmEmailVerification(
    @Args('input') input: ConfirmEmailVerificationInput,
  ) {
    return this.authService.confirmEmailVerification(input);
  }

  @Query(() => [ApiTokenSummary])
  viewerApiTokens(
    @CurrentUser() user: AuthenticatedUser,
    @Args('includeRevoked', { nullable: true, type: () => Boolean })
    includeRevoked?: boolean | null,
  ) {
    return this.apiTokensService.findViewerTokenList(user.id, {
      includeRevoked,
    });
  }

  @Query(() => ApiTokenSearchResult)
  viewerApiTokenSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('includeRevoked', { nullable: true, type: () => Boolean })
    includeRevoked?: boolean | null,
    @Args() pagination?: PaginationArgs,
  ) {
    return this.apiTokensService.findViewerTokens(user.id, {
      includeRevoked,
      ...paginationOptions(pagination ?? {}),
    });
  }

  @Query(() => [SessionSummary])
  viewerSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Args('includeRevoked', { nullable: true, type: () => Boolean })
    includeRevoked?: boolean | null,
  ) {
    return this.authService.findViewerSessionList(user.id, {
      currentSessionId: user.sessionId,
      includeRevoked,
    });
  }

  @Query(() => SessionSearchResult)
  viewerSessionSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('includeRevoked', { nullable: true, type: () => Boolean })
    includeRevoked?: boolean | null,
    @Args() pagination?: PaginationArgs,
  ) {
    return this.authService.findViewerSessions(user.id, {
      currentSessionId: user.sessionId,
      includeRevoked,
      ...paginationOptions(pagination ?? {}),
    });
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
      currentSessionId: user.sessionId,
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
