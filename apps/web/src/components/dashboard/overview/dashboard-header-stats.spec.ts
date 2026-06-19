import { describe, expect, test } from 'bun:test';

import { dashboardHeaderStats } from './dashboard-header-stats.ts';

describe(dashboardHeaderStats.name, () => {
  test('uses authoritative dashboard counts for header stats', () => {
    expect(
      dashboardHeaderStats({
        followedProjectCount: 9,
        organizationCount: 12,
        projectCount: 7,
      }),
    ).toEqual({
      following: 9,
      organizations: 12,
      projects: 7,
    });
  });
});
