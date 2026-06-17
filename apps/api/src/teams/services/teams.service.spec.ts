import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { TeamsService } from './teams.service.js';

describe(TeamsService.name, () => {
  test('loads pending viewer team invitations', async () => {
    const queries: unknown[] = [];
    const service = new TeamsService({
      teamMember: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([teamInvitationRow()]);
        },
      },
    } as unknown as PrismaService);

    const invitations = await service.findViewerInvitations('user-a');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          acceptedAt: null,
          userId: 'user-a',
        },
      }),
    );
    expect(invitations[0]?.target.name).toBe('Example Project');
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

function teamInvitationRow() {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 'member-a',
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
