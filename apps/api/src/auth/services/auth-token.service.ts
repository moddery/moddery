import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type CredentialScope } from './credential-scopes.js';

export interface AuthenticatedUser {
  readonly authMethod?: 'api_token' | 'session';
  readonly credentialScopes?: readonly CredentialScope[];
  readonly id: string;
  readonly role: string;
  readonly sessionId?: string;
  readonly username: string;
}

interface AccessTokenPayload {
  readonly sub: string;
  readonly role: string;
  readonly username: string;
}

export interface SessionTokenPayload extends AuthenticatedUser {
  readonly sessionId: string;
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  accessTokenTtlSeconds(): number {
    return this.config.getOrThrow<number>('app.jwtAccessTokenTtlSeconds');
  }

  async signAccessToken(user: AuthenticatedUser): Promise<string> {
    return this.jwtService.signAsync(
      {
        role: user.role,
        username: user.username,
      },
      {
        expiresIn: this.accessTokenTtlSeconds(),
        secret: this.config.getOrThrow<string>('app.jwtAccessTokenSecret'),
        subject: user.id,
      },
    );
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.config.getOrThrow<string>('app.jwtAccessTokenSecret'),
        },
      );

      return {
        authMethod: 'session',
        id: payload.sub,
        role: payload.role,
        username: payload.username,
      };
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }

  async verifyBearerToken(token: string): Promise<AuthenticatedUser> {
    const jwtUser = await this.verifySessionAccessToken(token);
    if (jwtUser !== null) {
      return jwtUser;
    }

    return this.verifyPersonalAccessToken(token);
  }

  async signSessionAccessToken(user: SessionTokenPayload): Promise<string> {
    return this.jwtService.signAsync(
      {
        role: user.role,
        sessionId: user.sessionId,
        username: user.username,
      },
      {
        expiresIn: this.accessTokenTtlSeconds(),
        secret: this.config.getOrThrow<string>('app.jwtAccessTokenSecret'),
        subject: user.id,
      },
    );
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async verifySessionAccessToken(
    token: string,
  ): Promise<AuthenticatedUser | null> {
    try {
      const payload = await this.jwtService.verifyAsync<
        AccessTokenPayload & { sessionId?: string }
      >(token, {
        secret: this.config.getOrThrow<string>('app.jwtAccessTokenSecret'),
      });

      if (payload.sessionId === undefined) {
        return null;
      }

      const session = await this.prisma.session.findFirst({
        include: { user: true },
        where: {
          expiresAt: { gt: new Date() },
          id: payload.sessionId,
          revokedAt: null,
          tokenHash: this.hashToken(token),
        },
      });

      if (session?.user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid bearer token');
      }

      await this.prisma.session.update({
        data: { lastUsedAt: new Date() },
        where: { id: session.id },
      });

      return {
        authMethod: 'session',
        id: session.user.id,
        role: session.user.role,
        sessionId: session.id,
        username: session.user.username,
      };
    } catch {
      return null;
    }
  }

  private async verifyPersonalAccessToken(
    token: string,
  ): Promise<AuthenticatedUser> {
    const tokenHash = this.hashToken(token);
    const apiToken = await this.prisma.apiToken.findFirst({
      include: { user: true },
      where: {
        tokenHash,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (apiToken?.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid bearer token');
    }

    await this.prisma.apiToken.update({
      data: { lastUsedAt: new Date() },
      where: { id: apiToken.id },
    });

    return {
      authMethod: 'api_token',
      credentialScopes: apiToken.scopes as CredentialScope[],
      id: apiToken.user.id,
      role: apiToken.user.role,
      username: apiToken.user.username,
    };
  }
}
