import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { OrganizationsService } from './organizations.service.js';

describe(OrganizationsService.name, () => {
  test('loads organization profiles with approved project previews', async () => {
    const queries: unknown[] = [];
    const service = new OrganizationsService({
      organization: {
        findFirst: (query: unknown) => {
          queries.push(query);
          return Promise.resolve({
            _count: { projects: 1 },
            color: '#1d9bf0',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            description: 'Seeded projects',
            iconUrl: null,
            id: 'org-a',
            name: 'Seed Organization',
            owner: {
              avatarUrl: null,
              displayName: 'Seed Curator',
              id: 'user-a',
              username: 'seed',
            },
            projects: [
              {
                categories: [{ category: { slug: 'optimization' } }],
                description: 'Long description',
                downloads: 10,
                followers: 2,
                gallery: [],
                gameVersions: [{ gameVersion: { version: '1.21.6' } }],
                iconUrl: null,
                id: 'project-a',
                kind: 'MOD',
                license: { key: 'mit', name: 'MIT', url: null },
                links: [],
                loaders: [{ loader: 'FABRIC' }],
                slug: 'sodium',
                status: 'APPROVED',
                summary: 'Fast rendering',
                title: 'Sodium',
                updatedAt: new Date('2026-01-02T00:00:00.000Z'),
              },
            ],
            slug: 'seed',
            team: { _count: { members: 1 } },
            updatedAt: new Date('2026-01-03T00:00:00.000Z'),
          });
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
    expect(organization?.name).toBe('Seed Organization');
    expect(organization?.projectCount).toBe(1);
    expect(organization?.slug).toBe('seed');
    expect(organization?.projects[0]).toEqual({
      body: 'Long description',
      categories: ['optimization'],
      downloads: 10,
      followers: 2,
      gallery: [],
      gameVersions: ['1.21.6'],
      iconUrl: null,
      id: 'project-a',
      kind: 'MOD',
      license: { id: 'mit', name: 'MIT', url: null },
      links: [],
      loaders: ['FABRIC'],
      slug: 'sodium',
      status: 'APPROVED',
      summary: 'Fast rendering',
      title: 'Sodium',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
  });
});
