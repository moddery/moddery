import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ReportModerationNotesService } from './report-moderation-notes.service.js';

describe(ReportModerationNotesService.name, () => {
  test('loads project moderation notes with pagination', async () => {
    const queries: unknown[] = [];
    const service = new ReportModerationNotesService({
      moderationNote: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(6);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([
            moderationNoteRow({ projectId: 'project-a' }),
          ]);
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
      },
    } as unknown as PrismaService);

    const result = await service.findProjectModerationNotes('iris', {
      limit: 10,
      offset: 20,
    });

    expect(queries[0]).toEqual({
      count: { where: { projectId: 'project-a' } },
    });
    expect(queries[1]).toEqual({
      findMany: expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
        skip: 20,
        take: 10,
        where: { projectId: 'project-a' },
      }) as object,
    });
    expect(result.totalHits).toBe(6);
    expect(result.notes[0]?.projectId).toBe('project-a');
  });

  test('loads the legacy project moderation note list from note search results', async () => {
    const queries: unknown[] = [];
    const service = new ReportModerationNotesService({
      moderationNote: {
        count: () => Promise.resolve(1),
        findMany: (query: unknown) => {
          queries.push(query);
          return Promise.resolve([
            moderationNoteRow({ projectId: 'project-a' }),
          ]);
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
      },
    } as unknown as PrismaService);

    const notes = await service.findProjectModerationNoteList('iris');

    expect(queries[0]).toEqual(
      expect.objectContaining({
        skip: 0,
        take: 25,
        where: { projectId: 'project-a' },
      }),
    );
    expect(notes[0]?.projectId).toBe('project-a');
  });

  test('loads user moderation notes with pagination', async () => {
    const queries: unknown[] = [];
    const service = new ReportModerationNotesService({
      moderationNote: {
        count: (query: unknown) => {
          queries.push({ count: query });
          return Promise.resolve(4);
        },
        findMany: (query: unknown) => {
          queries.push({ findMany: query });
          return Promise.resolve([moderationNoteRow({ userId: 'user-b' })]);
        },
      },
      user: {
        findFirst: () => Promise.resolve({ id: 'user-b' }),
      },
    } as unknown as PrismaService);

    const result = await service.findUserModerationNotes('target', {
      limit: 5,
      offset: 10,
    });

    expect(queries[0]).toEqual({
      count: { where: { userId: 'user-b' } },
    });
    expect(queries[1]).toEqual({
      findMany: expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
        skip: 10,
        take: 5,
        where: { userId: 'user-b' },
      }) as object,
    });
    expect(result.totalHits).toBe(4);
    expect(result.notes[0]?.userId).toBe('user-b');
  });

  test('creates project moderation notes', async () => {
    const creates: unknown[] = [];
    const service = new ReportModerationNotesService({
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
    const service = new ReportModerationNotesService({
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
