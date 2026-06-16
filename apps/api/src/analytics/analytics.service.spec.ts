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
    const service = new AnalyticsService(
      { command: () => Promise.resolve() } as never,
      {
        downloadEvent: {
          count: ({ where }: { where: unknown }) =>
            Promise.resolve(
              JSON.stringify(where).includes('createdAt') ? 4 : 9,
            ),
          findMany: () =>
            Promise.resolve([
              { createdAt: new Date('2026-06-16T00:00:00.000Z') },
              { createdAt: new Date('2026-06-16T12:00:00.000Z') },
            ]),
        },
        project: {
          findUnique: () =>
            Promise.resolve({
              downloads: 99,
              id: 'project-a',
              slug: 'iris',
            }),
        },
        projectViewEvent: {
          count: ({ where }: { where: unknown }) =>
            Promise.resolve(
              JSON.stringify(where).includes('createdAt') ? 7 : 13,
            ),
          findMany: () =>
            Promise.resolve([
              { createdAt: new Date('2026-06-16T00:00:00.000Z') },
              { createdAt: new Date('2026-06-17T00:00:00.000Z') },
            ]),
        },
      } as unknown as PrismaService,
    );

    const summary = await service.projectAnalytics('iris');

    expect(summary?.downloadsLast30Days).toBe(4);
    expect(summary?.projectSlug).toBe('iris');
    expect(summary?.totalDownloads).toBe(99);
    expect(summary?.totalViews).toBe(13);
    expect(summary?.viewsLast30Days).toBe(7);
  });

  test('records download events and increments counters', async () => {
    const transactionCalls: unknown[] = [];
    const service = new AnalyticsService(
      { command: () => Promise.resolve() } as never,
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
  });

  test('records project view events by slug', async () => {
    const creates: unknown[] = [];
    const service = new AnalyticsService(
      { command: () => Promise.resolve() } as never,
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
  });
});
