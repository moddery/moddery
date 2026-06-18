import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectManagementService } from './project-management.service.js';

function createProjectManagementService(
  prisma: PrismaService,
  searchService: unknown,
) {
  return new ProjectManagementService(
    prisma,
    searchService as never,
    {
      delete: () => Promise.resolve(),
    } as never,
  );
}

describe(ProjectManagementService.name, () => {
  test('updates managed project metadata and reindexes search', async () => {
    const operations: string[] = [];
    const indexed: unknown[] = [];
    const tx = {
      category: {
        upsert: () => Promise.resolve({ id: 'category-a' }),
      },
      gameVersion: {
        upsert: () => Promise.resolve({ id: 'game-version-a' }),
      },
      project: {
        findUniqueOrThrow: () =>
          Promise.resolve(projectRow({ title: 'Updated Project' })),
        update: (query: unknown) => {
          operations.push(`project-update:${JSON.stringify(query)}`);
          return Promise.resolve({});
        },
      },
      projectCategory: {
        create: () => Promise.resolve({}),
        deleteMany: (query: unknown) => {
          operations.push(`categories-delete:${JSON.stringify(query)}`);
          return Promise.resolve({});
        },
      },
      projectGameVersion: {
        create: () => Promise.resolve({}),
        deleteMany: (query: unknown) => {
          operations.push(`versions-delete:${JSON.stringify(query)}`);
          return Promise.resolve({});
        },
      },
      projectLoader: {
        create: () => Promise.resolve({}),
        deleteMany: (query: unknown) => {
          operations.push(`loaders-delete:${JSON.stringify(query)}`);
          return Promise.resolve({});
        },
      },
    };
    const service = createProjectManagementService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
        project: {
          findFirst: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      {
        indexProjects: (projects: unknown[]) => {
          indexed.push(...projects);
          return Promise.resolve();
        },
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    const project = await service.updateProject(
      {
        categories: ['utility'],
        color: ' #f97316 ',
        description: 'Updated body',
        gameVersions: ['1.21.6'],
        iconUrl: 'https://example.test/icon.png',
        loaders: ['fabric'],
        projectSlug: 'example',
        sourceUrl: 'https://example.test/source',
        summary: 'Updated summary',
        title: 'Updated Project',
      },
      'user-a',
    );

    expect(project.title).toBe('Updated Project');
    expect(project.color).toBe('#f97316');
    expect(project.owner?.username).toBe('creator');
    expect(project.organization?.slug).toBe('example-org');
    expect(operations[0]).toContain(
      '"iconUrl":"https://example.test/icon.png"',
    );
    expect(operations[0]).toContain('"color":"#f97316"');
    expect(operations).toContain(
      'categories-delete:{"where":{"projectId":"project-a"}}',
    );
    expect(operations).toContain(
      'versions-delete:{"where":{"projectId":"project-a"}}',
    );
    expect(operations).toContain(
      'loaders-delete:{"where":{"projectId":"project-a"}}',
    );
    expect(indexed[0]).toEqual(
      expect.objectContaining({
        color: '#f97316',
        id: 'project-a',
        title: 'Updated Project',
      }),
    );
  });

  test('updates managed project license and extra links', async () => {
    const operations: unknown[] = [];
    const tx = {
      license: {
        upsert: (query: unknown) => {
          operations.push({ licenseUpsert: query });
          return Promise.resolve({ id: 'license-apache' });
        },
      },
      project: {
        findUniqueOrThrow: () =>
          Promise.resolve(
            projectRow({
              license: {
                key: 'apache-2.0',
                name: 'Apache-2.0',
                url: 'https://example.test/license',
              },
              links: [
                {
                  kind: 'DONATION',
                  label: 'Sponsor',
                  url: 'https://example.test/sponsor',
                },
              ],
              title: 'Updated Project',
            }),
          ),
        update: (query: unknown) => {
          operations.push({ projectUpdate: query });
          return Promise.resolve({});
        },
      },
      projectLink: {
        create: (query: unknown) => {
          operations.push({ linkCreate: query });
          return Promise.resolve({});
        },
        deleteMany: (query: unknown) => {
          operations.push({ linkDelete: query });
          return Promise.resolve({});
        },
      },
    };
    const service = createProjectManagementService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
        project: {
          findFirst: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    const project = await service.updateProject(
      {
        licenseKey: ' Apache-2.0 ',
        licenseName: ' Apache-2.0 ',
        licenseUrl: ' https://example.test/license ',
        links: [
          {
            kind: 'donation',
            label: ' Sponsor ',
            url: ' https://example.test/sponsor ',
          },
        ],
        projectSlug: 'example',
      },
      'user-a',
    );

    expect(project.license).toEqual({
      id: 'apache-2.0',
      name: 'Apache-2.0',
      url: 'https://example.test/license',
    });
    expect(project.links).toContainEqual({
      kind: 'DONATION',
      label: 'Sponsor',
      url: 'https://example.test/sponsor',
    });
    expect(operations).toContainEqual({
      licenseUpsert: {
        create: {
          key: 'apache-2.0',
          name: 'Apache-2.0',
          url: 'https://example.test/license',
        },
        update: {
          name: 'Apache-2.0',
          url: 'https://example.test/license',
        },
        where: { key: 'apache-2.0' },
      },
    });
    expect(operations).toContainEqual({
      projectUpdate: {
        data: { license: { connect: { id: 'license-apache' } } },
        where: { id: 'project-a' },
      },
    });
    expect(operations).toContainEqual({
      linkDelete: { where: { projectId: 'project-a' } },
    });
    expect(operations).toContainEqual({
      linkCreate: {
        data: {
          kind: 'DONATION',
          label: 'Sponsor',
          projectId: 'project-a',
          url: 'https://example.test/sponsor',
        },
      },
    });
  });
});

function projectRow({
  gallery = [],
  license = { key: 'mit', name: 'MIT', url: null },
  links = [],
  moderationLock = null,
  status = 'APPROVED',
  title,
}: {
  gallery?: {
    createdAt: Date;
    description: string | null;
    displayUrl: string;
    featured: boolean;
    rawUrl: string;
    sortOrder: number;
    title: string | null;
  }[];
  license?: { key: string; name: string; url: string | null };
  links?: { kind: string; label: string | null; url: string }[];
  moderationLock?: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    moderator: {
      displayName: string | null;
      id: string;
      username: string;
    };
  } | null;
  status?: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'ARCHIVED';
  title: string;
}) {
  return {
    approvedAt:
      status === 'APPROVED' ? new Date('2026-01-01T00:00:00.000Z') : null,
    archivedAt:
      status === 'ARCHIVED' ? new Date('2026-01-01T00:00:00.000Z') : null,
    categories: [{ category: { slug: 'utility' } }],
    color: '#f97316',
    description: 'Updated body',
    discordUrl: null,
    downloads: 10,
    followers: 2,
    gallery,
    gameVersions: [{ gameVersion: { version: '1.21.6' } }],
    iconUrl: 'https://example.test/icon.png',
    id: 'project-a',
    issuesUrl: null,
    kind: 'MOD',
    license,
    links,
    loaders: [{ loader: 'FABRIC' }],
    moderationLock,
    organization: {
      color: '#1d9bf0',
      iconUrl: 'https://example.test/org.png',
      id: 'organization-a',
      name: 'Example Org',
      slug: 'example-org',
    },
    publishedAt: new Date('2025-12-15T00:00:00.000Z'),
    queuedAt:
      status === 'PENDING_REVIEW' ? new Date('2026-01-01T00:00:00.000Z') : null,
    requestedStatus: null,
    slug: 'example',
    sourceUrl: 'https://example.test/source',
    status,
    summary: 'Updated summary',
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
    title,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    wikiUrl: null,
  };
}
