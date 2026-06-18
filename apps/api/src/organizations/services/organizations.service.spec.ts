import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { OrganizationsService } from './organizations.service.js';

describe(OrganizationsService.name, () => {
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
