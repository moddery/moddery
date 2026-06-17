import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../prisma/prisma.service.js';
import { AnalyticsService } from './analytics.service.js';

describe(AnalyticsService.name, () => {
  test('creates analytics table when ensuring schema', async () => {
    const commands: string[] = [];
    const service = new AnalyticsService(
      {
        command: ({ query }: { query: string }) => {
          commands.push(query);
          return Promise.resolve();
        },
      } as never,
      {} as PrismaService,
    );

    await service.ensureSchema();

    expect(commands[0]).toContain('CREATE TABLE IF NOT EXISTS project_events');
  });

  test('summarizes project analytics from event tables', async () => {
    const queries: unknown[] = [];
    const service = new AnalyticsService(
      {
        command: () => Promise.resolve(),
        query: (input: { query: string }) => {
          queries.push(input);
          const isDailyQuery = input.query.includes(
            'GROUP BY event_type, date',
          );
          return Promise.resolve({
            json: () =>
              Promise.resolve(
                isDailyQuery
                  ? [
                      {
                        date: '2026-06-16',
                        event_type: 'download',
                        events: '4',
                      },
                      { date: '2026-06-16', event_type: 'view', events: '2' },
                      { date: '2026-06-17', event_type: 'view', events: '5' },
                    ]
                  : [
                      { event_type: 'view', events: '13' },
                      { event_type: 'download', events: '44' },
                    ],
              ),
          });
        },
      } as never,
      {
        project: {
          findUnique: () =>
            Promise.resolve({
              downloads: 99,
              id: 'project-a',
              slug: 'iris',
            }),
        },
      } as unknown as PrismaService,
    );

    const summary = await service.projectAnalytics('iris');

    expect(summary?.downloadsLast30Days).toBe(4);
    expect(summary?.days).toHaveLength(30);
    expect(summary?.projectSlug).toBe('iris');
    expect(summary?.totalDownloads).toBe(99);
    expect(summary?.totalViews).toBe(13);
    expect(summary?.viewsLast30Days).toBe(7);
    expect(queries).toHaveLength(2);
  });

  test('records download events and increments counters', async () => {
    const transactionCalls: unknown[] = [];
    const inserts: unknown[] = [];
    const service = new AnalyticsService(
      {
        command: () => Promise.resolve(),
        insert: (input: unknown) => {
          inserts.push(input);
          return Promise.resolve();
        },
      } as never,
      {
        $transaction: (queries: unknown[]) => {
          transactionCalls.push(queries);
          return Promise.resolve([
            { downloads: 100, id: 'project-a' },
            { downloads: 12, id: 'version-a' },
            { id: 'event-a' },
          ]);
        },
        downloadEvent: {
          create: (query: unknown) => query,
        },
        project: {
          update: (query: unknown) => query,
        },
        version: {
          update: (query: unknown) => query,
        },
        versionFile: {
          findUnique: () =>
            Promise.resolve({
              id: 'file-a',
              version: {
                id: 'version-a',
                projectId: 'project-a',
              },
            }),
        },
      } as unknown as PrismaService,
    );

    const record = await service.recordDownload('file-a');

    expect(transactionCalls[0]).toEqual([
      {
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true },
        where: { id: 'project-a' },
      },
      {
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true },
        where: { id: 'version-a' },
      },
      {
        data: {
          projectId: 'project-a',
          versionId: 'version-a',
        },
      },
    ]);
    expect(record).toEqual({
      fileId: 'file-a',
      projectDownloads: 100,
      projectId: 'project-a',
      versionDownloads: 12,
      versionId: 'version-a',
    });
    expect(inserts[0]).toMatchObject({
      format: 'JSONEachRow',
      table: 'project_events',
      values: [
        {
          event_type: 'download',
          project_id: 'project-a',
          version_id: 'version-a',
        },
      ],
    });
  });

  test('records project view events by slug', async () => {
    const creates: unknown[] = [];
    const inserts: unknown[] = [];
    const service = new AnalyticsService(
      {
        command: () => Promise.resolve(),
        insert: (input: unknown) => {
          inserts.push(input);
          return Promise.resolve();
        },
      } as never,
      {
        project: {
          findUnique: () =>
            Promise.resolve({
              id: 'project-a',
              slug: 'iris',
            }),
        },
        projectViewEvent: {
          create: (query: unknown) => {
            creates.push(query);
            return Promise.resolve({ id: 'view-a' });
          },
        },
      } as unknown as PrismaService,
    );

    const record = await service.recordProjectView('iris');

    expect(creates[0]).toEqual({
      data: {
        projectId: 'project-a',
      },
    });
    expect(record).toEqual({
      projectId: 'project-a',
      projectSlug: 'iris',
    });
    expect(inserts[0]).toMatchObject({
      format: 'JSONEachRow',
      table: 'project_events',
      values: [
        {
          event_type: 'view',
          project_id: 'project-a',
          version_id: null,
        },
      ],
    });
  });
});
