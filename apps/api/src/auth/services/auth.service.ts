import {
  ConflictException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';

import { AuditService } from '../../audit/audit.service.js';
import { MailService } from '../../mail/mail.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type ConfirmEmailVerificationInput } from '../dto/confirm-email-verification.input.js';
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
  private readonly auditService: SecurityAuditRecorder;

  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    @Optional() auditService?: SecurityAuditRecorder,
  ) {
    this.auditService = auditService ?? noopAuditService;
  }

  async login(input: LoginInput, metadata: AuthRequestMetadata = {}) {
    const identifier = input.identifier.trim();
    const user = await this.prisma.user.findFirst({
      include: { passwordCredential: true, totpSecret: true },
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
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

    if (user.twoFactorEnabled) {
      const totpSecret =
        user.totpSecret?.confirmedAt === undefined ||
        user.totpSecret.confirmedAt === null
          ? null
          : user.totpSecret.secret;

      if (
        totpSecret === null ||
        !verifyTotp(input.twoFactorCode ?? '', totpSecret)
      ) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
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

    const now = new Date();
    const token = randomBytes(32).toString('base64url');
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        data: { usedAt: now },
        where: {
          expiresAt: { gt: now },
          usedAt: null,
          userId: user.id,
        },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          expiresAt: new Date(now.getTime() + passwordResetTokenTtlMs),
          tokenHash: hashSecret(token),
          userId: user.id,
        },
      }),
    ]);

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

  async setupTwoFactor(user: AuthenticatedUser) {
    const secret = base32Encode(randomBytes(20));
    await this.prisma.userTotpSecret.upsert({
      create: {
        secret,
        userId: user.id,
      },
      update: {
        confirmedAt: null,
        secret,
      },
      where: { userId: user.id },
    });

    return {
      otpAuthUrl: `otpauth://totp/Moddery:${encodeURIComponent(
        user.username,
      )}?secret=${secret}&issuer=Moddery&algorithm=SHA1&digits=6&period=30`,
      secret,
    };
  }

  async enableTwoFactor(userId: string, code: string): Promise<boolean> {
    const totpSecret = await this.prisma.userTotpSecret.findUnique({
      select: { secret: true },
      where: { userId },
    });

    if (totpSecret === null || !verifyTotp(code, totpSecret.secret)) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.userTotpSecret.update({
        data: { confirmedAt: now },
        where: { userId },
      }),
      this.prisma.user.update({
        data: { twoFactorEnabled: true },
        where: { id: userId },
      }),
    ]);
    await this.auditService.recordSecurityEvent({
      action: 'TWO_FACTOR_ENABLED',
      actorId: userId,
      targetUserId: userId,
    });

    return true;
  }

  async disableTwoFactor(userId: string, code: string): Promise<boolean> {
    const totpSecret = await this.prisma.userTotpSecret.findUnique({
      select: { secret: true },
      where: { userId },
    });

    if (totpSecret === null || !verifyTotp(code, totpSecret.secret)) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    await this.prisma.$transaction([
      this.prisma.userTotpSecret.delete({ where: { userId } }),
      this.prisma.user.update({
        data: { twoFactorEnabled: false },
        where: { id: userId },
      }),
    ]);
    await this.auditService.recordSecurityEvent({
      action: 'TWO_FACTOR_DISABLED',
      actorId: userId,
      targetUserId: userId,
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
    const transactionResult = await this.prisma.$transaction([
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
      this.prisma.apiToken.updateMany({
        data: { revokedAt: now },
        where: {
          revokedAt: null,
          userId: resetToken.userId,
        },
      }),
    ]);
    const sessionUpdate = transactionResult[2] as { count?: number };
    const apiTokenUpdate = transactionResult[3] as { count?: number };
    await this.auditService.recordSecurityEvent({
      action: 'PASSWORD_RESET_CONFIRMED',
      metadata: {
        revokedApiTokens: apiTokenUpdate.count ?? 0,
        revokedSessions: sessionUpdate.count ?? 0,
      },
      targetUserId: resetToken.userId,
    });

    return true;
  }

  async requestEmailVerification(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      select: {
        email: true,
        emailVerifiedAt: true,
        id: true,
        username: true,
      },
      where: { id: userId },
    });

    if (user?.email === undefined || user.email === null) {
      return true;
    }

    if (user.emailVerifiedAt !== null) {
      return true;
    }

    const now = new Date();
    const pendingToken = await this.prisma.emailVerificationToken.findFirst({
      select: { id: true },
      where: {
        email: user.email,
        expiresAt: { gt: now },
        usedAt: null,
        userId: user.id,
      },
    });

    if (pendingToken !== null) {
      return true;
    }

    const token = randomBytes(32).toString('base64url');
    await this.prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        expiresAt: new Date(now.getTime() + emailVerificationTokenTtlMs),
        tokenHash: hashSecret(token),
        userId: user.id,
      },
    });

    await this.mailService.send({
      subject: 'Verify your Moddery email',
      text: [
        `Verify the email address for ${user.username}.`,
        '',
        `Verification token: ${token}`,
        '',
        'This token expires in 24 hours. If you did not request this, you can ignore this email.',
      ].join('\n'),
      to: user.email,
    });

    return true;
  }

  async confirmEmailVerification(
    input: ConfirmEmailVerificationInput,
  ): Promise<boolean> {
    const tokenHash = hashSecret(input.token.trim());
    const verificationToken =
      await this.prisma.emailVerificationToken.findFirst({
        select: {
          email: true,
          expiresAt: true,
          id: true,
          usedAt: true,
          user: {
            select: { email: true },
          },
          userId: true,
        },
        where: { tokenHash },
      });

    if (verificationToken?.usedAt !== null) {
      throw new UnauthorizedException('Invalid email verification token');
    }

    if (
      verificationToken.expiresAt <= new Date() ||
      verificationToken.user.email !== verificationToken.email
    ) {
      throw new UnauthorizedException('Invalid email verification token');
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.user.update({
        data: { emailVerifiedAt: now },
        where: { id: verificationToken.userId },
      }),
      this.prisma.emailVerificationToken.update({
        data: { usedAt: now },
        where: { id: verificationToken.id },
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
    await this.auditService.recordSecurityEvent({
      action: 'SESSION_CREATED',
      actorId: user.id,
      metadata: {
        sessionId: session.id,
        userAgent: metadata.userAgent ?? null,
      },
      targetUserId: user.id,
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
      currentSessionId,
      limit = 20,
      offset = 0,
    }: {
      currentSessionId?: string;
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
      sessions: sessions.map((session) =>
        sessionSummaryWithCurrentState(session, currentSessionId),
      ),
      totalHits,
    };
  }

  async findViewerSessionList(
    userId: string,
    {
      includeRevoked,
      currentSessionId,
    }: {
      currentSessionId?: string;
      includeRevoked?: boolean | null;
    } = {},
  ) {
    const result = await this.findViewerSessions(userId, {
      currentSessionId,
      includeRevoked,
    });

    return result.sessions;
  }

  async revokeViewerSession({
    currentSessionId,
    sessionId,
    userId,
  }: {
    currentSessionId?: string;
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

    const session = await this.prisma.session.findUniqueOrThrow({
      select: sessionSelect(),
      where: { id: sessionId },
    });
    await this.auditService.recordSecurityEvent({
      action: 'SESSION_REVOKED',
      actorId: userId,
      metadata: { sessionId },
      targetUserId: userId,
    });

    return sessionSummaryWithCurrentState(session, currentSessionId);
  }
}

interface SecurityAuditRecorder {
  recordSecurityEvent: AuditService['recordSecurityEvent'];
}

const noopAuditService = {
  recordSecurityEvent: () => Promise.resolve(),
} satisfies SecurityAuditRecorder;

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

function verifyTotp(code: string, secret: string): boolean {
  const normalized = code.trim();
  if (!/^[0-9]{6}$/.test(normalized)) {
    return false;
  }

  const counter = Math.floor(Date.now() / totpPeriodMs);
  for (const offset of [-1, 0, 1]) {
    if (totpCode(secret, counter + offset) === normalized) {
      return true;
    }
  }

  return false;
}

function totpCode(secret: string, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', base32Decode(secret))
    .update(counterBuffer)
    .digest();
  const offset = byteAt(digest, digest.length - 1) & 0x0f;
  const binary =
    ((byteAt(digest, offset) & 0x7f) << 24) |
    ((byteAt(digest, offset + 1) & 0xff) << 16) |
    ((byteAt(digest, offset + 2) & 0xff) << 8) |
    (byteAt(digest, offset + 3) & 0xff);

  return (binary % 1_000_000).toString().padStart(6, '0');
}

function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += base32Character((value >>> (bits - 5)) & 31);
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += base32Character((value << (5 - bits)) & 31);
  }

  return output;
}

function base32Decode(value: string): Buffer {
  let bits = 0;
  let accumulator = 0;
  const bytes: number[] = [];

  for (const character of value.toUpperCase().replace(/=+$/g, '')) {
    const index = base32Alphabet.indexOf(character);
    if (index === -1) continue;
    accumulator = (accumulator << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((accumulator >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function byteAt(buffer: Buffer, index: number): number {
  return buffer[index] ?? 0;
}

function base32Character(index: number): string {
  return base32Alphabet[index] ?? '';
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

function sessionSummaryWithCurrentState<T extends { id: string }>(
  session: T,
  currentSessionId: string | undefined,
): T & { isCurrent: boolean } {
  return {
    ...session,
    isCurrent: session.id === currentSessionId,
  };
}

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

const passwordResetTokenTtlMs = 60 * 60 * 1000;
const emailVerificationTokenTtlMs = 24 * 60 * 60 * 1000;
const totpPeriodMs = 30 * 1000;
const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
