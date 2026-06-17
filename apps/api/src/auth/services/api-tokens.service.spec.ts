import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { type AuthTokenService } from './auth-token.service.js';
import { ApiTokensService } from './api-tokens.service.js';

describe(ApiTokensService.name, () => {
  test('loads active viewer tokens by default', async () => {
    const queries: unknown[] = [];
    const service = new ApiTokensService(
      {} as AuthTokenService,
      {
        apiToken: {
          count: (query: unknown) => {
            queries.push({ count: query });
            return Promise.resolve(4);
          },
          findMany: (query: unknown) => {
            queries.push({ findMany: query });
            return Promise.resolve([]);
          },
        },
      } as unknown as PrismaService,
    );

    const result = await service.findViewerTokens('user-a');

    expect(result.totalHits).toBe(4);
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

  test('loads viewer tokens with pagination', async () => {
    const queries: unknown[] = [];
    const service = new ApiTokensService(
      {} as AuthTokenService,
      {
        apiToken: {
          count: (query: unknown) => {
            queries.push({ count: query });
            return Promise.resolve(8);
          },
          findMany: (query: unknown) => {
            queries.push({ findMany: query });
            return Promise.resolve([apiTokenRow({ id: 'token-b' })]);
          },
        },
      } as unknown as PrismaService,
    );

    const result = await service.findViewerTokens('user-a', {
      limit: 1,
      offset: 3,
    });

    expect(result.totalHits).toBe(8);
    expect(result.tokens.map((token) => token.id)).toEqual(['token-b']);
    expect(queries[1]).toEqual({
      findMany: expect.objectContaining({
        orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
        skip: 3,
        take: 1,
        where: {
          revokedAt: null,
          userId: 'user-a',
        },
      }),
    });
  });

  test('loads revoked viewer tokens when requested', async () => {
    const queries: unknown[] = [];
    const service = new ApiTokensService(
      {} as AuthTokenService,
      {
        apiToken: {
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

    await service.findViewerTokens('user-a', { includeRevoked: true });

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

  test('loads the legacy viewer token list from search results', async () => {
    const service = new ApiTokensService(
      {} as AuthTokenService,
      {
        apiToken: {
          count: () => Promise.resolve(2),
          findMany: () =>
            Promise.resolve([
              apiTokenRow({ id: 'token-a' }),
              apiTokenRow({ id: 'token-b' }),
            ]),
        },
      } as unknown as PrismaService,
    );

    const tokens = await service.findViewerTokenList('user-a');

    expect(tokens.map((token) => token.id)).toEqual(['token-a', 'token-b']);
  });

  test('creates viewer tokens and stores only the hash', async () => {
    const creates: unknown[] = [];
    const service = new ApiTokensService(
      {
        hashToken: (token: string) => `hash:${token}`,
      } as AuthTokenService,
      {
        apiToken: {
          create: (query: unknown) => {
            creates.push(query);
            return Promise.resolve({
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              expiresAt: null,
              id: 'token-a',
              lastUsedAt: null,
              name: 'Local automation',
              revokedAt: null,
              scopes: ['read:projects'],
            });
          },
        },
      } as unknown as PrismaService,
    );

    const created = await service.createViewerToken({
      name: '  Local automation  ',
      scopes: ['read:projects', 'read:projects', ''],
      user: {
        id: 'user-a',
        role: 'USER',
        username: 'seed',
      },
    });

    expect(created.token.startsWith('mdy_pat_')).toBe(true);
    expect(creates[0]).toEqual({
      data: {
        expiresAt: null,
        name: 'Local automation',
        scopes: ['read:projects'],
        tokenHash: `hash:${created.token}`,
        userId: 'user-a',
      },
      select: expect.any(Object),
    });
    expect(created.tokenSummary.id).toBe('token-a');
  });

  test('revokes viewer tokens by owner', async () => {
    const updates: unknown[] = [];
    const service = new ApiTokensService(
      {} as AuthTokenService,
      {
        apiToken: {
          findUniqueOrThrow: () =>
            Promise.resolve({
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              expiresAt: null,
              id: 'token-a',
              lastUsedAt: null,
              name: 'Local automation',
              revokedAt: new Date('2026-01-02T00:00:00.000Z'),
              scopes: [],
            }),
          updateMany: (query: unknown) => {
            updates.push(query);
            return Promise.resolve({ count: 1 });
          },
        },
      } as unknown as PrismaService,
    );

    const token = await service.revokeViewerToken({
      tokenId: 'token-a',
      userId: 'user-a',
    });

    expect(updates[0]).toEqual(
      expect.objectContaining({
        data: { revokedAt: expect.any(Date) },
        where: {
          id: 'token-a',
          userId: 'user-a',
        },
      }),
    );
    expect(token.revokedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
  });
});

function apiTokenRow({ id }: { id: string }) {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    expiresAt: null,
    id,
    lastUsedAt: null,
    name: 'Local automation',
    revokedAt: null,
    scopes: ['read:projects'],
  };
}
