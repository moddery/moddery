import { describe, expect, test } from 'bun:test';

import { type AuditService } from '../../audit/audit.service.js';
import { type AuthTokenService } from '../../auth/services/auth-token.service.js';
import { type PrismaService } from '../../prisma/prisma.service.js';
import { DeveloperService } from './developer.service.js';

describe(DeveloperService.name, () => {
  const authTokenService = {
    hashToken: (token: string) => `hash:${token}`,
  } as AuthTokenService;
  const auditService = {
    recordSecurityEvent: () => Promise.resolve(),
  } as unknown as AuditService;

  test('loads viewer applications with pagination', async () => {
    const queries: unknown[] = [];
    const service = new DeveloperService(authTokenService, auditService, {
      oAuthClient: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(7);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([oauthClientRow({ id: 'client-b' })]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerOAuthClients('user-a', {
      limit: 1,
      offset: 2,
    });

    expect(result.totalHits).toBe(7);
    expect(result.clients).toHaveLength(1);
    expect(queries).toEqual([
      {
        count: {
          where: { ownerId: 'user-a' },
        },
      },
      {
        findMany: expect.objectContaining({
          orderBy: [{ revokedAt: 'asc' }, { createdAt: 'desc' }],
          skip: 2,
          take: 1,
          where: { ownerId: 'user-a' },
        }),
      },
    ]);
  });

  test('loads the legacy viewer application list from search results', async () => {
    const service = new DeveloperService(authTokenService, auditService, {
      oAuthClient: {
        count: () => Promise.resolve(2),
        findMany: () =>
          Promise.resolve([
            oauthClientRow({ id: 'client-a' }),
            oauthClientRow({ id: 'client-b' }),
          ]),
      },
    } as unknown as PrismaService);

    const clients = await service.findViewerOAuthClientList('user-a');

    expect(clients.map((client) => client.id)).toEqual([
      'client-a',
      'client-b',
    ]);
  });

  test('creates viewer applications with normalized redirect URIs', async () => {
    const auditEvents: unknown[] = [];
    const creates: unknown[] = [];
    const service = new DeveloperService(
      authTokenService,
      fakeAuditService(auditEvents),
      {
        oAuthClient: {
          create: (query: unknown) => {
            creates.push(query);
            return Promise.resolve(oauthClientRow());
          },
        },
      } as unknown as PrismaService,
    );

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
    expect(auditEvents[0]).toEqual({
      action: 'OAUTH_CLIENT_CREATED',
      actorId: 'user-a',
      metadata: {
        oauthClientId: 'client-a',
        oauthClientName: 'CLI tool',
        scopes: ['read:projects'],
      },
      targetUserId: 'user-a',
    });
    expect(JSON.stringify(auditEvents)).not.toContain(created.clientSecret);
  });

  test('rejects invalid redirect URIs', async () => {
    const service = new DeveloperService(authTokenService, auditService, {
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

  test('rejects unsupported application scopes', async () => {
    const creates: unknown[] = [];
    const service = new DeveloperService(authTokenService, auditService, {
      oAuthClient: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve(oauthClientRow());
        },
      },
    } as unknown as PrismaService);
    let thrown: unknown;

    try {
      await service.createViewerOAuthClient({
        input: {
          name: 'Bad app',
          redirectUris: ['https://example.com/callback'],
          scopes: ['delete:projects'],
        },
        ownerId: 'user-a',
      });
    } catch (caught) {
      thrown = caught;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe(
      'Unsupported credential scope: delete:projects',
    );
    expect(creates).toEqual([]);
  });

  test('revokes viewer-owned applications', async () => {
    const auditEvents: unknown[] = [];
    const updates: unknown[] = [];
    const service = new DeveloperService(
      authTokenService,
      fakeAuditService(auditEvents),
      {
        oAuthClient: {
          findUniqueOrThrow: () =>
            Promise.resolve(
              oauthClientRow({
                revokedAt: new Date('2026-01-01T00:00:00.000Z'),
              }),
            ),
          updateMany: (query: unknown) => {
            updates.push(query);
            return Promise.resolve({ count: 1 });
          },
        },
      } as unknown as PrismaService,
    );

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
    expect(auditEvents[0]).toEqual({
      action: 'OAUTH_CLIENT_REVOKED',
      actorId: 'user-a',
      metadata: {
        oauthClientId: 'client-a',
        oauthClientName: 'CLI tool',
      },
      targetUserId: 'user-a',
    });
  });
});

function fakeAuditService(events: unknown[]) {
  return {
    recordSecurityEvent: (event: unknown) => {
      events.push(event);
      return Promise.resolve();
    },
  } as unknown as AuditService;
}

function oauthClientRow({
  id = 'client-a',
  revokedAt = null,
}: { id?: string; revokedAt?: Date | null } = {}) {
  return {
    clientId: 'mdy_client_test',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    description: 'Test app',
    homepageUrl: 'https://example.com',
    id,
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
