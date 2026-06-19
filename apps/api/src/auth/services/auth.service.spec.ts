import { describe, expect, test } from 'bun:test';
import { hash } from 'bcryptjs';
import { createHmac } from 'node:crypto';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { type AuthTokenService } from './auth-token.service.js';
import { AuthService } from './auth.service.js';

describe(AuthService.name, () => {
  test('loads active viewer sessions by default', async () => {
    const queries: unknown[] = [];
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
      session: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(3);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerSessions('user-a');

    expect(result.totalHits).toBe(3);
    expect(queries).toEqual([
      {
        count: {
          where: {
            revokedAt: null,
            userId: 'user-a',
          },
        },
      },
      {
        findMany: expect.objectContaining({
          skip: 0,
          take: 20,
          where: {
            revokedAt: null,
            userId: 'user-a',
          },
        }),
      },
    ]);
  });

  test('loads viewer sessions with pagination', async () => {
    const queries: unknown[] = [];
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
      session: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(12);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([sessionRow({ id: 'session-b' })]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerSessions('user-a', {
      currentSessionId: 'session-b',
      limit: 1,
      offset: 4,
    });

    expect(result.totalHits).toBe(12);
    expect(result.sessions.map((session) => session.id)).toEqual(['session-b']);
    expect(result.sessions[0]?.isCurrent).toBe(true);
    expect(queries[1]).toEqual({
      findMany: expect.objectContaining({
        orderBy: [{ revokedAt: 'asc' }, { lastUsedAt: 'desc' }],
        skip: 4,
        take: 1,
        where: {
          revokedAt: null,
          userId: 'user-a',
        },
      }),
    });
  });

  test('loads revoked viewer sessions when requested', async () => {
    const queries: unknown[] = [];
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
      session: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(2);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([]);
        },
      },
    } as unknown as PrismaService);

    await service.findViewerSessions('user-a', { includeRevoked: true });

    expect(queries[0]).toEqual({
      count: {
        where: {
          userId: 'user-a',
        },
      },
    });
    expect(queries[1]).toEqual({
      findMany: expect.objectContaining({
        where: {
          userId: 'user-a',
        },
      }),
    });
  });

  test('loads the legacy viewer session list from search results', async () => {
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
      session: {
        count: () => Promise.resolve(2),
        findMany: () =>
          Promise.resolve([
            sessionRow({ id: 'session-a' }),
            sessionRow({ id: 'session-b' }),
          ]),
      },
    } as unknown as PrismaService);

    const sessions = await service.findViewerSessionList('user-a');

    expect(sessions.map((session) => session.id)).toEqual([
      'session-a',
      'session-b',
    ]);
    expect(sessions.map((session) => session.isCurrent)).toEqual([
      false,
      false,
    ]);
  });

  test('stores request metadata when creating login sessions', async () => {
    const auditEvents: unknown[] = [];
    const userQueries: unknown[] = [];
    const sessions: unknown[] = [];
    const service = new AuthService(
      {
        accessTokenTtlSeconds: () => 900,
        hashToken: (token: string) => `hash:${token}`,
        signSessionAccessToken: () => Promise.resolve('session-token'),
      } as unknown as AuthTokenService,
      fakeMailService(),
      {
        session: {
          create: (query: unknown) => {
            sessions.push(query);
            return Promise.resolve({ id: 'session-a' });
          },
          update: (query: unknown) => {
            sessions.push(query);
            return Promise.resolve({});
          },
        },
        user: {
          findFirst: (query: unknown) => {
            userQueries.push(query);
            return Promise.resolve({
              id: 'user-a',
              passwordCredential: {
                passwordHash: passwordHashFixture,
              },
              role: 'USER',
              username: 'seed',
            });
          },
        },
      } as unknown as PrismaService,
      fakeAuditService(auditEvents),
    );

    const payload = await service.login(
      {
        identifier: 'seed',
        password: 'correct-password',
      },
      {
        ipAddress: '203.0.113.42',
        userAgent: 'Mozilla/5.0 Test Browser',
      },
    );

    expect(payload.accessToken).toBe('session-token');
    expect(userQueries[0]).toEqual({
      include: { passwordCredential: true, totpSecret: true },
      where: {
        OR: [
          { username: { equals: 'seed', mode: 'insensitive' } },
          { email: { equals: 'seed', mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
      },
    });
    expect(sessions[0]).toEqual({
      data: {
        expiresAt: expect.any(Date),
        ipHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        tokenHash: expect.stringMatching(/^pending:/),
        userAgent: 'Mozilla/5.0 Test Browser',
        userId: 'user-a',
      },
      select: { id: true },
    });
    expect(sessions[1]).toEqual({
      data: { tokenHash: 'hash:session-token' },
      where: { id: 'session-a' },
    });
    expect(auditEvents[0]).toEqual({
      action: 'SESSION_CREATED',
      actorId: 'user-a',
      metadata: {
        sessionId: 'session-a',
        userAgent: 'Mozilla/5.0 Test Browser',
      },
      targetUserId: 'user-a',
    });
  });

  test('rejects enabled two-factor login without a valid code', async () => {
    const service = new AuthService(
      {
        accessTokenTtlSeconds: () => 900,
        hashToken: (token: string) => `hash:${token}`,
        signSessionAccessToken: () => Promise.resolve('session-token'),
      } as unknown as AuthTokenService,
      fakeMailService(),
      {
        user: {
          findFirst: () =>
            Promise.resolve({
              id: 'user-a',
              passwordCredential: {
                passwordHash: passwordHashFixture,
              },
              role: 'USER',
              totpSecret: {
                confirmedAt: new Date('2026-01-01T00:00:00.000Z'),
                secret: totpSecretFixture,
              },
              twoFactorEnabled: true,
              username: 'seed',
            }),
        },
      } as unknown as PrismaService,
    );

    try {
      await service.login({
        identifier: 'seed',
        password: 'correct-password',
      });
      throw new Error('Expected two-factor login to fail');
    } catch (caught) {
      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain('Invalid two-factor code');
    }
  });

  test('accepts enabled two-factor login with a valid code', async () => {
    const sessions: unknown[] = [];
    const service = new AuthService(
      {
        accessTokenTtlSeconds: () => 900,
        hashToken: (token: string) => `hash:${token}`,
        signSessionAccessToken: () => Promise.resolve('session-token'),
      } as unknown as AuthTokenService,
      fakeMailService(),
      {
        session: {
          create: (query: unknown) => {
            sessions.push(query);
            return Promise.resolve({ id: 'session-a' });
          },
          update: (query: unknown) => {
            sessions.push(query);
            return Promise.resolve({});
          },
        },
        user: {
          findFirst: () =>
            Promise.resolve({
              id: 'user-a',
              passwordCredential: {
                passwordHash: passwordHashFixture,
              },
              role: 'USER',
              totpSecret: {
                confirmedAt: new Date('2026-01-01T00:00:00.000Z'),
                secret: totpSecretFixture,
              },
              twoFactorEnabled: true,
              username: 'seed',
            }),
        },
      } as unknown as PrismaService,
    );

    const payload = await service.login({
      identifier: 'seed',
      password: 'correct-password',
      twoFactorCode: currentTotpCode(totpSecretFixture),
    });

    expect(payload.accessToken).toBe('session-token');
    expect(sessions).toHaveLength(2);
  });

  test('sets up two-factor authentication with a fresh secret', async () => {
    const writes: unknown[] = [];
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
      userTotpSecret: {
        upsert: (query: unknown) => {
          writes.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const setup = await service.setupTwoFactor({
      id: 'user-a',
      role: 'USER',
      username: 'seed',
    });

    expect(setup.secret).toMatch(/^[A-Z2-7]+$/);
    expect(setup.otpAuthUrl).toContain('otpauth://totp/Moddery:seed');
    expect(writes[0]).toEqual({
      create: {
        secret: setup.secret,
        userId: 'user-a',
      },
      update: {
        confirmedAt: null,
        secret: setup.secret,
      },
      where: { userId: 'user-a' },
    });
  });

  test('enables two-factor authentication with a valid code', async () => {
    const auditEvents: unknown[] = [];
    const operations: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(),
      {
        $transaction: async (queries: Promise<unknown>[]) => {
          operations.push(...(await Promise.all(queries)));
          return Promise.resolve([]);
        },
        user: {
          update: (query: unknown) => Promise.resolve({ query }),
        },
        userTotpSecret: {
          findUnique: () => Promise.resolve({ secret: totpSecretFixture }),
          update: (query: unknown) => Promise.resolve({ query }),
        },
      } as unknown as PrismaService,
      fakeAuditService(auditEvents),
    );

    const result = await service.enableTwoFactor(
      'user-a',
      currentTotpCode(totpSecretFixture),
    );

    expect(result).toBe(true);
    expect(operations).toHaveLength(2);
    expect(operations[1]).toEqual({
      query: {
        data: { twoFactorEnabled: true },
        where: { id: 'user-a' },
      },
    });
    expect(auditEvents[0]).toEqual({
      action: 'TWO_FACTOR_ENABLED',
      actorId: 'user-a',
      targetUserId: 'user-a',
    });
  });

  test('disables two-factor authentication with a valid code', async () => {
    const auditEvents: unknown[] = [];
    const operations: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(),
      {
        $transaction: async (queries: Promise<unknown>[]) => {
          operations.push(...(await Promise.all(queries)));
          return Promise.resolve([]);
        },
        user: {
          update: (query: unknown) => Promise.resolve({ query }),
        },
        userTotpSecret: {
          delete: (query: unknown) => Promise.resolve({ query }),
          findUnique: () => Promise.resolve({ secret: totpSecretFixture }),
        },
      } as unknown as PrismaService,
      fakeAuditService(auditEvents),
    );

    const result = await service.disableTwoFactor(
      'user-a',
      currentTotpCode(totpSecretFixture),
    );

    expect(result).toBe(true);
    expect(operations).toEqual([
      { query: { where: { userId: 'user-a' } } },
      {
        query: {
          data: { twoFactorEnabled: false },
          where: { id: 'user-a' },
        },
      },
    ]);
    expect(auditEvents[0]).toEqual({
      action: 'TWO_FACTOR_DISABLED',
      actorId: 'user-a',
      targetUserId: 'user-a',
    });
  });

  test('requests password reset without revealing unknown accounts', async () => {
    const sent: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(sent),
      {
        $transaction: async (queries: Promise<unknown>[]) =>
          Promise.all(queries),
        passwordResetToken: {
          create: (query: unknown) => {
            sent.push({ tokenCreate: query });
            return Promise.resolve({});
          },
          updateMany: (query: unknown) => {
            sent.push({ tokenInvalidate: query });
            return Promise.resolve({ count: 1 });
          },
        },
        user: {
          findFirst: () =>
            Promise.resolve({
              email: 'seed@example.test',
              id: 'user-a',
              username: 'seed',
            }),
        },
      } as unknown as PrismaService,
    );

    const result = await service.requestPasswordReset({
      identifier: 'seed@example.test',
    });

    expect(result).toBe(true);
    expect(sent).toHaveLength(3);
    expect(sent[0]).toEqual({
      tokenInvalidate: {
        data: { usedAt: expect.any(Date) },
        where: {
          expiresAt: { gt: expect.any(Date) },
          usedAt: null,
          userId: 'user-a',
        },
      },
    });
    expect(sent[1]).toEqual({
      tokenCreate: {
        data: {
          expiresAt: expect.any(Date),
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
          userId: 'user-a',
        },
      },
    });
    expect(sent[2]).toEqual(
      expect.objectContaining({
        subject: 'Reset your Moddery password',
        to: 'seed@example.test',
      }),
    );
  });

  test('confirms password reset once and revokes sessions and API tokens', async () => {
    const auditEvents: unknown[] = [];
    const operations: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(),
      {
        $transaction: async (queries: Promise<unknown>[]) => {
          const result = await Promise.all(queries);
          operations.push(...result);
          return result;
        },
        apiToken: {
          updateMany: (query: unknown) => Promise.resolve({ count: 1, query }),
        },
        passwordCredential: {
          upsert: (query: unknown) => Promise.resolve({ query }),
        },
        passwordResetToken: {
          findFirst: () =>
            Promise.resolve({
              expiresAt: new Date(Date.now() + 60_000),
              id: 'reset-a',
              usedAt: null,
              userId: 'user-a',
            }),
          update: (query: unknown) => Promise.resolve({ query }),
        },
        session: {
          updateMany: (query: unknown) => Promise.resolve({ count: 2, query }),
        },
      } as unknown as PrismaService,
      fakeAuditService(auditEvents),
    );

    const result = await service.confirmPasswordReset({
      newPassword: 'new-correct-password',
      token: 'reset-token',
    });

    expect(result).toBe(true);
    expect(operations).toHaveLength(4);
    expect(operations[0]).toEqual({
      query: expect.objectContaining({
        where: { userId: 'user-a' },
      }),
    });
    expect(operations[1]).toEqual({
      query: expect.objectContaining({
        data: { usedAt: expect.any(Date) },
        where: { id: 'reset-a' },
      }),
    });
    expect(operations[2]).toEqual({
      query: expect.objectContaining({
        where: {
          revokedAt: null,
          userId: 'user-a',
        },
      }),
      count: 2,
    });
    expect(operations[3]).toEqual({
      query: expect.objectContaining({
        where: {
          revokedAt: null,
          userId: 'user-a',
        },
      }),
      count: 1,
    });
    expect(auditEvents[0]).toEqual({
      action: 'PASSWORD_RESET_CONFIRMED',
      metadata: {
        revokedApiTokens: 1,
        revokedSessions: 2,
      },
      targetUserId: 'user-a',
    });
  });

  test('revokes viewer sessions and records an audit event', async () => {
    const auditEvents: unknown[] = [];
    const updates: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(),
      {
        session: {
          findUniqueOrThrow: () =>
            Promise.resolve(sessionRow({ id: 'session-a' })),
          updateMany: (query: unknown) => {
            updates.push(query);
            return Promise.resolve({ count: 1 });
          },
        },
      } as unknown as PrismaService,
      fakeAuditService(auditEvents),
    );

    const session = await service.revokeViewerSession({
      currentSessionId: 'session-a',
      sessionId: 'session-a',
      userId: 'user-a',
    });

    expect(session.id).toBe('session-a');
    expect(session.isCurrent).toBe(true);
    expect(updates[0]).toEqual(
      expect.objectContaining({
        data: { revokedAt: expect.any(Date) },
        where: {
          id: 'session-a',
          userId: 'user-a',
        },
      }),
    );
    expect(auditEvents[0]).toEqual({
      action: 'SESSION_REVOKED',
      actorId: 'user-a',
      metadata: { sessionId: 'session-a' },
      targetUserId: 'user-a',
    });
  });

  test('requests email verification for unverified viewer email', async () => {
    const sent: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(sent),
      {
        emailVerificationToken: {
          create: (query: unknown) => {
            sent.push({ tokenCreate: query });
            return Promise.resolve({});
          },
          findFirst: () => Promise.resolve(null),
        },
        user: {
          findUnique: () =>
            Promise.resolve({
              email: 'seed@example.test',
              emailVerifiedAt: null,
              id: 'user-a',
              username: 'seed',
            }),
        },
      } as unknown as PrismaService,
    );

    const result = await service.requestEmailVerification('user-a');

    expect(result).toBe(true);
    expect(sent).toHaveLength(2);
    expect(sent[0]).toEqual({
      tokenCreate: {
        data: {
          email: 'seed@example.test',
          expiresAt: expect.any(Date),
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
          userId: 'user-a',
        },
      },
    });
    expect(sent[1]).toEqual(
      expect.objectContaining({
        subject: 'Verify your Moddery email',
        to: 'seed@example.test',
      }),
    );
  });

  test('does not resend email verification while an unused token is active', async () => {
    const sent: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(sent),
      {
        emailVerificationToken: {
          create: () => {
            throw new Error('Token should not be created');
          },
          findFirst: (query: unknown) => {
            sent.push({ tokenFind: query });
            return Promise.resolve({ id: 'verify-existing' });
          },
        },
        user: {
          findUnique: () =>
            Promise.resolve({
              email: 'seed@example.test',
              emailVerifiedAt: null,
              id: 'user-a',
              username: 'seed',
            }),
        },
      } as unknown as PrismaService,
    );

    const result = await service.requestEmailVerification('user-a');

    expect(result).toBe(true);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toEqual({
      tokenFind: {
        select: { id: true },
        where: {
          email: 'seed@example.test',
          expiresAt: { gt: expect.any(Date) },
          usedAt: null,
          userId: 'user-a',
        },
      },
    });
  });

  test('confirms email verification for the matching current email', async () => {
    const auditEvents: unknown[] = [];
    const operations: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(),
      {
        $transaction: async (queries: Promise<unknown>[]) => {
          operations.push(...(await Promise.all(queries)));
          return Promise.resolve([]);
        },
        emailVerificationToken: {
          findFirst: () =>
            Promise.resolve({
              email: 'seed@example.test',
              expiresAt: new Date(Date.now() + 60_000),
              id: 'verify-a',
              usedAt: null,
              user: { email: 'seed@example.test' },
              userId: 'user-a',
            }),
          update: (query: unknown) => Promise.resolve({ query }),
        },
        user: {
          update: (query: unknown) => Promise.resolve({ query }),
        },
      } as unknown as PrismaService,
      fakeAuditService(auditEvents),
    );

    const result = await service.confirmEmailVerification({
      token: 'verify-token',
    });

    expect(result).toBe(true);
    expect(operations).toHaveLength(2);
    expect(operations[0]).toEqual({
      query: expect.objectContaining({
        data: { emailVerifiedAt: expect.any(Date) },
        where: { id: 'user-a' },
      }),
    });
    expect(operations[1]).toEqual({
      query: expect.objectContaining({
        data: { usedAt: expect.any(Date) },
        where: { id: 'verify-a' },
      }),
    });
    expect(auditEvents[0]).toEqual({
      action: 'EMAIL_VERIFICATION_CONFIRMED',
      targetUserId: 'user-a',
    });
  });
});

const passwordHashFixture = await hash('correct-password', 4);
const totpSecretFixture = 'JBSWY3DPEHPK3PXP';

function sessionRow({ id }: { id: string }) {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    expiresAt: new Date('2026-01-08T00:00:00.000Z'),
    id,
    lastUsedAt: new Date('2026-01-02T00:00:00.000Z'),
    revokedAt: null,
    userAgent: 'Test Browser',
  };
}

function fakeMailService(sent: unknown[] = []) {
  return {
    send: (message: unknown) => {
      sent.push(message);
      return Promise.resolve();
    },
  } as never;
}

function fakeAuditService(events: unknown[]) {
  return {
    recordSecurityEvent: (event: unknown) => {
      events.push(event);
      return Promise.resolve();
    },
  } as never;
}

function currentTotpCode(secret: string): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
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

function base32Decode(value: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let accumulator = 0;
  const bytes: number[] = [];

  for (const character of value.toUpperCase().replace(/=+$/g, '')) {
    const index = alphabet.indexOf(character);
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
