import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { TeamsService } from './teams.service.js';

function createService(prisma: PrismaService, auditEvents: unknown[] = []) {
  return new TeamsService(
    {
      recordTeamMembershipChange: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    prisma,
  );
}

describe(TeamsService.name, () => {
  test('loads pending viewer team invitations', async () => {
    const queries: unknown[] = [];
    const service = createService({
      teamMember: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(5);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([teamInvitationRow()]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerInvitations('user-a');

    expect(result.totalHits).toBe(5);
    expect(queries).toEqual([
      {
        count: {
          where: {
            acceptedAt: null,
            userId: 'user-a',
          },
        },
      },
      {
        findMany: expect.objectContaining({
          orderBy: [{ createdAt: 'desc' }],
          skip: 0,
          take: 20,
          where: {
            acceptedAt: null,
            userId: 'user-a',
          },
        }),
      },
    ]);
    expect(result.invitations[0]?.target.name).toBe('Example Project');
    expect(result.invitations[0]?.target.projectKind).toBe('MOD');
  });

  test('loads pending viewer team invitations with pagination', async () => {
    const queries: unknown[] = [];
    const service = createService({
      teamMember: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(9);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([teamInvitationRow({ id: 'member-b' })]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findViewerInvitations('user-a', {
      limit: 1,
      offset: 3,
    });

    expect(result.totalHits).toBe(9);
    expect(result.invitations.map((invitation) => invitation.id)).toEqual([
      'member-b',
    ]);
    expect(queries[1]).toEqual({
      findMany: expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
        skip: 3,
        take: 1,
        where: {
          acceptedAt: null,
          userId: 'user-a',
        },
      }),
    });
  });

  test('loads the legacy viewer team invitation list from search results', async () => {
    const service = createService({
      teamMember: {
        count: () => Promise.resolve(2),
        findMany: () =>
          Promise.resolve([
            teamInvitationRow({ id: 'member-a' }),
            teamInvitationRow({ id: 'member-b' }),
          ]),
      },
    } as unknown as PrismaService);

    const invitations = await service.findViewerInvitationList('user-a');

    expect(invitations.map((invitation) => invitation.id)).toEqual([
      'member-a',
      'member-b',
    ]);
  });

  test('accepts pending viewer invitations', async () => {
    const auditEvents: unknown[] = [];
    const updates: unknown[] = [];
    const service = createService(
      {
        teamMember: {
          findFirst: () =>
            Promise.resolve({ ...teamInvitationRow(), isOwner: false }),
          updateMany: (query: unknown) => {
            updates.push(query);
            return Promise.resolve({ count: 1 });
          },
        },
      } as unknown as PrismaService,
      auditEvents,
    );

    const invitation = await service.acceptInvitation({
      invitationId: 'member-a',
      userId: 'user-a',
    });

    expect(updates[0]).toEqual({
      data: { acceptedAt: expect.any(Date) },
      where: {
        acceptedAt: null,
        id: 'member-a',
        userId: 'user-a',
      },
    });
    expect(invitation.id).toBe('member-a');
    expect(auditEvents[0]).toEqual({
      action: 'ACCEPT',
      actorId: 'user-a',
      after: {
        accepted: true,
        owner: false,
        permissions: ['MANAGE_VERSIONS'],
        role: 'Maintainer',
        username: 'builder',
      },
      before: {
        accepted: false,
        owner: false,
        permissions: ['MANAGE_VERSIONS'],
        role: 'Maintainer',
        username: 'builder',
      },
      resource: {
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Example Project',
        projectKind: 'MOD',
        slug: 'example',
      },
      targetUserId: 'user-a',
    });
  });

  test('rejects stale invitation acceptance before auditing', async () => {
    const auditEvents: unknown[] = [];
    const service = createService(
      {
        teamMember: {
          findFirst: () =>
            Promise.resolve({ ...teamInvitationRow(), isOwner: false }),
          updateMany: () => Promise.resolve({ count: 0 }),
        },
      } as unknown as PrismaService,
      auditEvents,
    );

    let caught: unknown;
    try {
      await service.acceptInvitation({
        invitationId: 'member-a',
        userId: 'user-a',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Team invitation not found');
    expect(auditEvents).toEqual([]);
  });

  test('declines pending viewer invitations', async () => {
    const auditEvents: unknown[] = [];
    const deletes: unknown[] = [];
    const service = createService(
      {
        teamMember: {
          deleteMany: (query: unknown) => {
            deletes.push(query);
            return Promise.resolve({ count: 1 });
          },
          findFirst: () =>
            Promise.resolve({ ...teamInvitationRow(), isOwner: false }),
        },
      } as unknown as PrismaService,
      auditEvents,
    );

    const invitation = await service.declineInvitation({
      invitationId: 'member-a',
      userId: 'user-a',
    });

    expect(deletes[0]).toEqual({
      where: {
        acceptedAt: null,
        id: 'member-a',
        userId: 'user-a',
      },
    });
    expect(invitation.target.type).toBe('PROJECT');
    expect(auditEvents[0]).toEqual({
      action: 'DECLINE',
      actorId: 'user-a',
      after: null,
      before: {
        accepted: false,
        owner: false,
        permissions: ['MANAGE_VERSIONS'],
        role: 'Maintainer',
        username: 'builder',
      },
      resource: {
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Example Project',
        projectKind: 'MOD',
        slug: 'example',
      },
      targetUserId: 'user-a',
    });
  });

  test('rejects stale invitation decline before auditing', async () => {
    const auditEvents: unknown[] = [];
    const service = createService(
      {
        teamMember: {
          deleteMany: () => Promise.resolve({ count: 0 }),
          findFirst: () =>
            Promise.resolve({ ...teamInvitationRow(), isOwner: false }),
        },
      } as unknown as PrismaService,
      auditEvents,
    );

    let caught: unknown;
    try {
      await service.declineInvitation({
        invitationId: 'member-a',
        userId: 'user-a',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Team invitation not found');
    expect(auditEvents).toEqual([]);
  });
});

function teamInvitationRow({ id = 'member-a' }: { id?: string } = {}) {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id,
    permissions: ['MANAGE_VERSIONS'],
    role: 'Maintainer',
    team: {
      organization: null,
      project: {
        id: 'project-a',
        kind: 'MOD',
        slug: 'example',
        title: 'Example Project',
      },
      targetKind: 'PROJECT',
    },
    user: {
      username: 'builder',
    },
  };
}
