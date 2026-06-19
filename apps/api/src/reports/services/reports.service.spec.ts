import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ReportsService } from './reports.service.js';

function createReportsService(
  prisma: PrismaService,
  auditEvents: unknown[] = [],
) {
  return new ReportsService(
    {
      recordReportStateUpdate: (event: unknown) => {
        auditEvents.push(event);
        return Promise.resolve();
      },
    } as never,
    prisma,
  );
}

describe(ReportsService.name, () => {
  test('loads active moderation reports with reporter and project context', async () => {
    const queries: unknown[] = [];
    const service = createReportsService({
      report: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(8);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              body: 'Suspicious upload',
              closedAt: null,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              id: 'report-a',
              project: {
                id: 'project-a',
                kind: 'MOD',
                slug: 'iris',
                title: 'Iris',
              },
              projectId: 'project-a',
              reason: 'MALWARE',
              reporter: {
                displayName: 'Reporter',
                id: 'user-a',
                username: 'reporter',
              },
              state: 'OPEN',
              userTarget: null,
              userTargetId: null,
              version: {
                id: 'version-a',
                name: 'Iris 1.0.0',
                project: {
                  id: 'project-a',
                  kind: 'MOD',
                  slug: 'iris',
                  title: 'Iris',
                },
                versionNumber: '1.0.0',
              },
              versionId: null,
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const result = await service.findModerationReports({
      limit: 12,
      offset: 24,
    });

    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: { state: { in: ['OPEN', 'TRIAGED'] } },
      }),
    );
    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 24,
        take: 12,
        where: { state: { in: ['OPEN', 'TRIAGED'] } },
      }),
    );
    expect(result.totalHits).toBe(8);
    const reports = result.reports as {
      project: { slug: string } | null;
      reporter: { username: string };
      version: { project: { slug: string } } | null;
    }[];
    expect(reports[0]?.project?.slug).toBe('iris');
    expect(reports[0]?.reporter.username).toBe('reporter');
    expect(reports[0]?.version?.project.slug).toBe('iris');
  });

  test('loads the legacy moderation report list from search results', async () => {
    const queries: unknown[] = [];
    const service = createReportsService({
      report: {
        count: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(1);
        },
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              body: 'Suspicious upload',
              closedAt: null,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              id: 'report-a',
              project: null,
              projectId: null,
              reason: 'MALWARE',
              reporter: null,
              state: 'OPEN',
              userTarget: null,
              userTargetId: null,
              version: null,
              versionId: null,
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const reports = await service.findModerationReportList();

    expect(queries[1]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 50,
        where: { state: { in: ['OPEN', 'TRIAGED'] } },
      }),
    );
    expect(reports[0]?.id).toBe('report-a');
  });

  test('updates report state and closes reports with a timestamp', async () => {
    const updates: unknown[] = [];
    const auditEvents: unknown[] = [];
    const service = createReportsService(
      {
        $transaction: (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            report: {
              findUniqueOrThrow: () =>
                Promise.resolve({
                  id: 'report-a',
                  project: {
                    id: 'project-a',
                    slug: 'iris',
                    title: 'Iris',
                  },
                  reason: 'OTHER',
                  state: 'TRIAGED',
                  userTarget: null,
                  version: null,
                }),
              update: (query: unknown) => {
                updates.push(query);
                return Promise.resolve({
                  body: 'Resolved report',
                  closedAt: new Date('2026-01-02T00:00:00.000Z'),
                  createdAt: new Date('2026-01-01T00:00:00.000Z'),
                  id: 'report-a',
                  project: {
                    id: 'project-a',
                    kind: 'MOD',
                    slug: 'iris',
                    title: 'Iris',
                  },
                  projectId: 'project-a',
                  reason: 'OTHER',
                  reporter: {
                    displayName: null,
                    id: 'user-a',
                    username: 'reporter',
                  },
                  state: 'CLOSED',
                  userTarget: null,
                  userTargetId: null,
                  version: null,
                  versionId: null,
                });
              },
            },
          }),
      } as unknown as PrismaService,
      auditEvents,
    );

    const report = await service.updateReportState({
      actorId: 'moderator-a',
      id: 'report-a',
      state: 'CLOSED',
    });

    expect(updates[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          closedAt: expect.any(Date),
          state: 'CLOSED',
        }),
        where: { id: 'report-a' },
      }),
    );
    expect(auditEvents[0]).toEqual({
      actorId: 'moderator-a',
      after: {
        id: 'report-a',
        reason: 'OTHER',
        state: 'CLOSED',
        targetId: 'project-a',
        targetKind: 'PROJECT',
        targetLabel: 'Iris',
      },
      before: {
        id: 'report-a',
        reason: 'OTHER',
        state: 'TRIAGED',
        targetId: 'project-a',
        targetKind: 'PROJECT',
        targetLabel: 'Iris',
      },
    });
    expect(report.state).toBe('CLOSED');
    expect(report.closedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
  });

  test('creates project reports against existing projects', async () => {
    const creates: unknown[] = [];
    const lookups: unknown[] = [];
    const service = createReportsService({
      project: {
        findFirst: (query: unknown) => {
          lookups.push(query);
          return Promise.resolve({ id: 'project-a' });
        },
      },
      report: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({
            body: 'Broken file',
            closedAt: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'report-a',
            project: {
              id: 'project-a',
              kind: 'MOD',
              slug: 'iris',
              title: 'Iris',
            },
            projectId: 'project-a',
            reason: 'BROKEN_OR_MISLEADING',
            reporter: {
              displayName: null,
              id: 'user-a',
              username: 'reporter',
            },
            state: 'OPEN',
            userTarget: null,
            userTargetId: null,
            version: null,
            versionId: null,
          });
        },
      },
    } as unknown as PrismaService);

    const report = await service.createProjectReport({
      body: '  Broken file  ',
      projectSlug: 'iris',
      reason: 'BROKEN_OR_MISLEADING',
      reporterId: 'user-a',
    });

    expect(lookups[0]).toEqual({
      select: { id: true },
      where: { slug: 'iris', status: 'APPROVED' },
    });
    expect(creates[0]).toEqual({
      data: {
        body: 'Broken file',
        projectId: 'project-a',
        reason: 'BROKEN_OR_MISLEADING',
        reporterId: 'user-a',
      },
      select: expect.any(Object),
    });
    expect(report.project?.slug).toBe('iris');
    expect(report.reporter.username).toBe('reporter');
  });

  test('rejects invalid project report inputs before lookups', async () => {
    const service = createReportsService({
      project: {
        findFirst: () => {
          throw new Error('Project lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.createProjectReport({
        body: '        ',
        projectSlug: 'iris',
        reason: 'BROKEN_OR_MISLEADING',
        reporterId: 'user-a',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Report body is required');
  });

  test('rejects project reports against non-public projects', async () => {
    const service = createReportsService({
      project: {
        findFirst: () => Promise.resolve(null),
      },
      report: {
        create: () => {
          throw new Error('Report creation should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.createProjectReport({
        body: 'Broken file',
        projectSlug: 'queued-project',
        reason: 'BROKEN_OR_MISLEADING',
        reporterId: 'user-a',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project not found');
  });

  test('creates version reports against existing versions', async () => {
    const creates: unknown[] = [];
    const lookups: unknown[] = [];
    const service = createReportsService({
      report: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({
            body: 'Version crashes on launch',
            closedAt: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'report-a',
            project: null,
            projectId: null,
            reason: 'BROKEN_OR_MISLEADING',
            reporter: {
              displayName: null,
              id: 'user-a',
              username: 'reporter',
            },
            state: 'OPEN',
            userTarget: null,
            userTargetId: null,
            version: {
              id: 'version-a',
              name: 'Iris 1.0.0',
              project: {
                id: 'project-a',
                kind: 'MOD',
                slug: 'iris',
                title: 'Iris',
              },
              versionNumber: '1.0.0',
            },
            versionId: 'version-a',
          });
        },
      },
      version: {
        findFirst: (query: unknown) => {
          lookups.push(query);
          return Promise.resolve({ id: 'version-a' });
        },
      },
    } as unknown as PrismaService);

    const report = await service.createVersionReport({
      body: '  Version crashes on launch  ',
      reason: 'BROKEN_OR_MISLEADING',
      reporterId: 'user-a',
      versionId: 'version-a',
    });

    expect(lookups[0]).toEqual({
      select: { id: true },
      where: {
        id: 'version-a',
        project: { status: 'APPROVED' },
        status: 'APPROVED',
      },
    });
    expect(creates[0]).toEqual({
      data: {
        body: 'Version crashes on launch',
        reason: 'BROKEN_OR_MISLEADING',
        reporterId: 'user-a',
        versionId: 'version-a',
      },
      select: expect.any(Object),
    });
    expect(report.version?.project.slug).toBe('iris');
    expect(report.reporter.username).toBe('reporter');
  });

  test('rejects invalid version report targets before lookups', async () => {
    const service = createReportsService({
      version: {
        findFirst: () => {
          throw new Error('Version lookup should not run');
        },
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.createVersionReport({
        body: 'Version crashes on launch',
        reason: 'BROKEN_OR_MISLEADING',
        reporterId: 'user-a',
        versionId: ' ',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Version is required');
  });

  test('rejects version reports against non-public versions', async () => {
    const service = createReportsService({
      report: {
        create: () => {
          throw new Error('Report creation should not run');
        },
      },
      version: {
        findFirst: () => Promise.resolve(null),
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.createVersionReport({
        body: 'Version crashes on launch',
        reason: 'BROKEN_OR_MISLEADING',
        reporterId: 'user-a',
        versionId: 'queued-version',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Version not found');
  });

  test('creates user reports against existing users', async () => {
    const creates: unknown[] = [];
    const userLookups: unknown[] = [];
    const service = createReportsService({
      report: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({
            body: 'Impersonating staff',
            closedAt: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'report-a',
            project: null,
            projectId: null,
            reason: 'IMPERSONATION',
            reporter: {
              displayName: null,
              id: 'user-a',
              username: 'reporter',
            },
            state: 'OPEN',
            userTarget: {
              displayName: 'Target',
              id: 'user-b',
              username: 'target',
            },
            userTargetId: 'user-b',
            versionId: null,
          });
        },
      },
      user: {
        findFirst: (query: unknown) => {
          userLookups.push(query);
          return Promise.resolve({ id: 'user-b' });
        },
      },
    } as unknown as PrismaService);

    const report = await service.createUserReport({
      body: '  Impersonating staff  ',
      reason: 'IMPERSONATION',
      reporterId: 'user-a',
      username: ' Target ',
    });

    expect(userLookups[0]).toEqual({
      select: { id: true },
      where: { username: { equals: 'Target', mode: 'insensitive' } },
    });
    expect(creates[0]).toEqual({
      data: {
        body: 'Impersonating staff',
        reason: 'IMPERSONATION',
        reporterId: 'user-a',
        userTargetId: 'user-b',
      },
      select: expect.any(Object),
    });
    expect(report.userTarget?.username).toBe('target');
  });

  test('rejects self-reports', async () => {
    const service = createReportsService({
      user: {
        findFirst: () => Promise.resolve({ id: 'user-a' }),
      },
    } as unknown as PrismaService);

    let caught: unknown;
    try {
      await service.createUserReport({
        body: 'Impersonating staff',
        reason: 'IMPERSONATION',
        reporterId: 'user-a',
        username: 'reporter',
      });
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Cannot report yourself');
  });
});
