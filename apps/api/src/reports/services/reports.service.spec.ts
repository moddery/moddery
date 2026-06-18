import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ReportsService } from './reports.service.js';

describe(ReportsService.name, () => {
  test('loads active moderation reports with reporter and project context', async () => {
    const queries: unknown[] = [];
    const service = new ReportsService({
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
    const service = new ReportsService({
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
    const service = new ReportsService({
      report: {
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({
            body: 'Resolved report',
            closedAt: new Date('2026-01-02T00:00:00.000Z'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'report-a',
            project: null,
            projectId: null,
            reason: 'OTHER',
            reporter: {
              displayName: null,
              id: 'user-a',
              username: 'reporter',
            },
            state: 'CLOSED',
            userTarget: null,
            userTargetId: null,
            versionId: null,
          });
        },
      },
    } as unknown as PrismaService);

    const report = await service.updateReportState({
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
    expect(report.state).toBe('CLOSED');
    expect(report.closedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
  });

  test('creates project reports against existing projects', async () => {
    const creates: unknown[] = [];
    const service = new ReportsService({
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
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

  test('creates version reports against existing versions', async () => {
    const creates: unknown[] = [];
    const service = new ReportsService({
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
        findUnique: () => Promise.resolve({ id: 'version-a' }),
      },
    } as unknown as PrismaService);

    const report = await service.createVersionReport({
      body: '  Version crashes on launch  ',
      reason: 'BROKEN_OR_MISLEADING',
      reporterId: 'user-a',
      versionId: 'version-a',
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

  test('creates user reports against existing users', async () => {
    const creates: unknown[] = [];
    const service = new ReportsService({
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
        findUnique: () => Promise.resolve({ id: 'user-b' }),
      },
    } as unknown as PrismaService);

    const report = await service.createUserReport({
      body: '  Impersonating staff  ',
      reason: 'IMPERSONATION',
      reporterId: 'user-a',
      username: 'target',
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
});
