import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectModerationService } from './project-moderation.service.js';

function createProjectModerationService(
  prisma: PrismaService,
  searchService: unknown,
  auditEvents: unknown[] = [],
  notifications: unknown[] = [],
  cacheDeletes: string[] = [],
) {
  return new ProjectModerationService(
    {
      recordProjectModeration: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    {
      sendUserNotification: (notification: unknown) => {
        notifications.push(notification);
        return Promise.resolve({});
      },
    } as never,
    prisma,
    searchService as never,
    fakeRedis(cacheDeletes),
  );
}

function fakeRedis(cacheDeletes: string[]) {
  return {
    delete: (key: string) => {
      cacheDeletes.push(key);
      return Promise.resolve();
    },
  } as never;
}

describe(ProjectModerationService.name, () => {
  test('loads projects awaiting moderation', async () => {
    const queries: unknown[] = [];
    const service = createProjectModerationService(
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
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) },
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
    const service = createProjectModerationService(
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
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) },
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
    const auditEvents: unknown[] = [];
    const transactionSteps: unknown[] = [];
    const indexed: unknown[] = [];
    const notifications: unknown[] = [];
    const service = createProjectModerationService(
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
          findUnique: () =>
            Promise.resolve(
              moderationProjectAuditRow({
                requestedStatus: 'APPROVED',
                status: 'PENDING_REVIEW',
                title: 'Queued',
              }),
            ),
        },
      } as unknown as PrismaService,
      {
        indexProjects: (projects: unknown[]) => {
          indexed.push(projects);
          return Promise.resolve();
        },
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
      auditEvents,
      notifications,
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
    expect(auditEvents[0]).toEqual({
      action: 'APPROVE',
      actorId: 'moderator-a',
      after: {
        id: 'project-a',
        projectKind: 'MOD',
        requestedStatus: null,
        slug: 'example',
        status: 'APPROVED',
        title: 'Ok',
      },
      before: {
        id: 'project-a',
        projectKind: 'MOD',
        requestedStatus: 'APPROVED',
        slug: 'example',
        status: 'PENDING_REVIEW',
        title: 'Queued',
      },
      reason: 'Looks good',
    });
    expect(notifications).toEqual([
      {
        actionUrl: '/dashboard#dashboard-projects',
        body: 'Queued was approved. Reason: Looks good',
        title: 'Project approved',
        type: 'moderation',
        userId: 'user-owner',
      },
    ]);
    expect(project.status).toBe('APPROVED');
  });

  test('removes rejected projects from public search', async () => {
    const deleted: string[] = [];
    const service = createProjectModerationService(
      {
        $transaction: (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            moderationAction: {
              create: () => Promise.resolve({}),
            },
            project: {
              findUniqueOrThrow: () =>
                Promise.resolve(
                  projectRow({ status: 'REJECTED', title: 'Rejected' }),
                ),
              update: () => Promise.resolve({}),
            },
          }),
        project: {
          findUnique: () =>
            Promise.resolve(
              moderationProjectAuditRow({
                requestedStatus: null,
                status: 'APPROVED',
                title: 'Public Project',
              }),
            ),
        },
      } as unknown as PrismaService,
      {
        deleteProject: (projectId: string) => {
          deleted.push(projectId);
          return Promise.resolve();
        },
        indexProjects: () => {
          throw new Error('Rejected projects should not be indexed');
        },
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
    );

    const project = await service.moderateProject(
      {
        action: 'reject',
        projectSlug: 'example',
        reason: 'Needs changes',
      },
      'moderator-a',
    );

    expect(project.status).toBe('REJECTED');
    expect(deleted).toEqual(['project-a']);
  });

  test('archives projects by removing public search records and cached slugs', async () => {
    const cacheDeletes: string[] = [];
    const deleted: string[] = [];
    const notifications: unknown[] = [];
    const transactionSteps: unknown[] = [];
    const service = createProjectModerationService(
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
                  projectRow({ status: 'ARCHIVED', title: 'Archived' }),
                ),
              update: (query: unknown) => {
                transactionSteps.push(query);
                return Promise.resolve({});
              },
            },
          }),
        project: {
          findUnique: () =>
            Promise.resolve(
              moderationProjectAuditRow({
                requestedStatus: null,
                status: 'APPROVED',
                title: 'Public Project',
              }),
            ),
        },
      } as unknown as PrismaService,
      {
        deleteProject: (projectId: string) => {
          deleted.push(projectId);
          return Promise.resolve();
        },
        indexProjects: () => {
          throw new Error('Archived projects should not be indexed');
        },
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
      [],
      notifications,
      cacheDeletes,
    );

    const project = await service.moderateProject(
      {
        action: 'archive',
        projectSlug: 'example',
        reason: 'Security issue',
      },
      'moderator-a',
    );

    expect(transactionSteps[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          archivedAt: expect.any(Date),
          requestedStatus: null,
          status: 'ARCHIVED',
        }),
        where: { id: 'project-a' },
      }),
    );
    expect(deleted).toEqual(['project-a']);
    expect(cacheDeletes).toEqual(['catalog:project-by-slug:example']);
    expect(notifications).toEqual([
      {
        actionUrl: '/dashboard#dashboard-projects',
        body: 'Public Project was archived. Reason: Security issue',
        title: 'Project archived',
        type: 'moderation',
        userId: 'user-owner',
      },
    ]);
    expect(project.status).toBe('ARCHIVED');
  });

  test('restores projects by indexing them and clearing cached slugs', async () => {
    const cacheDeletes: string[] = [];
    const indexed: unknown[] = [];
    const notifications: unknown[] = [];
    const transactionSteps: unknown[] = [];
    const service = createProjectModerationService(
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
                  projectRow({ status: 'APPROVED', title: 'Restored' }),
                ),
              update: (query: unknown) => {
                transactionSteps.push(query);
                return Promise.resolve({});
              },
            },
          }),
        project: {
          findUnique: () =>
            Promise.resolve(
              moderationProjectAuditRow({
                requestedStatus: null,
                status: 'ARCHIVED',
                title: 'Archived Project',
              }),
            ),
        },
      } as unknown as PrismaService,
      {
        deleteProject: () => {
          throw new Error(
            'Restored projects should not be deleted from search',
          );
        },
        indexProjects: (projects: unknown[]) => {
          indexed.push(projects);
          return Promise.resolve();
        },
        searchProjects: () => Promise.resolve({ ids: [], total: 0 }),
      },
      [],
      notifications,
      cacheDeletes,
    );

    const project = await service.moderateProject(
      {
        action: 'restore',
        projectSlug: 'example',
        reason: null,
      },
      'moderator-a',
    );

    expect(transactionSteps[0]).toEqual(
      expect.objectContaining({
        data: {
          archivedAt: null,
          requestedStatus: null,
          status: 'APPROVED',
        },
        where: { id: 'project-a' },
      }),
    );
    expect(indexed).toHaveLength(1);
    expect(indexed[0]).toEqual([
      expect.objectContaining({
        id: 'project-a',
        slug: 'example',
        title: 'Restored',
      }),
    ]);
    expect(cacheDeletes).toEqual(['catalog:project-by-slug:example']);
    expect(notifications).toEqual([
      {
        actionUrl: '/dashboard#dashboard-projects',
        body: 'Archived Project was restored.',
        title: 'Project restored',
        type: 'moderation',
        userId: 'user-owner',
      },
    ]);
    expect(project.status).toBe('APPROVED');
  });

  test('loads project moderation actions newest first with pagination', async () => {
    const queries: unknown[] = [];
    const service = createProjectModerationService(
      {
        moderationAction: {
          count: (query: unknown) => {
            queries.push({ count: query });
            return Promise.resolve(8);
          },
          findMany: (query: unknown) => {
            queries.push({ findMany: query });
            return Promise.resolve([moderationActionRow()]);
          },
        },
        project: {
          findUnique: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) },
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
    const service = createProjectModerationService(
      {
        moderationAction: {
          count: (query: unknown) => {
            queries.push({ count: query });
            return Promise.resolve(1);
          },
          findMany: (query: unknown) => {
            queries.push({ findMany: query });
            return Promise.resolve([moderationActionRow()]);
          },
        },
        project: {
          findUnique: () => Promise.resolve({ id: 'project-a' }),
        },
      } as unknown as PrismaService,
      { searchProjects: () => Promise.resolve({ ids: [], total: 0 }) },
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

function moderationProjectAuditRow({
  requestedStatus,
  status,
  title,
}: {
  requestedStatus: string | null;
  status: string;
  title: string;
}) {
  return {
    id: 'project-a',
    kind: 'MOD',
    requestedStatus,
    slug: 'example',
    status,
    team: {
      members: [{ userId: 'user-owner' }, { userId: 'user-owner' }],
    },
    title,
  };
}

function moderationActionRow() {
  return {
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
