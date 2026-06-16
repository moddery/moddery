import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ReportsService } from './reports.service.js';

describe(ReportsService.name, () => {
  test('loads active moderation reports with reporter and project context', async () => {
    const queries: unknown[] = [];
    const service = new ReportsService({
      report: {
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            {
              body: 'Suspicious upload',
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              id: 'report-a',
              project: {
                id: 'project-a',
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
              userTargetId: null,
              versionId: null,
            },
          ]);
        },
      },
    } as unknown as PrismaService);

    const reports = await service.findModerationReports();

    expect(queries[0]).toEqual(
      expect.objectContaining({
        take: 50,
        where: { state: { in: ['OPEN', 'TRIAGED'] } },
      }),
    );
    expect(reports[0]?.project?.slug).toBe('iris');
    expect(reports[0]?.reporter.username).toBe('reporter');
  });

  test('updates report state and closes reports with a timestamp', async () => {
    const updates: unknown[] = [];
    const service = new ReportsService({
      report: {
        update: (query: unknown) => {
          updates.push(query);
          return Promise.resolve({
            body: 'Resolved report',
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
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'report-a',
            projectId: 'project-a',
            reason: 'BROKEN_OR_MISLEADING',
            state: 'OPEN',
            userTargetId: null,
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
    });
    expect(report.id).toBe('report-a');
  });
});
