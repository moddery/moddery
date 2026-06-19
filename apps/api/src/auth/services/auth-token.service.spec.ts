import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, test } from 'bun:test';

import { AuthTokenService } from './auth-token.service.js';

describe(AuthTokenService.name, () => {
  test('signs and verifies access tokens', async () => {
    const config = new ConfigService({
      app: {
        jwtAccessTokenSecret:
          'test-access-token-secret-at-least-thirty-two-chars',
        jwtAccessTokenTtlSeconds: 900,
      },
    });
    const service = new AuthTokenService(config, new JwtService(), {
      apiToken: {},
    } as never);
    const token = await service.signAccessToken({
      id: 'user_123',
      role: 'USER',
      username: 'tester',
    });

    const verified = await service.verifyAccessToken(token);

    expect(verified).toEqual({
      authMethod: 'session',
      id: 'user_123',
      role: 'USER',
      username: 'tester',
    });
  });

  test('verifies bearer access tokens against active sessions', async () => {
    const config = new ConfigService({
      app: {
        jwtAccessTokenSecret:
          'test-access-token-secret-at-least-thirty-two-chars',
        jwtAccessTokenTtlSeconds: 900,
      },
    });
    const updates: unknown[] = [];
    const service = new AuthTokenService(config, new JwtService(), {
      session: {
        findFirst: () =>
          Promise.resolve({
            id: 'session-a',
            user: {
              id: 'user_123',
              role: 'USER',
              status: 'ACTIVE',
              username: 'tester',
            },
          }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as never);
    const token = await service.signSessionAccessToken({
      id: 'user_123',
      role: 'USER',
      sessionId: 'session-a',
      username: 'tester',
    });

    const verified = await service.verifyBearerToken(token);

    expect(verified).toEqual({
      authMethod: 'session',
      id: 'user_123',
      role: 'USER',
      username: 'tester',
    });
    expect(updates[0]).toEqual({
      data: { lastUsedAt: expect.any(Date) },
      where: { id: 'session-a' },
    });
  });

  test('verifies bearer tokens against active personal access tokens', async () => {
    const config = new ConfigService({
      app: {
        jwtAccessTokenSecret:
          'test-access-token-secret-at-least-thirty-two-chars',
        jwtAccessTokenTtlSeconds: 900,
      },
    });
    const updates: unknown[] = [];
    const service = new AuthTokenService(config, new JwtService(), {
      apiToken: {
        findFirst: () =>
          Promise.resolve({
            id: 'token-a',
            scopes: ['read:projects'],
            user: {
              id: 'user_123',
              role: 'USER',
              status: 'ACTIVE',
              username: 'tester',
            },
          }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
      session: {
        findFirst: () => Promise.resolve(null),
      },
    } as never);

    const verified = await service.verifyBearerToken('mdy_pat_test');

    expect(verified).toEqual({
      authMethod: 'api_token',
      credentialScopes: ['read:projects'],
      id: 'user_123',
      role: 'USER',
      username: 'tester',
    });
    expect(updates[0]).toEqual({
      data: { lastUsedAt: expect.any(Date) },
      where: { id: 'token-a' },
    });
  });
});
