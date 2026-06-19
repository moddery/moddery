import { describe, expect, test } from 'bun:test';

import { SearchService } from './search.service.js';

describe(SearchService.name, () => {
  test('skips empty project indexing batches', async () => {
    let called = false;
    const client = {
      helpers: {
        bulk: () => {
          called = true;
        },
      },
    };
    const service = new SearchService(client as never);

    await service.indexProjects([]);

    expect(called).toBe(false);
  });

  test('refreshes the project index after writes', async () => {
    const bulkCalls: unknown[] = [];
    const client = {
      helpers: {
        bulk: (options: unknown) => {
          bulkCalls.push(options);
          return Promise.resolve();
        },
      },
    };
    const service = new SearchService(client as never);

    await service.indexProjects([
      {
        categories: ['optimization'],
        color: null,
        description: 'Fast project',
        downloads: 1,
        followers: 2,
        gameVersions: ['1.21.6'],
        iconUrl: null,
        id: 'project-a',
        kind: 'MOD',
        licenseKey: 'MIT',
        loaders: ['fabric'],
        slug: 'project-a',
        summary: 'Fast',
        tags: ['kind:MOD'],
        title: 'Project A',
        titleSort: 'project a',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
    ]);

    expect(bulkCalls).toHaveLength(1);
    expect(bulkCalls[0]).toEqual(
      expect.objectContaining({ refreshOnCompletion: true }),
    );
  });

  test('updates project download counts with immediate refresh', async () => {
    const updates: unknown[] = [];
    const client = {
      update: (query: unknown) => {
        updates.push(query);
        return Promise.resolve();
      },
    };
    const service = new SearchService(client as never);

    await service.updateProjectDownloads('project-a', 42);

    expect(updates[0]).toEqual({
      body: {
        doc: { downloads: 42 },
      },
      id: 'project-a',
      index: 'projects',
      refresh: true,
    });
  });

  test('filters project search by tags', async () => {
    const searches: unknown[] = [];
    const client = {
      search: (query: unknown) => {
        searches.push(query);
        return Promise.resolve({
          body: {
            hits: {
              hits: [{ _id: 'project-a' }],
              total: { value: 23 },
            },
          },
        });
      },
    };
    const service = new SearchService(client as never);

    const result = await service.searchProjects({
      search: 'sodium',
      limit: 12,
      offset: 24,
      tags: ['kind:MOD', 'loader:fabric', 'category:optimization'],
    });

    expect(result).toEqual({ ids: ['project-a'], total: 23 });
    expect(searches[0]).toEqual(
      expect.objectContaining({
        body: expect.objectContaining({
          from: 24,
          query: {
            bool: {
              filter: [
                { term: { tags: 'kind:MOD' } },
                { term: { tags: 'loader:fabric' } },
                { term: { tags: 'category:optimization' } },
              ],
              must: [
                {
                  multi_match: {
                    fields: ['title^3', 'summary^2', 'description'],
                    query: 'sodium',
                  },
                },
              ],
            },
          },
          size: 12,
        }),
      }),
    );
  });
});
