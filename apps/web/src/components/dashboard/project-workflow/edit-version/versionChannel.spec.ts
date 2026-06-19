import { describe, expect, test } from 'bun:test';

import {
  versionChannelFromDashboardVersion,
  versionSortOrderFieldValue,
  versionSortOrderFromField,
} from './versionChannel.ts';

describe(versionChannelFromDashboardVersion.name, () => {
  test('loads dashboard channels from selected versions', () => {
    expect(versionChannelFromDashboardVersion({ channel: 'BETA' })).toBe(
      'BETA',
    );
  });
});

describe(versionSortOrderFieldValue.name, () => {
  test('formats the selected version order for editing', () => {
    expect(versionSortOrderFieldValue({ sortOrder: 12 })).toBe('12');
  });
});

describe(versionSortOrderFromField.name, () => {
  test('parses numeric order input', () => {
    expect(versionSortOrderFromField('15')).toBe(15);
  });

  test('rejects invalid order input', () => {
    expect(() => versionSortOrderFromField('')).toThrow(
      'Version order must be a number',
    );
    expect(() => versionSortOrderFromField('not-a-number')).toThrow(
      'Version order must be a number',
    );
  });
});
