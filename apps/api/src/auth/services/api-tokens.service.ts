import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  type AuthenticatedUser,
  AuthTokenService,
} from './auth-token.service.js';

const tokenPrefix = 'mdy_pat';

@Injectable()
export class ApiTokensService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  findViewerTokens(
    userId: string,
    {
      includeRevoked,
    }: {
      includeRevoked?: boolean | null;
    } = {},
  ) {
    return this.prisma.apiToken.findMany({
      orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
      select: apiTokenSelect(),
      where: {
        ...(includeRevoked ? {} : { revokedAt: null }),
        userId,
      },
    });
  }

  async createViewerToken(input: {
    expiresInDays?: number | null;
    name: string;
    scopes?: readonly string[] | null;
    user: AuthenticatedUser;
  }) {
    const name = input.name.trim();
    if (name.length === 0) {
      throw new BadRequestException('Token name is required');
    }

    const token = `${tokenPrefix}_${randomBytes(32).toString('base64url')}`;
    const expiresAt =
      input.expiresInDays === null || input.expiresInDays === undefined
        ? null
        : expiresAtFromDays(input.expiresInDays);

    const tokenSummary = await this.prisma.apiToken.create({
      data: {
        expiresAt,
        name,
        scopes: sanitizeScopes(input.scopes),
        tokenHash: this.authTokenService.hashToken(token),
        userId: input.user.id,
      },
      select: apiTokenSelect(),
    });

    return { token, tokenSummary };
  }

  async revokeViewerToken({
    tokenId,
    userId,
  }: {
    tokenId: string;
    userId: string;
  }) {
    const update = await this.prisma.apiToken.updateMany({
      data: { revokedAt: new Date() },
      where: {
        id: tokenId,
        userId,
      },
    });

    if (update.count === 0) {
      throw new NotFoundException('Token not found');
    }

    return this.prisma.apiToken.findUniqueOrThrow({
      select: apiTokenSelect(),
      where: { id: tokenId },
    });
  }
}

function apiTokenSelect() {
  return {
    createdAt: true,
    expiresAt: true,
    id: true,
    lastUsedAt: true,
    name: true,
    revokedAt: true,
    scopes: true,
  };
}

function expiresAtFromDays(days: number): Date {
  if (!Number.isInteger(days) || days <= 0 || days > 3660) {
    throw new BadRequestException(
      'Token expiry must be between 1 and 3660 days',
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

function sanitizeScopes(
  scopes: readonly string[] | null | undefined,
): string[] {
  return [...new Set(scopes ?? [])]
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0)
    .sort();
}
