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
});
