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
      { delete: () => Promise.resolve() } as never,
      { updateProjectDownloads: () => Promise.resolve() } as never,
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
      { delete: () => Promise.resolve() } as never,
      { updateProjectDownloads: () => Promise.resolve() } as never,
    );

    const summary = await service.projectAnalytics('iris');

    expect(summary?.downloadsLast30Days).toBe(4);
    expect(summary?.days).toHaveLength(30);
    expect(summary?.projectSlug).toBe('iris');
    expect(summary?.totalDownloads).toBe(99);
    expect(summary?.totalViews).toBe(13);
    expect(summary?.viewsLast30Days).toBe(7);
    expect(queries).toHaveLength(2);
    expect(queries[1]).toMatchObject({
      query_params: {
        since: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/u,
        ),
      },
    });
  });

  test('records download events and increments counters', async () => {
    const deletedKeys: string[] = [];
    const searchUpdates: unknown[] = [];
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
            { downloads: 100, id: 'project-a', slug: 'iris' },
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
              url: 'https://files.example.test/iris.jar',
              version: {
                id: 'version-a',
                project: {
                  id: 'project-a',
                  status: 'APPROVED',
                },
                status: 'APPROVED',
              },
            }),
        },
      } as unknown as PrismaService,
      {
        delete: (key: string) => {
          deletedKeys.push(key);
          return Promise.resolve();
        },
      } as never,
      {
        updateProjectDownloads: (projectId: string, downloads: number) => {
          searchUpdates.push({ downloads, projectId });
          return Promise.resolve();
        },
      } as never,
    );

    const record = await service.recordDownload('file-a', {
      countryCode: 'US',
      userAgent: 'ModderyBrowser/1.0',
    });

    expect(transactionCalls[0]).toEqual([
      {
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true, slug: true },
        where: { id: 'project-a' },
      },
      {
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true },
        where: { id: 'version-a' },
      },
      {
        data: {
          countryCode: 'US',
          projectId: 'project-a',
          userAgent: 'ModderyBrowser/1.0',
          versionId: 'version-a',
        },
      },
    ]);
    expect(deletedKeys).toEqual(['catalog:project-by-slug:iris']);
    expect(searchUpdates).toEqual([{ downloads: 100, projectId: 'project-a' }]);
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
          country_code: 'US',
          event_type: 'download',
          occurred_at: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/u,
          ),
          project_id: 'project-a',
          user_agent: 'ModderyBrowser/1.0',
          version_id: 'version-a',
        },
      ],
    });
  });

  test('prepares public file downloads with a counted storage redirect URL', async () => {
    const service = new AnalyticsService(
      {
        command: () => Promise.resolve(),
        insert: () => Promise.resolve(),
      } as never,
      {
        $transaction: () =>
          Promise.resolve([
            { downloads: 100, id: 'project-a', slug: 'iris' },
            { downloads: 12, id: 'version-a' },
            { id: 'event-a' },
          ]),
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
              url: 'https://files.example.test/iris.jar',
              version: {
                id: 'version-a',
                project: {
                  id: 'project-a',
                  status: 'APPROVED',
                },
                status: 'APPROVED',
              },
            }),
        },
      } as unknown as PrismaService,
      { delete: () => Promise.resolve() } as never,
      { updateProjectDownloads: () => Promise.resolve() } as never,
    );

    const download = await service.prepareFileDownload('file-a');

    expect(download.url).toBe('https://files.example.test/iris.jar');
    expect(download.record).toEqual({
      fileId: 'file-a',
      projectDownloads: 100,
      projectId: 'project-a',
      versionDownloads: 12,
      versionId: 'version-a',
    });
  });

  test('rejects download analytics for non-public files', async () => {
    const service = new AnalyticsService(
      {
        command: () => Promise.resolve(),
      } as never,
      {
        $transaction: () => {
          throw new Error('Download counters should not update');
        },
        versionFile: {
          findUnique: () =>
            Promise.resolve({
              id: 'file-a',
              url: 'https://files.example.test/private.jar',
              version: {
                id: 'version-a',
                project: {
                  id: 'project-a',
                  status: 'APPROVED',
                },
                status: 'PENDING_REVIEW',
              },
            }),
        },
      } as unknown as PrismaService,
      { delete: () => Promise.resolve() } as never,
      { updateProjectDownloads: () => Promise.resolve() } as never,
    );

    let caught: unknown;
    try {
      await service.recordDownload('file-a');
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'File not found');
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
      { delete: () => Promise.resolve() } as never,
      { updateProjectDownloads: () => Promise.resolve() } as never,
    );

    const record = await service.recordProjectView('iris', {
      countryCode: 'CA',
      referrer: 'https://moddery.test/discover',
      userAgent: 'ModderyBrowser/2.0',
    });

    expect(creates[0]).toEqual({
      data: {
        countryCode: 'CA',
        projectId: 'project-a',
        referrer: 'https://moddery.test/discover',
        userAgent: 'ModderyBrowser/2.0',
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
          country_code: 'CA',
          event_type: 'view',
          occurred_at: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/u,
          ),
          project_id: 'project-a',
          user_agent: 'ModderyBrowser/2.0',
          version_id: null,
        },
      ],
    });
  });

  test('looks up project views through public projects only', async () => {
    const queries: unknown[] = [];
    const service = new AnalyticsService(
      {
        command: () => Promise.resolve(),
      } as never,
      {
        project: {
          findUnique: (query: unknown) => {
            queries.push(query);
            return Promise.resolve(null);
          },
        },
        projectViewEvent: {
          create: () => {
            throw new Error('Project view should not be recorded');
          },
        },
      } as unknown as PrismaService,
      { delete: () => Promise.resolve() } as never,
      { updateProjectDownloads: () => Promise.resolve() } as never,
    );

    let caught: unknown;
    try {
      await service.recordProjectView('queued-project');
    } catch (error: unknown) {
      caught = error;
    }

    expect(queries[0]).toEqual({
      select: {
        id: true,
        slug: true,
      },
      where: {
        slug: 'queued-project',
        status: 'APPROVED',
      },
    });
    expect(caught).toHaveProperty('message', 'Project not found');
  });
});
