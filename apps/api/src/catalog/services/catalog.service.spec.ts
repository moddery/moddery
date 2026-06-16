import { describe, expect, test } from 'bun:test';

import { CatalogService } from './catalog.service.js';

describe(CatalogService.name, () => {
  test('filters projects by search text', () => {
    const service = new CatalogService();

    expect(service.findProjects({ search: 'sodium' })).toHaveLength(1);
  });
});
