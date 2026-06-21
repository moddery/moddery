import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { OrganizationDirectoryService } from './organization-directory.service.js';

describe(OrganizationDirectoryService.name, () => {
  test('loads organization profiles with approved project previews', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationDirectoryService({
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
      publishedAt: '2025-12-15T00:00:00.000Z',
      queuedAt: null,
      requestedStatus: null,
      slug: 'sodium',
      sourceUrl: null,
      status: 'APPROVED',
      summary: 'Fast rendering',
      title: 'Sodium',
      updatedAt: '2026-01-02T00:00:00.000Z',
      wikiUrl: null,
    });
  });

  test('loads organization members with pagination', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationDirectoryService({
      organization: {
        findFirst: (query: unknown) => {
          queries.push({ organization: query });
          return Promise.resolve({ teamId: 'team-a' });
        },
      },
      teamMember: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(18);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve(organizationRow().team.members);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findOrganizationMembers('Seed', {
      limit: 6,
      offset: 12,
    });

    expect(queries[0]).toEqual({
      organization: {
        select: { teamId: true },
        where: { slug: { equals: 'Seed', mode: 'insensitive' } },
      },
    });
    expect(queries[1]).toEqual({
      count: {
        where: {
          acceptedAt: { not: null },
          teamId: 'team-a',
        },
      },
    });
    expect(queries[2]).toMatchObject({
      findMany: {
        orderBy: [{ isOwner: 'desc' }, { sortOrder: 'asc' }],
        skip: 12,
        take: 6,
        where: {
          acceptedAt: { not: null },
          teamId: 'team-a',
        },
      },
    });
    expect(result.totalHits).toBe(18);
    expect(result.members[0]?.user.username).toBe('seed');
  });

  test('loads organization projects with pagination', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationDirectoryService({
      organization: {
        findFirst: (query: unknown) => {
          queries.push({ organization: query });
          return Promise.resolve({ id: 'org-a' });
        },
      },
      project: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(14);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve(organizationRow().projects);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findOrganizationProjects('Seed', {
      limit: 8,
      offset: 8,
    });

    expect(queries[0]).toEqual({
      organization: {
        select: { id: true },
        where: { slug: { equals: 'Seed', mode: 'insensitive' } },
      },
    });
    expect(queries[1]).toEqual({
      count: {
        where: {
          organizationId: 'org-a',
          status: 'APPROVED',
        },
      },
    });
    expect(queries[2]).toMatchObject({
      findMany: {
        orderBy: [{ updatedAt: 'desc' }],
        skip: 8,
        take: 8,
        where: {
          organizationId: 'org-a',
          status: 'APPROVED',
        },
      },
    });
    expect(result.totalHits).toBe(14);
    expect(result.projects[0]?.slug).toBe('sodium');
  });

  test('filters public organizations by search text', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationDirectoryService({
      organization: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(9);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([organizationRow()]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findPublicOrganizations({
      limit: 12,
      offset: 24,
      search: ' sodium ',
    });

    expect(queries[0]).toMatchObject({
      count: {
        where: {
          OR: expect.arrayContaining([
            {
              name: {
                contains: 'sodium',
                mode: 'insensitive',
              },
            },
            {
              projects: {
                some: {
                  OR: expect.arrayContaining([
                    {
                      title: {
                        contains: 'sodium',
                        mode: 'insensitive',
                      },
                    },
                  ]) as unknown[],
                  status: 'APPROVED',
                },
              },
            },
          ]) as unknown[],
          projects: {
            some: { status: 'APPROVED' },
          },
        },
      },
    });
    expect(queries[1]).toMatchObject({
      findMany: {
        skip: 24,
        take: 12,
      },
    });
    expect(result.totalHits).toBe(9);
    expect(result.organizations[0]?.slug).toBe('seed');
  });

  test('loads the legacy public organization list from search results', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationDirectoryService({
      organization: {
        count: () => Promise.resolve(1),
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([organizationRow()]);
        },
      },
    } as unknown as PrismaService);

    const organizations = await service.findPublicOrganizationList();

    expect(queries[0]).toMatchObject({
      take: 50,
      where: {
        projects: {
          some: { status: 'APPROVED' },
        },
      },
    });
    expect(organizations[0]?.slug).toBe('seed');
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
