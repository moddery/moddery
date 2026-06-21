import { describe, expect, test } from 'bun:test';

import {
  DEFAULT_DASHBOARD_SECTION,
  dashboardSectionItems,
  isDashboardSectionId,
} from './dashboardSectionItems.ts';

describe('dashboardSectionItems', () => {
  test('orders viewer sections with overview first and counts attached', () => {
    expect(
      dashboardSectionItems({
        canModerate: false,
        collectionCount: 3,
        organizationCount: 2,
        projectCount: 5,
      }).map(({ count, id, label }) => ({ count, id, label })),
    ).toEqual([
      { count: undefined, id: 'dashboard-overview', label: 'Overview' },
      { count: 5, id: 'dashboard-projects', label: 'Projects' },
      { count: 2, id: 'dashboard-content', label: 'Organizations' },
      { count: 3, id: 'dashboard-collections', label: 'Collections' },
      { count: undefined, id: 'dashboard-account', label: 'Account' },
      { count: undefined, id: 'dashboard-security', label: 'Security' },
    ]);
  });

  test('appends moderation only for moderators', () => {
    expect(
      dashboardSectionItems({
        canModerate: true,
        collectionCount: 0,
        organizationCount: 0,
        projectCount: 0,
      }).map((item) => item.id),
    ).toEqual([
      'dashboard-overview',
      'dashboard-projects',
      'dashboard-content',
      'dashboard-collections',
      'dashboard-account',
      'dashboard-security',
      'dashboard-moderation',
    ]);
  });

  test('every item carries an icon for the sidebar', () => {
    const items = dashboardSectionItems({
      canModerate: true,
      collectionCount: 0,
      organizationCount: 0,
      projectCount: 0,
    });

    const icons = new Set(items.map((item) => item.icon));
    expect(icons.size).toBeGreaterThanOrEqual(items.length - 1);
  });
});

describe(isDashboardSectionId.name, () => {
  test('accepts known section ids', () => {
    expect(isDashboardSectionId(DEFAULT_DASHBOARD_SECTION)).toBe(true);
    expect(isDashboardSectionId('dashboard-moderation')).toBe(true);
  });

  test('rejects unknown ids', () => {
    expect(isDashboardSectionId('')).toBe(false);
    expect(isDashboardSectionId('dashboard-unknown')).toBe(false);
    expect(isDashboardSectionId('projects')).toBe(false);
  });
});
