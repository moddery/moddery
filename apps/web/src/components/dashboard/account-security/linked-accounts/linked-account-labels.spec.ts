import { describe, expect, test } from 'bun:test';

import {
  linkedAccountAddedLabel,
  linkedAccountProviderLabel,
} from './linked-account-labels.ts';

describe(linkedAccountProviderLabel.name, () => {
  test('formats provider enum values for display', () => {
    expect(linkedAccountProviderLabel({ provider: 'GITHUB' })).toBe('GitHub');
    expect(linkedAccountProviderLabel({ provider: 'GOOGLE' })).toBe('Google');
  });
});

describe(linkedAccountAddedLabel.name, () => {
  test('summarizes when the account was linked', () => {
    expect(
      linkedAccountAddedLabel(
        { createdAt: '2026-06-18T16:00:00.000Z' },
        new Date('2026-06-18T18:00:00.000Z'),
      ),
    ).toBe('Linked 2 hours ago');
  });
});
