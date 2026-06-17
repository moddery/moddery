import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomUUID } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type LoginInput } from '../dto/login.input.js';
import { type RegisterInput } from '../dto/register.input.js';
import {
  AuthTokenService,
  type AuthenticatedUser,
} from './auth-token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async login(input: LoginInput, metadata: AuthRequestMetadata = {}) {
    const identifier = input.identifier.trim();
    const user = await this.prisma.user.findFirst({
      include: { passwordCredential: true },
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    if (
      user?.passwordCredential === undefined ||
      user.passwordCredential === null
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await compare(
      input.password,
      user.passwordCredential.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthPayload(
      {
        id: user.id,
        role: user.role,
        username: user.username,
      },
      metadata,
    );
  }

  async register(input: RegisterInput, metadata: AuthRequestMetadata = {}) {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email },
        ],
      },
    });

    if (existing !== null) {
      throw new ConflictException('Username or email is already in use');
    }

    const passwordHash = await hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        displayName: input.displayName?.trim(),
        email,
        passwordCredential: {
          create: { passwordHash },
        },
        username,
      },
    });

    return this.createAuthPayload(
      {
        id: user.id,
        role: user.role,
        username: user.username,
      },
      metadata,
    );
  }

  private async createAuthPayload(
    user: AuthenticatedUser,
    metadata: AuthRequestMetadata,
  ) {
    const expiresAt = new Date(
      Date.now() + this.authTokenService.accessTokenTtlSeconds() * 1000,
    );
    const session = await this.prisma.session.create({
      data: {
        expiresAt,
        ipHash: metadata.ipAddress ? hashIpAddress(metadata.ipAddress) : null,
        tokenHash: `pending:${randomUUID()}`,
        userAgent: metadata.userAgent ?? null,
        userId: user.id,
      },
      select: { id: true },
    });
    const accessToken = await this.authTokenService.signSessionAccessToken({
      ...user,
      sessionId: session.id,
    });

    await this.prisma.session.update({
      data: { tokenHash: this.authTokenService.hashToken(accessToken) },
      where: { id: session.id },
    });

    return {
      accessToken,
      expiresIn: this.authTokenService.accessTokenTtlSeconds(),
      tokenType: 'Bearer' as const,
      user: {
        ...user,
        displayName: null,
        isAdmin: user.role === 'ADMIN',
      },
    };
  }

  findViewerSessions(userId: string) {
    return this.prisma.session.findMany({
      orderBy: [{ revokedAt: 'asc' }, { lastUsedAt: 'desc' }],
      select: sessionSelect(),
      where: { userId },
    });
  }

  async revokeViewerSession({
    sessionId,
    userId,
  }: {
    sessionId: string;
    userId: string;
  }) {
    const update = await this.prisma.session.updateMany({
      data: { revokedAt: new Date() },
      where: {
        id: sessionId,
        userId,
      },
    });

    if (update.count === 0) {
      throw new UnauthorizedException('Session not found');
    }

    return this.prisma.session.findUniqueOrThrow({
      select: sessionSelect(),
      where: { id: sessionId },
    });
  }
}

export interface AuthRequestMetadata {
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
}

function hashIpAddress(ipAddress: string): string {
  return createHash('sha256').update(ipAddress).digest('hex');
}

function sessionSelect() {
  return {
    createdAt: true,
    expiresAt: true,
    id: true,
    lastUsedAt: true,
    revokedAt: true,
    userAgent: true,
  };
}
