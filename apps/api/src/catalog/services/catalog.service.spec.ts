import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';

describe(CatalogService.name, () => {
  test('searches projects through OpenSearch tags before hydrating rows', async () => {
    const queries: unknown[] = [];
    const searchQueries: unknown[] = [];
    const service = new CatalogService(
      {
        project: {
          findMany: (query: unknown) => {
            queries.push(query);
            return Promise.resolve([]);
          },
        },
      } as unknown as PrismaService,
      {
        searchProjects: (query: unknown) => {
          searchQueries.push(query);
          return Promise.resolve({ ids: ['project-a'] });
        },
      } as never,
    );

    await service.findProjects({
      loader: 'fabric',
      search: 'sodium',
      tags: ['kind:MOD', 'category:optimization'],
    });

    expect(searchQueries).toEqual([
      {
        search: 'sodium',
        sort: undefined,
        tags: ['kind:MOD', 'category:optimization', 'loader:fabric'],
      },
    ]);
    expect(queries).toHaveLength(1);
    expect(queries[0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['project-a'] },
          status: 'APPROVED',
        }),
      }),
    );
  });
});
