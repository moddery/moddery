import { describe, expect, test } from 'bun:test';

import { type AuthTokenService } from '../../auth/services/auth-token.service.js';
import { type PrismaService } from '../../prisma/prisma.service.js';
import { DeveloperService } from './developer.service.js';

describe(DeveloperService.name, () => {
  const authTokenService = {
    hashToken: (token: string) => `hash:${token}`,
  } as AuthTokenService;

  test('creates viewer applications with normalized redirect URIs', async () => {
    const creates: unknown[] = [];
    const service = new DeveloperService(authTokenService, {
      oAuthClient: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve(oauthClientRow());
        },
      },
    } as unknown as PrismaService);

    const created = await service.createViewerOAuthClient({
      input: {
        description: '  Test app  ',
        homepageUrl: ' https://example.com ',
        name: '  CLI tool  ',
        redirectUris: [
          ' http://localhost:3000/callback ',
          'http://localhost:3000/callback',
        ],
        scopes: [' write:projects ', 'read:projects'],
      },
      ownerId: 'user-a',
    });

    expect(created.clientSecret).toStartWith('mdy_secret_');
    expect(creates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          description: 'Test app',
          homepageUrl: 'https://example.com',
          name: 'CLI tool',
          ownerId: 'user-a',
          redirectUris: {
            create: [{ uri: 'http://localhost:3000/callback' }],
          },
          scopes: ['read:projects', 'write:projects'],
        }),
      }),
    );
  });

  test('rejects invalid redirect URIs', async () => {
    const service = new DeveloperService(authTokenService, {
      oAuthClient: {
        create: () => Promise.resolve(oauthClientRow()),
      },
    } as unknown as PrismaService);
    let thrown: unknown;

    try {
      await service.createViewerOAuthClient({
        input: {
          name: 'Bad app',
          redirectUris: ['ftp://example.com/callback'],
        },
        ownerId: 'user-a',
      });
    } catch (caught) {
      thrown = caught;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe(
      'Redirect URIs must use http or https',
    );
  });

  test('revokes viewer-owned applications', async () => {
    const updates: unknown[] = [];
    const service = new DeveloperService(authTokenService, {
      oAuthClient: {
        findUniqueOrThrow: () =>
          Promise.resolve(
            oauthClientRow({ revokedAt: new Date('2026-01-01T00:00:00.000Z') }),
          ),
        updateMany: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({ count: 1 });
        },
      },
    } as unknown as PrismaService);

    const client = await service.revokeViewerOAuthClient({
      clientId: 'client-a',
      ownerId: 'user-a',
    });

    expect(updates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          revokedAt: expect.any(Date),
          status: 'REVOKED',
        }),
        where: {
          id: 'client-a',
          ownerId: 'user-a',
        },
      }),
    );
    expect(client.revokedAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});

function oauthClientRow({
  revokedAt = null,
}: { revokedAt?: Date | null } = {}) {
  return {
    clientId: 'mdy_client_test',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    description: 'Test app',
    homepageUrl: 'https://example.com',
    id: 'client-a',
    name: 'CLI tool',
    redirectUris: [
      {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        id: 'redirect-a',
        uri: 'http://localhost:3000/callback',
      },
    ],
    revokedAt,
    scopes: ['read:projects'],
    status: revokedAt === null ? 'ACTIVE' : 'REVOKED',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}
