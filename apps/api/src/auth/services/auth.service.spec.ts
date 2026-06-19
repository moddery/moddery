import { describe, expect, test } from 'bun:test';
import { hash } from 'bcryptjs';

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
      limit: 1,
      offset: 4,
    });

    expect(result.totalHits).toBe(12);
    expect(result.sessions.map((session) => session.id)).toEqual(['session-b']);
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
  });

  test('stores request metadata when creating login sessions', async () => {
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
              username: 'seed',
            }),
        },
      } as unknown as PrismaService,
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
  });

  test('requests password reset without revealing unknown accounts', async () => {
    const sent: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      fakeMailService(sent),
      {
        passwordResetToken: {
          create: (query: unknown) => {
            sent.push({ tokenCreate: query });
            return Promise.resolve({});
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
    expect(sent).toHaveLength(2);
    expect(sent[0]).toEqual({
      tokenCreate: {
        data: {
          expiresAt: expect.any(Date),
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
          userId: 'user-a',
        },
      },
    });
    expect(sent[1]).toEqual(
      expect.objectContaining({
        subject: 'Reset your Moddery password',
        to: 'seed@example.test',
      }),
    );
  });

  test('confirms password reset once and revokes sessions', async () => {
    const operations: unknown[] = [];
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
      $transaction: async (queries: Promise<unknown>[]) => {
        operations.push(...(await Promise.all(queries)));
        return Promise.resolve([]);
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
        updateMany: (query: unknown) => Promise.resolve({ query }),
      },
    } as unknown as PrismaService);

    const result = await service.confirmPasswordReset({
      newPassword: 'new-correct-password',
      token: 'reset-token',
    });

    expect(result).toBe(true);
    expect(operations).toHaveLength(3);
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

  test('confirms email verification for the matching current email', async () => {
    const operations: unknown[] = [];
    const service = new AuthService({} as AuthTokenService, fakeMailService(), {
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
    } as unknown as PrismaService);

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
  });
});

const passwordHashFixture = await hash('correct-password', 4);

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
