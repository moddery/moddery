import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { OrganizationManagementService } from './organization-management.service.js';

function createService(
  prisma: PrismaService,
  {
    auditEvents = [],
    notifications = {},
  }: { auditEvents?: unknown[]; notifications?: unknown } = {},
) {
  return new OrganizationManagementService(
    prisma,
    {
      recordTeamMembershipChange: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    notifications as never,
  );
}

describe(OrganizationManagementService.name, () => {
  test('adds managed projects to owned organizations', async () => {
    const projectLookups: unknown[] = [];
    const updates: unknown[] = [];
    const service = createService({
      organization: {
        findFirst: (query: { select?: unknown; where?: { id?: string } }) => {
          if (query.where?.id === 'org-a') {
            return Promise.resolve(
              query.select === undefined ? { id: 'org-a' } : organizationRow(),
            );
          }

          return Promise.resolve(null);
        },
      },
      project: {
        findFirst: (query: unknown) => {
          projectLookups.push(query);
          return Promise.resolve({ id: 'project-a' });
        },
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const organization = await service.addProjectToOrganization(
      {
        organizationId: 'org-a',
        projectSlug: 'sodium',
      },
      'user-a',
    );

    expect(projectLookups[0]).toEqual({
      select: { id: true },
      where: {
        slug: 'sodium',
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: 'MANAGE_SETTINGS' } },
              ],
              userId: 'user-a',
            },
          },
        },
      },
    });
    expect(updates[0]).toEqual({
      data: { organizationId: 'org-a' },
      where: { id: 'project-a' },
    });
    expect(organization.id).toBe('org-a');
  });

  test('removes managed projects from owned organizations', async () => {
    const projectLookups: unknown[] = [];
    const updates: unknown[] = [];
    const service = createService({
      organization: {
        findFirst: (query: { select?: unknown; where?: { id?: string } }) => {
          if (query.where?.id === 'org-a') {
            return Promise.resolve(
              query.select === undefined ? { id: 'org-a' } : organizationRow(),
            );
          }

          return Promise.resolve(null);
        },
      },
      project: {
        findFirst: (query: unknown) => {
          projectLookups.push(query);
          return Promise.resolve({ id: 'project-a' });
        },
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const organization = await service.removeProjectFromOrganization(
      {
        organizationId: 'org-a',
        projectSlug: 'sodium',
      },
      'user-a',
    );

    expect(projectLookups[0]).toEqual({
      select: { id: true },
      where: {
        organizationId: 'org-a',
        slug: 'sodium',
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: 'MANAGE_SETTINGS' } },
              ],
              userId: 'user-a',
            },
          },
        },
      },
    });
    expect(updates[0]).toEqual({
      data: { organizationId: null },
      where: { id: 'project-a' },
    });
    expect(organization.id).toBe('org-a');
  });

  test('rejects invalid organization project links before lookups', async () => {
    const service = createService({
      organization: {
        findFirst: () => {
          throw new Error('Organization lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.addProjectToOrganization(
        {
          organizationId: 'org-a',
          projectSlug: ' ',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project is required');
  });

  test('adds organization team members for member managers', async () => {
    const auditEvents: unknown[] = [];
    const notifications: unknown[] = [];
    const upserts: unknown[] = [];
    const service = createService(
      {
        organization: {
          findFirst: (query: { where?: { id?: string; team?: unknown } }) => {
            if (query.where?.team !== undefined) {
              return Promise.resolve({
                id: 'org-a',
                name: 'Iris Labs',
                slug: 'iris-labs',
                teamId: 'team-a',
              });
            }

            return Promise.resolve(organizationRow());
          },
        },
        teamMember: {
          findUnique: () => Promise.resolve(null),
          upsert: (query: unknown) => {
            upserts.push(query);
            return Promise.resolve({
              acceptedAt: null,
              isOwner: false,
              permissions: ['MANAGE_DETAILS'],
              role: 'Maintainer',
              sortOrder: 0,
              user: {
                id: 'user-b',
                username: 'builder',
              },
            });
          },
        },
        user: {
          findFirst: () => Promise.resolve({ id: 'user-b' }),
        },
      } as unknown as PrismaService,
      {
        auditEvents,
        notifications: {
          sendUserNotification: (input: unknown) => {
            notifications.push(input);
            return Promise.resolve({});
          },
        },
      },
    );

    const organization = await service.addOrganizationTeamMember(
      {
        organizationId: 'org-a',
        permissions: ['MANAGE_DETAILS', 'NOPE'],
        role: ' Maintainer ',
        username: 'builder',
      },
      'user-a',
    );

    expect(upserts[0]).toEqual(
      expect.objectContaining({
        create: expect.objectContaining({
          acceptedAt: null,
          permissions: ['MANAGE_DETAILS'],
          role: 'Maintainer',
          teamId: 'team-a',
          userId: 'user-b',
        }),
        update: {
          permissions: ['MANAGE_DETAILS'],
          role: 'Maintainer',
        },
      }),
    );
    expect(notifications[0]).toEqual({
      actionUrl: '/dashboard#dashboard-team-invitations',
      body: 'You were invited to collaborate with Iris Labs.',
      title: 'Team invitation for Iris Labs',
      type: 'team',
      userId: 'user-b',
    });
    expect(auditEvents[0]).toEqual({
      action: 'ADD',
      actorId: 'user-a',
      after: {
        accepted: false,
        owner: false,
        permissions: ['MANAGE_DETAILS'],
        role: 'Maintainer',
        username: 'builder',
      },
      before: null,
      resource: {
        id: 'org-a',
        kind: 'ORGANIZATION',
        name: 'Iris Labs',
        projectKind: null,
        slug: 'iris-labs',
      },
      targetUserId: 'user-b',
    });
    expect(organization.id).toBe('org-a');
  });

  test('does not resend organization invitations when updating existing members', async () => {
    const auditEvents: unknown[] = [];
    const notifications: unknown[] = [];
    const service = createService(
      {
        organization: {
          findFirst: (query: { where?: { id?: string; team?: unknown } }) => {
            if (query.where?.team !== undefined) {
              return Promise.resolve({
                id: 'org-a',
                name: 'Iris Labs',
                slug: 'iris-labs',
                teamId: 'team-a',
              });
            }

            return Promise.resolve(organizationRow());
          },
        },
        teamMember: {
          findUnique: () =>
            Promise.resolve({
              acceptedAt: new Date('2026-01-01T00:00:00.000Z'),
              isOwner: false,
              permissions: ['MANAGE_DETAILS'],
              role: 'Builder',
              sortOrder: 0,
              user: {
                id: 'user-b',
                username: 'builder',
              },
            }),
          upsert: () =>
            Promise.resolve({
              acceptedAt: new Date('2026-01-01T00:00:00.000Z'),
              isOwner: false,
              permissions: ['MANAGE_SETTINGS'],
              role: 'Maintainer',
              sortOrder: 0,
              user: {
                id: 'user-b',
                username: 'builder',
              },
            }),
        },
        user: {
          findFirst: () => Promise.resolve({ id: 'user-b' }),
        },
      } as unknown as PrismaService,
      {
        auditEvents,
        notifications: {
          sendUserNotification: (input: unknown) => {
            notifications.push(input);
            return Promise.resolve({});
          },
        },
      },
    );

    await service.addOrganizationTeamMember(
      {
        organizationId: 'org-a',
        permissions: ['MANAGE_SETTINGS'],
        role: 'Maintainer',
        username: 'builder',
      },
      'user-a',
    );

    expect(notifications).toEqual([]);
    expect(auditEvents[0]).toEqual(
      expect.objectContaining({
        action: 'UPDATE',
        targetUserId: 'user-b',
      }),
    );
  });

  test('removes non-owner organization team members for member managers', async () => {
    const auditEvents: unknown[] = [];
    const deletes: unknown[] = [];
    const service = createService(
      {
        organization: {
          findFirst: (query: { where?: { id?: string; team?: unknown } }) => {
            if (query.where?.team !== undefined) {
              return Promise.resolve({
                id: 'org-a',
                name: 'Iris Labs',
                slug: 'iris-labs',
                teamId: 'team-a',
              });
            }

            return Promise.resolve(organizationRow());
          },
        },
        teamMember: {
          delete: (query: unknown) => {
            deletes.push(query);
            return Promise.resolve({});
          },
          findFirst: () =>
            Promise.resolve({
              acceptedAt: null,
              id: 'member-b',
              isOwner: false,
              permissions: ['MANAGE_DETAILS'],
              role: 'Maintainer',
              sortOrder: 0,
              user: {
                id: 'user-b',
                username: 'builder',
              },
            }),
        },
      } as unknown as PrismaService,
      { auditEvents },
    );

    const organization = await service.removeOrganizationTeamMember(
      {
        organizationId: 'org-a',
        username: 'builder',
      },
      'user-a',
    );

    expect(deletes[0]).toEqual({ where: { id: 'member-b' } });
    expect(auditEvents[0]).toEqual({
      action: 'REMOVE',
      actorId: 'user-a',
      after: null,
      before: {
        accepted: false,
        owner: false,
        permissions: ['MANAGE_DETAILS'],
        role: 'Maintainer',
        username: 'builder',
      },
      resource: {
        id: 'org-a',
        kind: 'ORGANIZATION',
        name: 'Iris Labs',
        projectKind: null,
        slug: 'iris-labs',
      },
      targetUserId: 'user-b',
    });
    expect(organization.id).toBe('org-a');
  });

  test('rejects invalid organization team member inputs before lookups', async () => {
    const service = createService({
      organization: {
        findFirst: () => {
          throw new Error('Organization lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.addOrganizationTeamMember(
        {
          organizationId: 'org-a',
          permissions: [],
          role: 'Member',
          username: ' ',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Username is required');
  });

  test('does not remove organization owners', async () => {
    const service = createService({
      organization: {
        findFirst: (query: { where?: { team?: unknown } }) => {
          if (query.where?.team !== undefined) {
            return Promise.resolve({ id: 'org-a', teamId: 'team-a' });
          }

          return Promise.resolve(organizationRow());
        },
      },
      teamMember: {
        findFirst: () => Promise.resolve({ id: 'member-a', isOwner: true }),
      },
    } as unknown as PrismaService);

    let error: unknown;

    try {
      await service.removeOrganizationTeamMember(
        {
          organizationId: 'org-a',
          username: 'seed',
        },
        'user-a',
      );
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'Organization owner cannot be removed',
    );
  });

  test('does not update organization owners', async () => {
    const auditEvents: unknown[] = [];
    const notifications: unknown[] = [];
    const service = createService(
      {
        organization: {
          findFirst: (query: { where?: { team?: unknown } }) => {
            if (query.where?.team !== undefined) {
              return Promise.resolve({
                id: 'org-a',
                name: 'Iris Labs',
                slug: 'iris-labs',
                teamId: 'team-a',
              });
            }

            return Promise.resolve(organizationRow());
          },
        },
        teamMember: {
          findUnique: () =>
            Promise.resolve({
              acceptedAt: new Date('2026-01-01T00:00:00.000Z'),
              isOwner: true,
              permissions: ['MANAGE_DETAILS'],
              role: 'Owner',
              sortOrder: 0,
              user: {
                id: 'user-a',
                username: 'seed',
              },
            }),
          upsert: () => {
            throw new Error('Owner membership should not be updated');
          },
        },
        user: {
          findFirst: () => Promise.resolve({ id: 'user-a' }),
        },
      } as unknown as PrismaService,
      {
        auditEvents,
        notifications: {
          sendUserNotification: (input: unknown) => {
            notifications.push(input);
            return Promise.resolve({});
          },
        },
      },
    );

    let error: unknown;

    try {
      await service.addOrganizationTeamMember(
        {
          organizationId: 'org-a',
          permissions: ['MANAGE_SETTINGS'],
          role: 'Maintainer',
          username: 'seed',
        },
        'user-b',
      );
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'Organization owner cannot be updated',
    );
    expect(auditEvents).toEqual([]);
    expect(notifications).toEqual([]);
  });

  test('updates owned organization metadata', async () => {
    const updates: unknown[] = [];
    const service = createService({
      organization: {
        findFirst: (query: { select?: unknown; where?: { id?: string } }) => {
          if (query.where?.id === 'org-a') {
            return Promise.resolve(
              query.select === undefined
                ? { id: 'org-a' }
                : organizationRow({ name: 'Updated Organization' }),
            );
          }

          return Promise.resolve(null);
        },
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const organization = await service.updateOrganization(
      {
        color: '  ',
        description: ' Updated group ',
        iconUrl: '  ',
        name: ' Updated Organization ',
        organizationId: 'org-a',
        slug: ' Updated Organization! ',
      },
      'user-a',
    );

    expect(updates[0]).toEqual({
      data: {
        color: null,
        description: 'Updated group',
        iconUrl: null,
        name: 'Updated Organization',
        slug: 'updated-organization',
      },
      where: { id: 'org-a' },
    });
    expect(organization.name).toBe('Updated Organization');
  });

  test('rejects invalid organization updates before lookups', async () => {
    const service = createService({
      organization: {
        findFirst: () => {
          throw new Error('Organization lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.updateOrganization(
        {
          name: 'Updated Organization',
          organizationId: 'org-a',
          slug: '!!',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'Organization slug must be at least 3 characters',
    );
  });
});

function organizationRow(overrides: Partial<{ name: string }> = {}) {
  return {
    _count: { projects: 1 },
    color: '#1d9bf0',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    description: 'Seeded projects',
    iconUrl: null,
    id: 'org-a',
    name: overrides.name ?? 'Seed Organization',
    owner: {
      avatarUrl: null,
      displayName: 'Seed Curator',
      id: 'user-a',
      username: 'seed',
    },
    projects: [],
    slug: 'seed',
    team: {
      _count: { members: 1 },
      members: [
        {
          isOwner: true,
          permissions: ['MANAGE_DETAILS'],
          role: 'Owner',
          sortOrder: 0,
          user: {
            avatarUrl: null,
            displayName: 'Seed Curator',
            id: 'user-a',
            username: 'seed',
          },
        },
      ],
    },
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };
}
