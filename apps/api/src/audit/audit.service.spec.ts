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

  test('loads project moderation audit metadata', async () => {
    const service = new AuditService({
      auditLog: {
        count: () => Promise.resolve(1),
        findMany: () =>
          Promise.resolve([
            {
              action: 'PROJECT_MODERATED',
              actor: null,
              actorId: 'moderator-a',
              createdAt: new Date('2026-01-02T00:00:00.000Z'),
              id: 'audit-b',
              metadata: {
                action: 'REJECT',
                after: {
                  id: 'project-a',
                  requestedStatus: null,
                  slug: 'example',
                  status: 'REJECTED',
                  title: 'Example',
                },
                before: {
                  id: 'project-a',
                  requestedStatus: 'APPROVED',
                  slug: 'example',
                  status: 'PENDING_REVIEW',
                  title: 'Example',
                },
                reason: 'Needs more context',
              },
              targetUser: null,
              targetUserId: null,
            },
          ]),
      },
    } as unknown as PrismaService);

    const result = await service.findAdminAuditLogs();

    expect(result.auditLogs[0]).toMatchObject({
      action: 'PROJECT_MODERATED',
      after: null,
      before: null,
      moderationAction: 'REJECT',
      projectAfter: {
        slug: 'example',
        status: 'REJECTED',
      },
      projectBefore: {
        requestedStatus: 'APPROVED',
        status: 'PENDING_REVIEW',
      },
      reason: 'Needs more context',
    });
  });
});
