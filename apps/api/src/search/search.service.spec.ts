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
