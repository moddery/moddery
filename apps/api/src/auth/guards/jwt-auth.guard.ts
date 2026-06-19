import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { CREDENTIAL_SCOPES_KEY } from '../decorators/credential-scopes.decorator.js';
import {
  type AuthenticatedUser,
  AuthTokenService,
} from '../services/auth-token.service.js';
import { type CredentialScope } from '../services/credential-scopes.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== 'graphql') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<{
      req: {
        headers?: Record<string, string | string[] | undefined>;
        user?: unknown;
      };
    }>().req;
    const authorization = request.headers?.authorization;
    const token = this.extractBearerToken(authorization);

    if (token === undefined) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const user = await this.authTokenService.verifyBearerToken(token);
    assertCredentialScopes(
      user,
      this.reflector.getAllAndOverride<CredentialScope[]>(
        CREDENTIAL_SCOPES_KEY,
        [context.getHandler(), context.getClass()],
      ),
    );
    request.user = user;

    return true;
  }

  private extractBearerToken(
    authorization: string | string[] | undefined,
  ): string | undefined {
    const value = Array.isArray(authorization)
      ? authorization[0]
      : authorization;

    if (value === undefined) {
      return undefined;
    }

    const [scheme, token] = value.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || token === undefined) {
      return undefined;
    }

    return token;
  }
}

export function assertCredentialScopes(
  user: AuthenticatedUser,
  requiredScopes: readonly CredentialScope[] | undefined,
): void {
  if (user.authMethod !== 'api_token') {
    return;
  }

  if (requiredScopes === undefined || requiredScopes.length === 0) {
    throw new ForbiddenException(
      'Personal access token is not allowed for this operation',
    );
  }

  const grantedScopes = new Set(user.credentialScopes ?? []);
  for (const scope of requiredScopes) {
    if (!grantedScopes.has(scope)) {
      throw new ForbiddenException(`Personal access token requires ${scope}`);
    }
  }
}
