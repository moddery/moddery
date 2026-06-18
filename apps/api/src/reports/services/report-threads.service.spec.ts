import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ReportThreadsService } from './report-threads.service.js';

describe(ReportThreadsService.name, () => {
  test('creates report threads on first read', async () => {
    const upserts: unknown[] = [];
    const service = new ReportThreadsService({
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
    const service = new ReportThreadsService({
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
});
