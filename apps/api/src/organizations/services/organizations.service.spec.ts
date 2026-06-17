import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { OrganizationsService } from './organizations.service.js';

describe(OrganizationsService.name, () => {
  test('adds managed projects to owned organizations', async () => {
    const updates: unknown[] = [];
    const service = new OrganizationsService({
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
        findFirst: () => Promise.resolve({ id: 'project-a' }),
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

    expect(updates[0]).toEqual({
      data: { organizationId: 'org-a' },
      where: { id: 'project-a' },
    });
    expect(organization.id).toBe('org-a');
  });

  test('removes managed projects from owned organizations', async () => {
    const updates: unknown[] = [];
    const service = new OrganizationsService({
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
        findFirst: () => Promise.resolve({ id: 'project-a' }),
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

    expect(updates[0]).toEqual({
      data: { organizationId: null },
      where: { id: 'project-a' },
    });
    expect(organization.id).toBe('org-a');
  });

  test('creates organizations with an owner team membership', async () => {
    const transactionSteps: string[] = [];
    const service = new OrganizationsService({
      $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          organization: {
            create: (query: { data: unknown }) => {
              transactionSteps.push(
                `organization:${JSON.stringify(query.data)}`,
              );
              return Promise.resolve(organizationRow());
            },
          },
          team: {
            create: () => {
              transactionSteps.push('team');
              return Promise.resolve({ id: 'team-a' });
            },
          },
          teamMember: {
            create: (query: { data: unknown }) => {
              transactionSteps.push(`member:${JSON.stringify(query.data)}`);
              return Promise.resolve({});
            },
          },
        }),
    } as unknown as PrismaService);

    const organization = await service.createOrganization(
      {
        color: ' #1d9bf0 ',
        description: '  Creator group  ',
        iconUrl: ' https://cdn.example.test/org.png ',
        name: 'Seed Organization',
        slug: 'seed',
      },
      'user-a',
    );

    expect(transactionSteps[0]).toBe('team');
    expect(transactionSteps[1]).toContain('"isOwner":true');
    expect(transactionSteps[2]).toContain('"ownerId":"user-a"');
    expect(transactionSteps[2]).toContain('"description":"Creator group"');
    expect(transactionSteps[2]).toContain(
      '"iconUrl":"https://cdn.example.test/org.png"',
    );
    expect(organization.slug).toBe('seed');
  });

  test('adds organization team members for member managers', async () => {
    const notifications: unknown[] = [];
    const upserts: unknown[] = [];
    const service = new OrganizationsService(
      {
        organization: {
          findFirst: (query: { where?: { id?: string; team?: unknown } }) => {
            if (query.where?.team !== undefined) {
              return Promise.resolve({
                id: 'org-a',
                name: 'Iris Labs',
                teamId: 'team-a',
              });
            }

            return Promise.resolve(organizationRow());
          },
        },
        teamMember: {
          upsert: (query: unknown) => {
            upserts.push(query);
            return Promise.resolve({});
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
      } as never,
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
      actionUrl: '/dashboard',
      body: 'You were invited to collaborate with Iris Labs.',
      title: 'Team invitation for Iris Labs',
      type: 'team',
      userId: 'user-b',
    });
    expect(organization.id).toBe('org-a');
  });

  test('removes non-owner organization team members for member managers', async () => {
    const deletes: unknown[] = [];
    const service = new OrganizationsService({
      organization: {
        findFirst: (query: { where?: { id?: string; team?: unknown } }) => {
          if (query.where?.team !== undefined) {
            return Promise.resolve({ id: 'org-a', teamId: 'team-a' });
          }

          return Promise.resolve(organizationRow());
        },
      },
      teamMember: {
        delete: (query: unknown) => {
          deletes.push(query);
          return Promise.resolve({});
        },
        findFirst: () => Promise.resolve({ id: 'member-b', isOwner: false }),
      },
    } as unknown as PrismaService);

    const organization = await service.removeOrganizationTeamMember(
      {
        organizationId: 'org-a',
        username: 'builder',
      },
      'user-a',
    );

    expect(deletes[0]).toEqual({ where: { id: 'member-b' } });
    expect(organization.id).toBe('org-a');
  });

  test('does not remove organization owners', async () => {
    const service = new OrganizationsService({
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

  test('loads organization profiles with approved project previews', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationsService({
      organization: {
        findFirst: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(organizationRow());
        },
      },
    } as unknown as PrismaService);

    const organization = await service.findBySlug('Seed');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: { slug: { equals: 'Seed', mode: 'insensitive' } },
      }),
    );
    expect(organization?.memberCount).toBe(1);
    expect(organization?.members).toEqual([
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
    ]);
    expect(organization?.name).toBe('Seed Organization');
    expect(organization?.projectCount).toBe(1);
    expect(organization?.slug).toBe('seed');
    expect(organization?.projects[0]).toEqual({
      approvedAt: null,
      archivedAt: null,
      body: 'Long description',
      categories: ['optimization'],
      color: '#f97316',
      discordUrl: null,
      downloads: 10,
      followers: 2,
      gallery: [],
      gameVersions: ['1.21.6'],
      iconUrl: null,
      id: 'project-a',
      issuesUrl: null,
      kind: 'MOD',
      license: { id: 'mit', name: 'MIT', url: null },
      links: [],
      loaders: ['FABRIC'],
      owner: {
        avatarUrl: null,
        displayName: 'Project Creator',
        id: 'user-owner',
        username: 'creator',
      },
      publishedAt: new Date('2025-12-15T00:00:00.000Z'),
      queuedAt: null,
      requestedStatus: null,
      slug: 'sodium',
      sourceUrl: null,
      status: 'APPROVED',
      summary: 'Fast rendering',
      title: 'Sodium',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      wikiUrl: null,
    });
  });

  test('loads organizations owned by the viewer', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationsService({
      organization: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([organizationRow()]);
        },
      },
    } as unknown as PrismaService);

    const organizations = await service.findViewerOrganizations('user-a');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: { ownerId: 'user-a' },
      }),
    );
    expect(organizations).toHaveLength(1);
  });

  test('updates owned organization metadata', async () => {
    const updates: unknown[] = [];
    const service = new OrganizationsService({
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
        slug: 'updated',
      },
      'user-a',
    );

    expect(updates[0]).toEqual({
      data: {
        color: null,
        description: 'Updated group',
        iconUrl: null,
        name: 'Updated Organization',
        slug: 'updated',
      },
      where: { id: 'org-a' },
    });
    expect(organization.name).toBe('Updated Organization');
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
    projects: [
      {
        approvedAt: null,
        archivedAt: null,
        categories: [{ category: { slug: 'optimization' } }],
        color: '#f97316',
        description: 'Long description',
        discordUrl: null,
        downloads: 10,
        followers: 2,
        gallery: [],
        gameVersions: [{ gameVersion: { version: '1.21.6' } }],
        iconUrl: null,
        id: 'project-a',
        issuesUrl: null,
        kind: 'MOD',
        license: { key: 'mit', name: 'MIT', url: null },
        links: [],
        loaders: [{ loader: 'FABRIC' }],
        publishedAt: new Date('2025-12-15T00:00:00.000Z'),
        queuedAt: null,
        requestedStatus: null,
        team: {
          members: [
            {
              user: {
                avatarUrl: null,
                displayName: 'Project Creator',
                id: 'user-owner',
                username: 'creator',
              },
            },
          ],
        },
        slug: 'sodium',
        sourceUrl: null,
        status: 'APPROVED',
        summary: 'Fast rendering',
        title: 'Sodium',
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        wikiUrl: null,
      },
    ],
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
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
  };
}
