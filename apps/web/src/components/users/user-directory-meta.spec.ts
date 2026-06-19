import { describe, expect, test } from 'bun:test';

import { userDirectoryMeta } from './user-directory-meta.ts';

describe('userDirectoryMeta', () => {
  test('formats creator directory counts with organizations', () => {
    expect(
      userDirectoryMeta(
        {
          collectionCount: 23,
          createdAt: '2026-06-01T00:00:00.000Z',
          friendCount: 9,
          organizationCount: 4,
          projectCount: 1200,
          username: 'mapmaker',
        },
        new Date('2026-06-18T00:00:00.000Z'),
      ),
    ).toBe(
      '@mapmaker · joined 17 days ago · 1,200 projects · 23 collections · 4 organizations · 9 friends',
    );
  });
});
