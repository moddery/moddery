import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { AuthTokenService } from '../../auth/services/auth-token.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type CreateOAuthClientInput } from '../dto/create-oauth-client.input.js';

const clientIdPrefix = 'mdy_client';
const clientSecretPrefix = 'mdy_secret';

@Injectable()
export class DeveloperService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  findViewerOAuthClients(userId: string) {
    return this.prisma.oAuthClient.findMany({
      orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
      select: oauthClientSelect(),
      where: { ownerId: userId },
    });
  }

  async createViewerOAuthClient({
    input,
    ownerId,
  }: {
    input: CreateOAuthClientInput;
    ownerId: string;
  }) {
    const name = requiredTrim(input.name, 'Application name is required');
    const redirectUris = sanitizeRedirectUris(input.redirectUris);
    const clientId = `${clientIdPrefix}_${randomBytes(16).toString('base64url')}`;
    const clientSecret = `${clientSecretPrefix}_${randomBytes(32).toString('base64url')}`;

    const client = await this.prisma.oAuthClient.create({
      data: {
        clientId,
        clientSecretHash: this.authTokenService.hashToken(clientSecret),
        description: nullableTrim(input.description),
        homepageUrl: nullableTrim(input.homepageUrl),
        name,
        ownerId,
        redirectUris: {
          create: redirectUris.map((uri) => ({ uri })),
        },
        scopes: sanitizeScopes(input.scopes),
      },
      select: oauthClientSelect(),
    });

    return { client, clientSecret };
  }

  async revokeViewerOAuthClient({
    clientId,
    ownerId,
  }: {
    clientId: string;
    ownerId: string;
  }) {
    const update = await this.prisma.oAuthClient.updateMany({
      data: {
        revokedAt: new Date(),
        status: 'REVOKED',
      },
      where: {
        id: clientId,
        ownerId,
      },
    });

    if (update.count === 0) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.oAuthClient.findUniqueOrThrow({
      select: oauthClientSelect(),
      where: { id: clientId },
    });
  }
}

function oauthClientSelect() {
  return {
    clientId: true,
    createdAt: true,
    description: true,
    homepageUrl: true,
    id: true,
    name: true,
    redirectUris: {
      orderBy: [{ createdAt: 'asc' as const }],
      select: {
        createdAt: true,
        id: true,
        uri: true,
      },
    },
    revokedAt: true,
    scopes: true,
    status: true,
    updatedAt: true,
  };
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredTrim(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

function sanitizeRedirectUris(redirectUris: readonly string[]): string[] {
  const sanitized = [...new Set(redirectUris.map((uri) => uri.trim()))].filter(
    Boolean,
  );

  if (sanitized.length === 0) {
    throw new BadRequestException('At least one redirect URI is required');
  }

  for (const uri of sanitized) {
    let parsed: URL;
    try {
      parsed = new URL(uri);
    } catch {
      throw new BadRequestException('Redirect URIs must be valid URLs');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException('Redirect URIs must use http or https');
    }
  }

  return sanitized.sort();
}

function sanitizeScopes(
  scopes: readonly string[] | null | undefined,
): string[] {
  return [...new Set(scopes ?? [])]
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0)
    .sort();
}
