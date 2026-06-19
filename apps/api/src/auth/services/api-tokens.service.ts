import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { AuditService } from '../../audit/audit.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  type AuthenticatedUser,
  AuthTokenService,
} from './auth-token.service.js';
import { normalizeCredentialScopes } from './credential-scopes.js';

const tokenPrefix = 'mdy_pat';

@Injectable()
export class ApiTokensService {
  private readonly auditService: SecurityAuditRecorder;

  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
    @Optional() auditService?: AuditService,
  ) {
    this.auditService = auditService ?? noopAuditService;
  }

  async findViewerTokens(
    userId: string,
    {
      includeRevoked,
      limit = 20,
      offset = 0,
    }: {
      includeRevoked?: boolean | null;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const where = {
      ...(includeRevoked ? {} : { revokedAt: null }),
      userId,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, tokens] = await Promise.all([
      this.prisma.apiToken.count({ where }),
      this.prisma.apiToken.findMany({
        orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
        select: apiTokenSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      tokens,
      totalHits,
    };
  }

  async findViewerTokenList(
    userId: string,
    {
      includeRevoked,
    }: {
      includeRevoked?: boolean | null;
    } = {},
  ) {
    const result = await this.findViewerTokens(userId, { includeRevoked });

    return result.tokens;
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

    const scopes = normalizeCredentialScopes(input.scopes);
    const tokenSummary = await this.prisma.apiToken.create({
      data: {
        expiresAt,
        name,
        scopes,
        tokenHash: this.authTokenService.hashToken(token),
        userId: input.user.id,
      },
      select: apiTokenSelect(),
    });
    await this.auditService.recordSecurityEvent({
      action: 'API_TOKEN_CREATED',
      actorId: input.user.id,
      metadata: {
        expiresAt: expiresAt?.toISOString() ?? null,
        scopes,
        tokenId: tokenSummary.id,
        tokenName: tokenSummary.name,
      },
      targetUserId: input.user.id,
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

    const token = await this.prisma.apiToken.findUniqueOrThrow({
      select: apiTokenSelect(),
      where: { id: tokenId },
    });
    await this.auditService.recordSecurityEvent({
      action: 'API_TOKEN_REVOKED',
      actorId: userId,
      metadata: {
        tokenId: token.id,
        tokenName: token.name,
      },
      targetUserId: userId,
    });

    return token;
  }
}

interface SecurityAuditRecorder {
  recordSecurityEvent: AuditService['recordSecurityEvent'];
}

const noopAuditService = {
  recordSecurityEvent: () => Promise.resolve(),
} satisfies SecurityAuditRecorder;

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

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}
