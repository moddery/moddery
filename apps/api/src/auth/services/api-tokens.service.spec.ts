import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { type AuthTokenService } from './auth-token.service.js';
import { ApiTokensService } from './api-tokens.service.js';

describe(ApiTokensService.name, () => {
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
