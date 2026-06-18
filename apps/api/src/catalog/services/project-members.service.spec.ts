import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectMembersService } from './project-members.service.js';

function createService(
  prisma: PrismaService,
  notifications: unknown = {},
  auditEvents: unknown[] = [],
) {
  return new ProjectMembersService(
    {
      recordTeamMembershipChange: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    notifications as never,
    prisma,
  );
}

describe(ProjectMembersService.name, () => {
  test('loads project team members by project slug', async () => {
    const queries: unknown[] = [];
    const service = createService({
      project: {
        findUnique: (query: unknown) => {
          queries.push({ project: query });
          return Promise.resolve({ teamId: 'team-a' });
        },
      },
      teamMember: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(1);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([projectMemberRow()]);
        },
      },
    } as unknown as PrismaService);

    const members = await service.findProjectMembers('iris');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        project: expect.objectContaining({
          where: { slug: 'iris' },
        }),
      }),
    );
    expect(queries[2]).toEqual(
      expect.objectContaining({
        findMany: expect.objectContaining({
          skip: 0,
          take: 100,
          where: { teamId: 'team-a' },
        }),
      }),
    );
    expect(members).toEqual([
      {
        accepted: true,
        owner: true,
        permissions: ['MANAGE_VERSIONS'],
        role: 'Owner',
        sortOrder: 0,
        user: {
          avatarUrl: 'https://example.test/avatar.png',
          displayName: 'Seed User',
          id: 'user-a',
          username: 'seed',
        },
      },
    ]);
  });

  test('loads project team members with pagination', async () => {
    const queries: unknown[] = [];
    const service = createService({
      project: {
        findUnique: (query: unknown) => {
          queries.push({ project: query });
          return Promise.resolve({ teamId: 'team-a' });
        },
      },
      teamMember: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(7);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([
            projectMemberRow({
              acceptedAt: null,
              isOwner: false,
              role: 'Maintainer',
              sortOrder: 3,
              user: {
                avatarUrl: null,
                displayName: null,
                id: 'user-b',
                username: 'maintainer',
              },
            }),
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findProjectMemberSearch('iris', {
      limit: 5,
      offset: 10,
    });

    expect(queries[1]).toEqual({ count: { where: { teamId: 'team-a' } } });
    expect(queries[2]).toEqual(
      expect.objectContaining({
        findMany: expect.objectContaining({
          skip: 10,
          take: 5,
          where: { teamId: 'team-a' },
        }),
      }),
    );
    expect(result.totalHits).toBe(7);
    expect(result.members[0]?.role).toBe('Maintainer');
    expect(result.members[0]?.accepted).toBe(false);
  });

  test('adds project team members for managers', async () => {
    const auditEvents: unknown[] = [];
    const notifications: unknown[] = [];
    const upserts: unknown[] = [];
    const service = createService(
      {
        project: {
          findFirst: () =>
            Promise.resolve({
              id: 'project-a',
              slug: 'iris',
              teamId: 'team-a',
              title: 'Iris',
            }),
          findUnique: () => Promise.resolve({ teamId: 'team-a' }),
        },
        teamMember: {
          count: () => Promise.resolve(1),
          findUnique: () => Promise.resolve(null),
          findMany: () => Promise.resolve([projectMemberRow()]),
          upsert: (query: unknown) => {
            upserts.push(query);
            return Promise.resolve(
              projectMemberRow({
                acceptedAt: null,
                isOwner: false,
                permissions: ['MANAGE_VERSIONS'],
                role: 'Maintainer',
                user: {
                  avatarUrl: null,
                  displayName: null,
                  id: 'user-b',
                  username: 'maintainer',
                },
              }),
            );
          },
        },
        user: {
          findFirst: () => Promise.resolve({ id: 'user-b' }),
        },
      } as unknown as PrismaService,
      {
        sendUserNotification: (input: unknown) => {
          notifications.push(input);
          return Promise.resolve({});
        },
      },
      auditEvents,
    );

    const members = await service.addProjectTeamMember(
      {
        permissions: ['MANAGE_VERSIONS', 'NOPE'],
        projectSlug: 'iris',
        role: 'Maintainer',
        username: 'maintainer',
      },
      'user-a',
    );

    expect(upserts[0]).toEqual(
      expect.objectContaining({
        create: expect.objectContaining({
          acceptedAt: null,
          permissions: ['MANAGE_VERSIONS'],
          role: 'Maintainer',
          teamId: 'team-a',
          userId: 'user-b',
        }),
        where: {
          teamId_userId: {
            teamId: 'team-a',
            userId: 'user-b',
          },
        },
      }),
    );
    expect(notifications[0]).toEqual({
      actionUrl: '/dashboard#dashboard-team-invitations',
      body: 'You were invited to collaborate on Iris.',
      title: 'Team invitation for Iris',
      type: 'team',
      userId: 'user-b',
    });
    expect(auditEvents[0]).toEqual({
      action: 'ADD',
      actorId: 'user-a',
      after: {
        accepted: false,
        owner: false,
        permissions: ['MANAGE_VERSIONS'],
        role: 'Maintainer',
        username: 'maintainer',
      },
      before: null,
      resource: {
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Iris',
        slug: 'iris',
      },
      targetUserId: 'user-b',
    });
    expect(members[0]?.role).toBe('Owner');
  });

  test('removes non-owner project team members for managers', async () => {
    const auditEvents: unknown[] = [];
    const deletes: unknown[] = [];
    const service = createService(
      {
        project: {
          findFirst: () =>
            Promise.resolve({
              id: 'project-a',
              slug: 'iris',
              teamId: 'team-a',
              title: 'Iris',
            }),
          findUnique: () => Promise.resolve({ teamId: 'team-a' }),
        },
        teamMember: {
          count: () => Promise.resolve(1),
          delete: (query: unknown) => {
            deletes.push(query);
            return Promise.resolve({});
          },
          findMany: () => Promise.resolve([projectMemberRow()]),
          findFirst: () =>
            Promise.resolve({
              id: 'member-b',
              ...projectMemberRow({
                acceptedAt: null,
                isOwner: false,
                permissions: ['MANAGE_DETAILS'],
                role: 'Maintainer',
                user: {
                  avatarUrl: null,
                  displayName: null,
                  id: 'user-b',
                  username: 'maintainer',
                },
              }),
            }),
        },
      } as unknown as PrismaService,
      {},
      auditEvents,
    );

    const members = await service.removeProjectTeamMember(
      {
        projectSlug: 'iris',
        username: 'maintainer',
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
        username: 'maintainer',
      },
      resource: {
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Iris',
        slug: 'iris',
      },
      targetUserId: 'user-b',
    });
    expect(members[0]?.owner).toBe(true);
  });
});

interface ProjectMemberTestRow {
  acceptedAt: Date | null;
  isOwner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

function projectMemberRow(overrides: Partial<ProjectMemberTestRow> = {}) {
  return {
    ...baseProjectMemberRow(),
    ...overrides,
  };
}

function baseProjectMemberRow(): ProjectMemberTestRow {
  return {
    acceptedAt: new Date('2026-01-01T00:00:00.000Z'),
    isOwner: true,
    permissions: ['MANAGE_VERSIONS'],
    role: 'Owner',
    sortOrder: 0,
    user: {
      avatarUrl: 'https://example.test/avatar.png',
      displayName: 'Seed User',
      id: 'user-a',
      username: 'seed',
    },
  };
}
