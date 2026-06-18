import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';

describe(AuditService.name, () => {
  test('loads admin audit logs with decoded account snapshots', async () => {
    const queries: unknown[] = [];
    const service = new AuditService({
      auditLog: {
        count: () => Promise.resolve(2),
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              action: 'USER_ACCOUNT_UPDATED',
              actor: {
                displayName: 'Admin',
                id: 'admin-a',
                username: 'admin',
              },
              actorId: 'admin-a',
              createdAt: new Date('2026-01-02T00:00:00.000Z'),
              id: 'audit-a',
              metadata: {
                after: {
                  role: 'MODERATOR',
                  status: 'SUSPENDED',
                },
                before: {
                  role: 'USER',
                  status: 'ACTIVE',
                },
              },
              targetUser: {
                displayName: null,
                id: 'user-b',
                username: 'builder',
              },
              targetUserId: 'user-b',
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findAdminAuditLogs({ limit: 10, offset: 20 });

    expect(queries[0]).toMatchObject({
      orderBy: [{ createdAt: 'desc' }],
      skip: 20,
      take: 10,
    });
    expect(result.totalHits).toBe(2);
    expect(result.auditLogs[0]).toMatchObject({
      action: 'USER_ACCOUNT_UPDATED',
      actor: {
        username: 'admin',
      },
      after: {
        role: 'MODERATOR',
        status: 'SUSPENDED',
      },
      before: {
        role: 'USER',
        status: 'ACTIVE',
      },
      targetUser: {
        username: 'builder',
      },
    });
  });
});
