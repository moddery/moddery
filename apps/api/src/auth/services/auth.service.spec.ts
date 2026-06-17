import { describe, expect, test } from 'bun:test';
import { hash } from 'bcryptjs';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { type AuthTokenService } from './auth-token.service.js';
import { AuthService } from './auth.service.js';

describe(AuthService.name, () => {
  test('loads active viewer sessions by default', async () => {
    const queries: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      {
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
      } as unknown as PrismaService,
    );

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
    const service = new AuthService(
      {} as AuthTokenService,
      {
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
      } as unknown as PrismaService,
    );

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
    const service = new AuthService(
      {} as AuthTokenService,
      {
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
      } as unknown as PrismaService,
    );

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
    const service = new AuthService(
      {} as AuthTokenService,
      {
        session: {
          count: () => Promise.resolve(2),
          findMany: () =>
            Promise.resolve([
              sessionRow({ id: 'session-a' }),
              sessionRow({ id: 'session-b' }),
            ]),
        },
      } as unknown as PrismaService,
    );

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
