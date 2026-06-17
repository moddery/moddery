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
              closedAt: null,
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
              userTarget: null,
              userTargetId: null,
              version: {
                id: 'version-a',
                name: 'Iris 1.0.0',
                project: {
                  id: 'project-a',
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

    const reports = await service.findModerationReports();

    expect(queries[0]).toEqual(
      expect.objectContaining({
        take: 50,
        where: { state: { in: ['OPEN', 'TRIAGED'] } },
      }),
    );
    expect(reports[0]?.project?.slug).toBe('iris');
    expect(reports[0]?.reporter.username).toBe('reporter');
    expect(reports[0]?.version?.project.slug).toBe('iris');
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
            projectId: 'project-a',
            reason: 'BROKEN_OR_MISLEADING',
            state: 'OPEN',
            userTarget: null,
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

  test('creates report threads on first read', async () => {
    const upserts: unknown[] = [];
    const service = new ReportsService({
      report: {
        findUnique: () => Promise.resolve({ id: 'report-a' }),
      },
      thread: {
        upsert: (query: unknown) => {
          upserts.push(query);
          return Promise.resolve({
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'thread-a',
            members: [],
            messages: [],
            reportId: 'report-a',
            subject: 'Report report-a',
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          });
        },
      },
    } as unknown as PrismaService);

    const thread = await service.findReportThread('report-a');

    expect(upserts[0]).toEqual(
      expect.objectContaining({
        create: {
          reportId: 'report-a',
          subject: 'Report report-a',
        },
        where: { reportId: 'report-a' },
      }),
    );
    expect(thread.messages).toEqual([]);
  });

  test('creates report thread messages', async () => {
    const messageCreates: unknown[] = [];
    const memberUpserts: unknown[] = [];
    const service = new ReportsService({
      report: {
        findUnique: () => Promise.resolve({ id: 'report-a' }),
      },
      thread: {
        findUniqueOrThrow: () =>
          Promise.resolve({
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'thread-a',
            members: [
              {
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                lastReadAt: new Date('2026-01-01T00:05:00.000Z'),
                user: {
                  displayName: 'Moderator',
                  id: 'user-a',
                  username: 'moderator',
                },
              },
            ],
            messages: [
              {
                author: {
                  displayName: 'Moderator',
                  id: 'user-a',
                  username: 'moderator',
                },
                body: 'We are checking this.',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                id: 'message-a',
              },
            ],
            reportId: 'report-a',
            subject: 'Report report-a',
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
        upsert: () => Promise.resolve({ id: 'thread-a' }),
      },
      threadMember: {
        upsert: (query: unknown) => {
          memberUpserts.push(query);
          return Promise.resolve({});
        },
      },
      threadMessage: {
        create: (query: unknown) => {
          messageCreates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const thread = await service.createReportThreadMessage({
      authorId: 'user-a',
      body: '  We are checking this.  ',
      reportId: 'report-a',
    });

    expect(messageCreates[0]).toEqual({
      data: {
        authorId: 'user-a',
        body: 'We are checking this.',
        threadId: 'thread-a',
      },
    });
    expect(memberUpserts[0]).toEqual(
      expect.objectContaining({
        where: {
          threadId_userId: {
            threadId: 'thread-a',
            userId: 'user-a',
          },
        },
      }),
    );
    expect(thread.messages[0]?.body).toBe('We are checking this.');
    expect(thread.members[0]?.user.username).toBe('moderator');
  });

  test('creates project moderation notes', async () => {
    const creates: unknown[] = [];
    const service = new ReportsService({
      moderationNote: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve(moderationNoteRow({ projectId: 'project-a' }));
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
      },
    } as unknown as PrismaService);

    const note = await service.createProjectModerationNote({
      authorId: 'moderator-a',
      body: '  Needs license review.  ',
      projectSlug: 'iris',
    });

    expect(creates[0]).toEqual({
      data: {
        authorId: 'moderator-a',
        body: 'Needs license review.',
        projectId: 'project-a',
      },
      select: expect.any(Object),
    });
    expect(note.projectId).toBe('project-a');
  });

  test('creates user moderation notes', async () => {
    const creates: unknown[] = [];
    const service = new ReportsService({
      moderationNote: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve(moderationNoteRow({ userId: 'user-b' }));
        },
      },
      user: {
        findFirst: () => Promise.resolve({ id: 'user-b' }),
      },
    } as unknown as PrismaService);

    const note = await service.createUserModerationNote({
      authorId: 'moderator-a',
      body: '  Prior warning on file.  ',
      username: 'target',
    });

    expect(creates[0]).toEqual({
      data: {
        authorId: 'moderator-a',
        body: 'Prior warning on file.',
        userId: 'user-b',
      },
      select: expect.any(Object),
    });
    expect(note.userId).toBe('user-b');
  });
});

function moderationNoteRow({
  projectId = null,
  userId = null,
}: {
  projectId?: string | null;
  userId?: string | null;
}) {
  return {
    author: {
      displayName: 'Moderator',
      id: 'moderator-a',
      username: 'moderator',
    },
    body: 'Needs review.',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 'note-a',
    projectId,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId,
  };
}
