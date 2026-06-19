import { describe, expect, test } from 'bun:test';

import {
  buildLicenseOptions,
  buildTagOptions,
  selectedLicensesToTags,
} from './discoverFilters.js';

describe(buildLicenseOptions.name, () => {
  test('builds sorted license filter options and preserves selected unknown values', () => {
    expect(
      buildLicenseOptions(
        [
          { key: 'zlib', name: 'Zlib', url: null },
          { key: 'mit', name: 'MIT', url: 'https://licenses.example.test/mit' },
        ],
        new Set(['custom']),
      ),
    ).toEqual([
      { value: 'custom' },
      {
        description: 'https://licenses.example.test/mit',
        label: 'MIT',
        value: 'mit',
      },
      { description: null, label: 'Zlib', value: 'zlib' },
    ]);
  });
});

describe(buildTagOptions.name, () => {
  test('keeps the generic tags panel limited to project category tags', () => {
    expect(
      buildTagOptions({
        categories: [
          {
            description: null,
            name: 'Optimization',
            projectKind: 'MOD',
            slug: 'optimization',
          },
          {
            description: null,
            name: 'Fabric',
            projectKind: 'MOD',
            slug: 'fabric',
          },
        ],
      }),
    ).toEqual([
      {
        description: null,
        kind: 'category',
        label: 'Optimization',
        value: 'optimization',
      },
    ]);
  });
});

describe(selectedLicensesToTags.name, () => {
  test('formats selected licenses as OpenSearch tags', () => {
    expect(selectedLicensesToTags(new Set(['mit', 'apache-2.0']))).toEqual([
      'license:mit',
      'license:apache-2.0',
    ]);
  });
});
