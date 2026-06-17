import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { TeamsService } from './teams.service.js';

describe(TeamsService.name, () => {
  test('loads pending viewer team invitations', async () => {
    const queries: unknown[] = [];
    const service = new TeamsService({
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
  });

  test('loads pending viewer team invitations with pagination', async () => {
    const queries: unknown[] = [];
    const service = new TeamsService({
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
    const service = new TeamsService({
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
    const updates: unknown[] = [];
    const service = new TeamsService({
      teamMember: {
        findFirst: () =>
          Promise.resolve({ ...teamInvitationRow(), isOwner: false }),
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const invitation = await service.acceptInvitation({
      invitationId: 'member-a',
      userId: 'user-a',
    });

    expect(updates[0]).toEqual({
      data: { acceptedAt: expect.any(Date) },
      where: { id: 'member-a' },
    });
    expect(invitation.id).toBe('member-a');
  });

  test('declines pending viewer invitations', async () => {
    const deletes: unknown[] = [];
    const service = new TeamsService({
      teamMember: {
        delete: (query: unknown) => {
          deletes.push(query);
          return Promise.resolve({});
        },
        findFirst: () =>
          Promise.resolve({ ...teamInvitationRow(), isOwner: false }),
      },
    } as unknown as PrismaService);

    const invitation = await service.declineInvitation({
      invitationId: 'member-a',
      userId: 'user-a',
    });

    expect(deletes[0]).toEqual({ where: { id: 'member-a' } });
    expect(invitation.target.type).toBe('PROJECT');
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
        slug: 'example',
        title: 'Example Project',
      },
      targetKind: 'PROJECT',
    },
  };
}
