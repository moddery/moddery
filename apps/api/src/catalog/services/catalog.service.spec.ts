import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';

describe(CatalogService.name, () => {
  test('adds gallery images to managed projects', async () => {
    const creates: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findFirst: () => Promise.resolve({ id: 'project-a' }),
          findUniqueOrThrow: () =>
            Promise.resolve(
              projectRow({
                gallery: [
                  {
                    createdAt: new Date('2026-01-02T00:00:00.000Z'),
                    description: 'Preview',
                    displayUrl: 'https://example.test/display.png',
                    featured: true,
                    rawUrl: 'https://example.test/raw.png',
                    sortOrder: 1,
                    title: 'Screenshot',
                  },
                ],
                title: 'Example',
              }),
            ),
        },
        projectGalleryImage: {
          create: (query: unknown) => {
            creates.push(query);
            return Promise.resolve({});
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const project = await service.addProjectGalleryImage(
      {
        description: ' Preview ',
        displayUrl: ' https://example.test/display.png ',
        featured: true,
        projectSlug: 'example',
        rawUrl: ' https://example.test/raw.png ',
        sortOrder: 1,
        title: ' Screenshot ',
      },
      'user-a',
    );

    expect(creates[0]).toEqual({
      data: {
        description: 'Preview',
        displayUrl: 'https://example.test/display.png',
        featured: true,
        projectId: 'project-a',
        rawUrl: 'https://example.test/raw.png',
        sortOrder: 1,
        title: 'Screenshot',
      },
    });
    expect(project.gallery[0]?.title).toBe('Screenshot');
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
    const service = new CatalogService(
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
      } as never,
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
    const service = new CatalogService(
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
      } as never,
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

  test('searches projects through OpenSearch tags before hydrating rows', async () => {
    const queries: unknown[] = [];
    const searchQueries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([]);
          },
        },
      } as unknown as PrismaService,
      {
        searchProjects: (query: unknown) => {
          searchQueries.push(query);
          return Promise.resolve({ ids: ['project-a'], total: 14 });
        },
      } as never,
    );

    const result = await service.searchProjects({
      limit: 25,
      loader: 'fabric',
      offset: 50,
      search: 'sodium',
      tags: ['kind:MOD', 'category:optimization'],
    });

    expect(searchQueries).toEqual([
      {
        limit: 25,
        offset: 50,
        search: 'sodium',
        sort: undefined,
        tags: ['kind:MOD', 'category:optimization', 'loader:fabric'],
      },
    ]);
    expect(result).toEqual({ projects: [], totalHits: 14 });
    expect(queries).toHaveLength(1);
    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['project-a'] },
          status: 'APPROVED',
        }),
      }),
    );
  });

  test('loads viewer followed projects newest first', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        projectFollow: {
          count: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(9);
          },
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([
              { project: projectRow({ title: 'Followed Project' }) },
            ]);
          },
        },
      } as unknown as PrismaService,
      {
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      } as never,
    );

    const result = await service.findViewerFollowedProjects('user-a', {
      limit: 12,
      offset: 24,
    });

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: {
          project: { status: 'APPROVED' },
          userId: 'user-a',
        },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        skip: 24,
        take: 12,
        where: {
          project: { status: 'APPROVED' },
          userId: 'user-a',
        },
      }),
    );
    expect(result.totalHits).toBe(9);
    const projects = result.projects;
    expect(projects[0]?.title).toBe('Followed Project');
  });

  test('loads the legacy viewer followed project list from search results', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        projectFollow: {
          count: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(1);
          },
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([
              { project: projectRow({ title: 'Followed Project' }) },
            ]);
          },
        },
      } as unknown as PrismaService,
      {
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      } as never,
    );

    const projects = await service.findViewerFollowedProjectList('user-a');

    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 50,
        where: {
          project: { status: 'APPROVED' },
          userId: 'user-a',
        },
      }),
    );
    expect(projects[0]?.title).toBe('Followed Project');
  });

  test('loads project team members by project slug', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
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
            return Promise.resolve([
              {
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
              },
            ]);
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

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
    const service = new CatalogService(
      {
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
              {
                acceptedAt: null,
                isOwner: false,
                permissions: ['MANAGE_VERSIONS'],
                role: 'Maintainer',
                sortOrder: 3,
                user: {
                  avatarUrl: null,
                  displayName: null,
                  id: 'user-b',
                  username: 'maintainer',
                },
              },
            ]);
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

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
    expect(result.members).toEqual([
      {
        accepted: false,
        owner: false,
        permissions: ['MANAGE_VERSIONS'],
        role: 'Maintainer',
        sortOrder: 3,
        user: {
          avatarUrl: null,
          displayName: null,
          id: 'user-b',
          username: 'maintainer',
        },
      },
    ]);
  });

  test('loads viewer project follow state', async () => {
    const service = new CatalogService(
      {
        project: {
          findUnique: () =>
            Promise.resolve({
              followers: 7,
              follows: [{ userId: 'user-a' }],
              slug: 'iris',
            }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const state = await service.findViewerProjectFollowState('iris', 'user-a');

    expect(state).toEqual({
      followers: 7,
      following: true,
      projectSlug: 'iris',
    });
  });

  test('follows a project and reconciles follower count', async () => {
    const operations: string[] = [];
    const tx = {
      project: {
        findUniqueOrThrow: () => {
          operations.push('find-project');
          return Promise.resolve({ id: 'project-a', slug: 'iris' });
        },
        update: (query: unknown) => {
          operations.push(`update:${JSON.stringify(query)}`);
          return Promise.resolve();
        },
      },
      projectFollow: {
        count: () => {
          operations.push('count-follows');
          return Promise.resolve(8);
        },
        upsert: (query: unknown) => {
          operations.push(`upsert:${JSON.stringify(query)}`);
          return Promise.resolve();
        },
      },
    };
    const service = new CatalogService(
      {
        $transaction: (callback: (transaction: typeof tx) => unknown) =>
          callback(tx),
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const state = await service.followProject('iris', 'user-a');

    expect(state).toEqual({
      followers: 8,
      following: true,
      projectSlug: 'iris',
    });
    expect(operations).toEqual([
      'find-project',
      'upsert:{"create":{"projectId":"project-a","userId":"user-a"},"update":{},"where":{"userId_projectId":{"projectId":"project-a","userId":"user-a"}}}',
      'count-follows',
      'update:{"data":{"followers":8},"where":{"id":"project-a"}}',
    ]);
  });

  test('adds project team members for managers', async () => {
    const notifications: unknown[] = [];
    const upserts: unknown[] = [];
    const service = new CatalogService(
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
          findMany: () => Promise.resolve(projectMembersRow().team.members),
          upsert: (query: unknown) => {
            upserts.push(query);
            return Promise.resolve({});
          },
        },
        user: {
          findFirst: () => Promise.resolve({ id: 'user-b' }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
      {
        sendUserNotification: (input: unknown) => {
          notifications.push(input);
          return Promise.resolve({});
        },
      } as never,
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
      actionUrl: '/dashboard',
      body: 'You were invited to collaborate on Iris.',
      title: 'Team invitation for Iris',
      type: 'team',
      userId: 'user-b',
    });
    expect(members[0]?.role).toBe('Owner');
  });

  test('removes non-owner project team members for managers', async () => {
    const deletes: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findFirst: () =>
            Promise.resolve({
              id: 'project-a',
              teamId: 'team-a',
            }),
          findUnique: () => Promise.resolve({ teamId: 'team-a' }),
        },
        teamMember: {
          count: () => Promise.resolve(1),
          delete: (query: unknown) => {
            deletes.push(query);
            return Promise.resolve({});
          },
          findMany: () => Promise.resolve(projectMembersRow().team.members),
          findFirst: () =>
            Promise.resolve({
              id: 'member-b',
              isOwner: false,
              user: { username: 'maintainer' },
            }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const members = await service.removeProjectTeamMember(
      {
        projectSlug: 'iris',
        username: 'maintainer',
      },
      'user-a',
    );

    expect(deletes[0]).toEqual({ where: { id: 'member-b' } });
    expect(members[0]?.owner).toBe(true);
  });

  test('loads projects awaiting moderation', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          count: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(6);
          },
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([
              projectRow({ status: 'PENDING_REVIEW', title: 'Queued' }),
            ]);
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const result = await service.findProjectsForModeration({
      limit: 10,
      offset: 20,
    });

    expect(queries[0]).toEqual({
      where: {
        status: { in: ['PENDING_REVIEW', 'REJECTED', 'ARCHIVED'] },
      },
    });
    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 20,
        take: 10,
        where: {
          status: { in: ['PENDING_REVIEW', 'REJECTED', 'ARCHIVED'] },
        },
      }),
    );
    expect(result.totalHits).toBe(6);
    expect(result.projects[0]?.status).toBe('PENDING_REVIEW');
  });

  test('loads the legacy project moderation list from search results', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          count: () => Promise.resolve(1),
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([
              projectRow({ status: 'PENDING_REVIEW', title: 'Queued' }),
            ]);
          },
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const projects = await service.findProjectModerationList();

    expect(queries[0]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 50,
        where: {
          status: { in: ['PENDING_REVIEW', 'REJECTED', 'ARCHIVED'] },
        },
      }),
    );
    expect(projects[0]?.status).toBe('PENDING_REVIEW');
  });

  test('approves projects and records moderation actions', async () => {
    const transactionSteps: unknown[] = [];
    const indexed: unknown[] = [];
    const service = new CatalogService(
      {
        $transaction: (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            moderationAction: {
              create: (query: unknown) => {
                transactionSteps.push(query);
                return Promise.resolve({});
              },
            },
            project: {
              findUniqueOrThrow: () =>
                Promise.resolve(
                  projectRow({ status: 'APPROVED', title: 'Ok' }),
                ),
              update: (query: unknown) => {
                transactionSteps.push(query);
                return Promise.resolve({});
              },
            },
          }),
        project: {
          findUnique: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      {
        indexProjects: (projects: unknown[]) => {
          indexed.push(projects);
          return Promise.resolve();
        },
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      } as never,
    );

    const project = await service.moderateProject(
      {
        action: 'approve',
        projectSlug: 'example',
        reason: 'Looks good',
      },
      'moderator-a',
    );

    expect(transactionSteps[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          requestedStatus: null,
          status: 'APPROVED',
        }),
        where: { id: 'project-a' },
      }),
    );
    expect(transactionSteps[1]).toEqual({
      data: {
        kind: 'APPROVE',
        moderatorId: 'moderator-a',
        projectId: 'project-a',
        reason: 'Looks good',
      },
    });
    expect(indexed).toHaveLength(1);
    expect(project.status).toBe('APPROVED');
  });

  test('locks projects for moderator review', async () => {
    const upserts: unknown[] = [];
    const service = new CatalogService(
      {
        moderationLock: {
          upsert: (query: unknown) => {
            upserts.push(query);
            return Promise.resolve({});
          },
        },
        project: {
          findUnique: () => Promise.resolve({ id: 'project-a' }),
          findUniqueOrThrow: () =>
            Promise.resolve(
              projectRow({
                moderationLock: moderationLockRow(),
                status: 'PENDING_REVIEW',
                title: 'Queued',
              }),
            ),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const project = await service.lockProjectForModeration(
      'example',
      'moderator-a',
    );

    expect(upserts[0]).toEqual(
      expect.objectContaining({
        create: expect.objectContaining({
          moderatorId: 'moderator-a',
          projectId: 'project-a',
        }),
        update: expect.objectContaining({
          moderatorId: 'moderator-a',
        }),
        where: { projectId: 'project-a' },
      }),
    );
    expect(project.moderationLock?.moderator.username).toBe('moderator');
  });

  test('releases project moderation locks owned by the moderator', async () => {
    const deletes: unknown[] = [];
    const service = new CatalogService(
      {
        moderationLock: {
          deleteMany: (query: unknown) => {
            deletes.push(query);
            return Promise.resolve({ count: 1 });
          },
        },
        project: {
          findUnique: () =>
            Promise.resolve({
              id: 'project-a',
              moderationLock: { moderatorId: 'moderator-a' },
            }),
          findUniqueOrThrow: () =>
            Promise.resolve(
              projectRow({ status: 'PENDING_REVIEW', title: 'Queued' }),
            ),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const project = await service.releaseProjectModerationLock(
      'example',
      'moderator-a',
    );

    expect(deletes[0]).toEqual({ where: { projectId: 'project-a' } });
    expect(project.moderationLock).toBeNull();
  });

  test('loads project moderation actions newest first with pagination', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        moderationAction: {
          count: (query: unknown) => {
            queries.push({ count: query });
            return Promise.resolve(8);
          },
          findMany: (query: unknown) => {
            queries.push({ findMany: query });
            return Promise.resolve([
              {
                createdAt: new Date('2026-01-03T00:00:00.000Z'),
                id: 'action-a',
                kind: 'APPROVE',
                moderator: {
                  displayName: 'Admin',
                  id: 'user-a',
                  username: 'admin',
                },
                projectId: 'project-a',
                reason: 'Clean release',
              },
            ]);
          },
        },
        project: {
          findUnique: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const result = await service.findProjectModerationActions('example', {
      limit: 10,
      offset: 20,
    });

    expect(queries[0]).toEqual({
      count: { where: { projectId: 'project-a' } },
    });
    expect(queries[1]).toEqual({
      findMany: {
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          id: true,
          kind: true,
          moderator: {
            select: {
              displayName: true,
              id: true,
              username: true,
            },
          },
          projectId: true,
          reason: true,
        },
        skip: 20,
        take: 10,
        where: { projectId: 'project-a' },
      },
    });
    expect(result.totalHits).toBe(8);
    expect(result.actions.at(0)?.id).toBe('action-a');
    expect(result.actions.at(0)?.kind).toBe('APPROVE');
    expect(result.actions.at(0)?.reason).toBe('Clean release');
  });

  test('loads the legacy project moderation action list from search results', async () => {
    const queries: unknown[] = [];
    const service = new CatalogService(
      {
        moderationAction: {
          count: (query: unknown) => {
            queries.push({ count: query });
            return Promise.resolve(1);
          },
          findMany: (query: unknown) => {
            queries.push({ findMany: query });
            return Promise.resolve([
              {
                createdAt: new Date('2026-01-03T00:00:00.000Z'),
                id: 'action-a',
                kind: 'APPROVE',
                moderator: {
                  displayName: 'Admin',
                  id: 'user-a',
                  username: 'admin',
                },
                projectId: 'project-a',
                reason: 'Clean release',
              },
            ]);
          },
        },
        project: {
          findUnique: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) } as never,
    );

    const actions = await service.findProjectModerationActionList('example');

    expect(queries[1]).toEqual(
      expect.objectContaining({
        findMany: expect.objectContaining({
          skip: 0,
          take: 25,
          where: { projectId: 'project-a' },
        }),
      }),
    );
    expect(actions.at(0)?.id).toBe('action-a');
  });
});

function projectMembersRow() {
  return {
    team: {
      members: [
        {
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
        },
      ],
    },
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
  moderationLock?: ReturnType<typeof moderationLockRow> | null;
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

function moderationLockRow() {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    expiresAt: new Date('2026-01-01T00:30:00.000Z'),
    id: 'lock-a',
    moderator: {
      displayName: 'Moderator',
      id: 'moderator-a',
      username: 'moderator',
    },
  };
}
