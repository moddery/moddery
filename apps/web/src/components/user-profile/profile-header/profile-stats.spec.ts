import { describe, expect, test } from 'bun:test';

import { profileStatCounts } from './profile-stats.ts';

describe('profileStatCounts', () => {
  test('includes organization counts with the public profile totals', () => {
    expect(
      profileStatCounts({
        collectionCount: 3,
        followedProjectCount: 11,
        friendCount: 5,
        organizationCount: 2,
        projectCount: 7,
      }),
    ).toEqual({
      collections: 3,
      following: 11,
      friends: 5,
      organizations: 2,
      projects: 7,
    });
  });
});
