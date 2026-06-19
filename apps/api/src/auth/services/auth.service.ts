import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { MailService } from '../../mail/mail.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type ConfirmPasswordResetInput } from '../dto/confirm-password-reset.input.js';
import { type LoginInput } from '../dto/login.input.js';
import { type RegisterInput } from '../dto/register.input.js';
import { type RequestPasswordResetInput } from '../dto/request-password-reset.input.js';
import {
  AuthTokenService,
  type AuthenticatedUser,
} from './auth-token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly mailService: MailService,
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

  async requestPasswordReset(
    input: RequestPasswordResetInput,
  ): Promise<boolean> {
    const identifier = input.identifier.trim();
    const user = await this.prisma.user.findFirst({
      select: { email: true, id: true, username: true },
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier.toLowerCase(), mode: 'insensitive' } },
        ],
        passwordCredential: { isNot: null },
        status: 'ACTIVE',
      },
    });

    if (user?.email === undefined || user.email === null) {
      return true;
    }

    const token = randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({
      data: {
        expiresAt: new Date(Date.now() + passwordResetTokenTtlMs),
        tokenHash: hashSecret(token),
        userId: user.id,
      },
    });

    await this.mailService.send({
      subject: 'Reset your Moddery password',
      text: [
        `A password reset was requested for ${user.username}.`,
        '',
        `Reset token: ${token}`,
        '',
        'This token expires in 1 hour. If you did not request this, you can ignore this email.',
      ].join('\n'),
      to: user.email,
    });

    return true;
  }

  async confirmPasswordReset(
    input: ConfirmPasswordResetInput,
  ): Promise<boolean> {
    const tokenHash = hashSecret(input.token.trim());
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      select: { expiresAt: true, id: true, userId: true, usedAt: true },
      where: { tokenHash },
    });

    if (resetToken?.usedAt !== null) {
      throw new UnauthorizedException('Invalid password reset token');
    }

    if (resetToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid password reset token');
    }

    const passwordHash = await hash(input.newPassword, 12);
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.passwordCredential.upsert({
        create: {
          passwordHash,
          userId: resetToken.userId,
        },
        update: {
          passwordChangedAt: now,
          passwordHash,
        },
        where: { userId: resetToken.userId },
      }),
      this.prisma.passwordResetToken.update({
        data: { usedAt: now },
        where: { id: resetToken.id },
      }),
      this.prisma.session.updateMany({
        data: { revokedAt: now },
        where: {
          revokedAt: null,
          userId: resetToken.userId,
        },
      }),
    ]);

    return true;
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

  async findViewerSessions(
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
    const [totalHits, sessions] = await Promise.all([
      this.prisma.session.count({ where }),
      this.prisma.session.findMany({
        orderBy: [{ revokedAt: 'asc' }, { lastUsedAt: 'desc' }],
        select: sessionSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      sessions,
      totalHits,
    };
  }

  async findViewerSessionList(
    userId: string,
    {
      includeRevoked,
    }: {
      includeRevoked?: boolean | null;
    } = {},
  ) {
    const result = await this.findViewerSessions(userId, { includeRevoked });

    return result.sessions;
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

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
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

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

const passwordResetTokenTtlMs = 60 * 60 * 1000;
