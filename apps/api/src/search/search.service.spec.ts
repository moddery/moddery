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
});
