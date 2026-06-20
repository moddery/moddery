import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectManagementService } from './project-management.service.js';

function createProjectManagementService(
  prisma: PrismaService,
  searchService: unknown,
  auditEvents: unknown[] = [],
) {
  const source = prisma as unknown as {
    user?: Record<string, unknown>;
  };

  return new ProjectManagementService(
    {
      recordPermissionDenied: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    {
      ...(prisma as object),
      user: {
        findUnique: () =>
          Promise.resolve({ emailVerifiedAt: new Date('2026-01-01') }),
        ...(source.user ?? {}),
      },
    } as unknown as PrismaService,
    searchService as never,
    {
      delete: () => Promise.resolve(),
    } as never,
  );
}

describe(ProjectManagementService.name, () => {
  test('creates a queued project with normalized metadata', async () => {
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
        create: (query: unknown) => {
          operations.push(`project-create:${JSON.stringify(query)}`);
          return Promise.resolve({ id: 'project-a' });
        },
        findUniqueOrThrow: () =>
          Promise.resolve(projectRow({ title: 'Created Project' })),
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
      team: {
        create: (query: unknown) => {
          operations.push(`team-create:${JSON.stringify(query)}`);
          return Promise.resolve({ id: 'team-a' });
        },
      },
    };
    const service = createProjectManagementService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
        license: {
          upsert: () => Promise.resolve({ id: 'license-unknown' }),
        },
        project: {
          findUnique: () => Promise.resolve(null),
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

    const project = await service.createProject(
      {
        categories: ['utility'],
        color: ' #1d9bf0 ',
        description: ' Created body ',
        gameVersions: ['1.21.6'],
        iconUrl: ' https://example.test/icon.png ',
        kind: 'MOD',
        loaders: ['fabric'],
        slug: 'Created Project',
        summary: ' Created summary ',
        title: ' Created Project ',
      },
      'user-a',
    );

    expect(project.title).toBe('Created Project');
    expect(operations[1]).toContain('"requestedStatus":"APPROVED"');
    expect(operations[1]).toContain('"slug":"created-project"');
    expect(operations[1]).toContain('"status":"PENDING_REVIEW"');
    expect(operations[1]).toContain(
      '"iconUrl":"https://example.test/icon.png"',
    );
    expect(operations[1]).toContain('"summary":"Created summary"');
    expect(indexed).toEqual([]);
  });

  test('requires verified email before creating projects', async () => {
    const service = createProjectManagementService(
      {
        $transaction: () => {
          throw new Error('Project transaction should not run');
        },
        project: {
          findUnique: () => {
            throw new Error('Project slug lookup should not run');
          },
        },
        user: {
          findUnique: () => Promise.resolve({ emailVerifiedAt: null }),
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.createProject(validCreateProjectInput(), 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Verified email required');
  });

  test('rejects duplicate project slugs before creating teams', async () => {
    const service = createProjectManagementService(
      {
        $transaction: () => {
          throw new Error('Project transaction should not run');
        },
        project: {
          findUnique: () => Promise.resolve({ id: 'project-existing' }),
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.createProject(validCreateProjectInput(), 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project slug already exists');
  });

  test('rejects incomplete project identity before database writes', async () => {
    const service = createProjectManagementService(
      {
        project: {
          findUnique: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.createProject(
        {
          ...validCreateProjectInput(),
          description: '   ',
          slug: '!!',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'Project slug must be at least 3 characters',
    );
  });

  test('rejects oversized project taxonomy before database writes', async () => {
    const service = createProjectManagementService(
      {
        project: {
          findUnique: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.createProject(
        {
          ...validCreateProjectInput(),
          categories: Array.from(
            { length: 13 },
            (_, index) => `category-${index.toString()}`,
          ),
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'A project can include at most 12 categories',
    );
  });

  test('rejects oversized project links before update lookups', async () => {
    const service = createProjectManagementService(
      {
        project: {
          findFirst: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.updateProject(
        {
          links: Array.from({ length: 17 }, (_, index) => ({
            kind: 'SOURCE',
            label: `Link ${index.toString()}`,
            url: `https://example.test/${index.toString()}`,
          })),
          projectSlug: 'example',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'A project can include at most 16 links',
    );
  });

  test('rejects missing project selectors before update lookups', async () => {
    const service = createProjectManagementService(
      {
        project: {
          findFirst: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.updateProject({ projectSlug: ' ' }, 'user-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project is required');
  });

  test('rejects blank project identity updates before database writes', async () => {
    const service = createProjectManagementService(
      {
        project: {
          findFirst: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      {
        indexProjects: () => Promise.resolve(),
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    let caught: unknown;
    try {
      await service.updateProject(
        {
          projectSlug: 'example',
          summary: ' ',
        },
        'user-a',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project summary is required');
  });

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

  test('removes non-approved managed project updates from search', async () => {
    const deleted: string[] = [];
    const service = createProjectManagementService(
      {
        $transaction: (callback: (transaction: unknown) => unknown) =>
          callback({
            project: {
              findUniqueOrThrow: () =>
                Promise.resolve(
                  projectRow({
                    status: 'REJECTED',
                    title: 'Rejected Project',
                  }),
                ),
              update: () => Promise.resolve({}),
            },
          }),
        project: {
          findFirst: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      {
        deleteProject: (projectId: string) => {
          deleted.push(projectId);
          return Promise.resolve();
        },
        indexProjects: () => {
          throw new Error('Rejected project updates should not be indexed');
        },
      },
    );

    const project = await service.updateProject(
      {
        projectSlug: 'example',
        summary: 'Updated rejected summary',
      },
      'user-a',
    );

    expect(project.status).toBe('REJECTED');
    expect(deleted).toEqual(['project-a']);
  });

  test('records denied update attempts against existing unmanaged projects', async () => {
    const auditEvents: unknown[] = [];
    const service = createProjectManagementService(
      {
        project: {
          findFirst: () => Promise.resolve(null),
          findUnique: () =>
            Promise.resolve({ id: 'project-a', slug: 'example' }),
        },
      } as unknown as PrismaService,
      {
        deleteProject: () => Promise.resolve(),
        indexProjects: () => Promise.resolve(),
      },
      auditEvents,
    );

    let caught: unknown;
    try {
      await service.updateProject(
        {
          projectSlug: ' example ',
          summary: 'Updated summary',
        },
        'user-b',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project not found');
    expect(auditEvents).toEqual([
      {
        actorId: 'user-b',
        attemptedAction: 'PROJECT_UPDATE',
        resource: {
          id: 'project-a',
          kind: 'PROJECT',
          slug: 'example',
        },
      },
    ]);
  });

  test('does not record denied update attempts for missing projects', async () => {
    const auditEvents: unknown[] = [];
    const service = createProjectManagementService(
      {
        project: {
          findFirst: () => Promise.resolve(null),
          findUnique: () => Promise.resolve(null),
        },
      } as unknown as PrismaService,
      {
        deleteProject: () => Promise.resolve(),
        indexProjects: () => Promise.resolve(),
      },
      auditEvents,
    );

    let caught: unknown;
    try {
      await service.updateProject(
        {
          projectSlug: 'missing-project',
          summary: 'Updated summary',
        },
        'user-b',
      );
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project not found');
    expect(auditEvents).toEqual([]);
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

function validCreateProjectInput() {
  return {
    categories: ['utility'],
    color: '#1d9bf0',
    description: 'Created body',
    gameVersions: ['1.21.6'],
    iconUrl: 'https://example.test/icon.png',
    kind: 'MOD' as const,
    loaders: ['fabric'],
    slug: 'created-project',
    summary: 'Created summary',
    title: 'Created Project',
  };
}

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
