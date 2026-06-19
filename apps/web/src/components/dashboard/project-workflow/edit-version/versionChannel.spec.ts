import { describe, expect, test } from 'bun:test';

import {
  versionChannelFromProjectVersion,
  versionSortOrderFieldValue,
  versionSortOrderFromField,
} from './versionChannel.ts';

describe(versionChannelFromProjectVersion.name, () => {
  test('maps public version types into dashboard channels', () => {
    expect(versionChannelFromProjectVersion({ versionType: 'alpha' })).toBe(
      'ALPHA',
    );
    expect(versionChannelFromProjectVersion({ versionType: 'beta' })).toBe(
      'BETA',
    );
    expect(versionChannelFromProjectVersion({ versionType: 'release' })).toBe(
      'RELEASE',
    );
  });
});

describe(versionSortOrderFieldValue.name, () => {
  test('formats the selected version order for editing', () => {
    expect(versionSortOrderFieldValue({ sortOrder: 12 })).toBe('12');
    expect(versionSortOrderFieldValue(null)).toBe('0');
  });
});

describe(versionSortOrderFromField.name, () => {
  test('parses numeric order input with a zero fallback', () => {
    expect(versionSortOrderFromField('15')).toBe(15);
    expect(versionSortOrderFromField('')).toBe(0);
    expect(versionSortOrderFromField('not-a-number')).toBe(0);
  });
});
