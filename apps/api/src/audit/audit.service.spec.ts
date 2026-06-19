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

  test('loads team membership audit metadata', async () => {
    const service = new AuditService({
      auditLog: {
        count: () => Promise.resolve(1),
        findMany: () =>
          Promise.resolve([
            {
              action: 'TEAM_MEMBERSHIP_CHANGED',
              actor: {
                displayName: 'Admin',
                id: 'user-a',
                username: 'admin',
              },
              actorId: 'user-a',
              createdAt: new Date('2026-01-03T00:00:00.000Z'),
              id: 'audit-c',
              metadata: {
                action: 'UPDATE',
                after: {
                  accepted: false,
                  owner: false,
                  permissions: ['MANAGE_DETAILS'],
                  role: 'Maintainer',
                  username: 'builder',
                },
                before: {
                  accepted: false,
                  owner: false,
                  permissions: [],
                  role: 'Member',
                  username: 'builder',
                },
                resource: {
                  id: 'project-a',
                  kind: 'PROJECT',
                  name: 'Example',
                  projectKind: 'MOD',
                  slug: 'example',
                },
              },
              targetUser: {
                displayName: 'Builder',
                id: 'user-b',
                username: 'builder',
              },
              targetUserId: 'user-b',
            },
          ]),
      },
    } as unknown as PrismaService);

    const result = await service.findAdminAuditLogs();

    expect(result.auditLogs[0]).toMatchObject({
      action: 'TEAM_MEMBERSHIP_CHANGED',
      moderationAction: null,
      resource: {
        kind: 'PROJECT',
        name: 'Example',
        projectKind: 'MOD',
      },
      teamMemberAction: 'UPDATE',
      teamMemberAfter: {
        permissions: ['MANAGE_DETAILS'],
        role: 'Maintainer',
        username: 'builder',
      },
      teamMemberBefore: {
        permissions: [],
        role: 'Member',
        username: 'builder',
      },
    });
  });

  test('loads report state audit metadata', async () => {
    const service = new AuditService({
      auditLog: {
        count: () => Promise.resolve(1),
        findMany: () =>
          Promise.resolve([
            {
              action: 'REPORT_STATE_UPDATED',
              actor: {
                displayName: 'Moderator',
                id: 'user-a',
                username: 'mod',
              },
              actorId: 'user-a',
              createdAt: new Date('2026-01-04T00:00:00.000Z'),
              id: 'audit-d',
              metadata: {
                after: {
                  id: 'report-a',
                  reason: 'MALWARE',
                  state: 'CLOSED',
                  targetId: 'project-a',
                  targetKind: 'PROJECT',
                  targetLabel: 'Example',
                },
                before: {
                  id: 'report-a',
                  reason: 'MALWARE',
                  state: 'OPEN',
                  targetId: 'project-a',
                  targetKind: 'PROJECT',
                  targetLabel: 'Example',
                },
                entity: 'REPORT',
              },
              targetUser: null,
              targetUserId: null,
            },
          ]),
      },
    } as unknown as PrismaService);

    const result = await service.findAdminAuditLogs();

    expect(result.auditLogs[0]).toMatchObject({
      action: 'REPORT_STATE_UPDATED',
      moderationAction: null,
      reportAfter: {
        state: 'CLOSED',
        targetKind: 'PROJECT',
        targetLabel: 'Example',
      },
      reportBefore: {
        state: 'OPEN',
        targetKind: 'PROJECT',
      },
    });
  });

  test('loads version moderation audit metadata', async () => {
    const service = new AuditService({
      auditLog: {
        count: () => Promise.resolve(1),
        findMany: () =>
          Promise.resolve([
            {
              action: 'VERSION_MODERATED',
              actor: null,
              actorId: 'moderator-a',
              createdAt: new Date('2026-01-05T00:00:00.000Z'),
              id: 'audit-e',
              metadata: {
                action: 'APPROVE',
                after: {
                  id: 'version-a',
                  name: 'Example',
                  projectSlug: 'example',
                  requestedStatus: null,
                  status: 'APPROVED',
                  versionNumber: '1.0.0',
                },
                before: {
                  id: 'version-a',
                  name: 'Example',
                  projectSlug: 'example',
                  requestedStatus: 'APPROVED',
                  status: 'PENDING_REVIEW',
                  versionNumber: '1.0.0',
                },
                entity: 'VERSION',
                reason: 'Clean scan',
              },
              targetUser: null,
              targetUserId: null,
            },
          ]),
      },
    } as unknown as PrismaService);

    const result = await service.findAdminAuditLogs();

    expect(result.auditLogs[0]).toMatchObject({
      action: 'VERSION_MODERATED',
      moderationAction: 'APPROVE',
      reason: 'Clean scan',
      versionAfter: {
        projectSlug: 'example',
        status: 'APPROVED',
      },
      versionBefore: {
        requestedStatus: 'APPROVED',
        status: 'PENDING_REVIEW',
      },
    });
  });

  test('loads security audit metadata', async () => {
    const service = new AuditService({
      auditLog: {
        count: () => Promise.resolve(1),
        findMany: () =>
          Promise.resolve([
            {
              action: 'SECURITY_EVENT',
              actor: {
                displayName: null,
                id: 'user-a',
                username: 'seed',
              },
              actorId: 'user-a',
              createdAt: new Date('2026-01-06T00:00:00.000Z'),
              id: 'audit-f',
              metadata: {
                action: 'API_TOKEN_REVOKED',
                tokenId: 'token-a',
                tokenName: 'Local automation',
              },
              targetUser: {
                displayName: null,
                id: 'user-a',
                username: 'seed',
              },
              targetUserId: 'user-a',
            },
          ]),
      },
    } as unknown as PrismaService);

    const result = await service.findAdminAuditLogs();

    expect(result.auditLogs[0]).toMatchObject({
      action: 'SECURITY_EVENT',
      moderationAction: null,
      securityAction: 'API_TOKEN_REVOKED',
      targetUser: {
        username: 'seed',
      },
    });
  });

  test('records security audit events without sensitive values', async () => {
    const writes: unknown[] = [];
    const service = new AuditService({
      auditLog: {
        create: (query: unknown) => {
          writes.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    await service.recordSecurityEvent({
      action: 'API_TOKEN_CREATED',
      actorId: 'user-a',
      metadata: {
        scopes: ['read:projects'],
        tokenId: 'token-a',
        tokenName: 'Local automation',
      },
      targetUserId: 'user-a',
    });

    expect(writes[0]).toEqual({
      data: {
        action: 'SECURITY_EVENT',
        actorId: 'user-a',
        metadata: {
          action: 'API_TOKEN_CREATED',
          scopes: ['read:projects'],
          tokenId: 'token-a',
          tokenName: 'Local automation',
        },
        targetUserId: 'user-a',
      },
    });
  });
});
