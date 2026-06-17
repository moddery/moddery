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
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([]);
          },
        },
      } as unknown as PrismaService,
    );

    await service.findViewerSessions('user-a');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          revokedAt: null,
          userId: 'user-a',
        },
      }),
    );
  });

  test('loads revoked viewer sessions when requested', async () => {
    const queries: unknown[] = [];
    const service = new AuthService(
      {} as AuthTokenService,
      {
        session: {
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([]);
          },
        },
      } as unknown as PrismaService,
    );

    await service.findViewerSessions('user-a', { includeRevoked: true });

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          userId: 'user-a',
        },
      }),
    );
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
