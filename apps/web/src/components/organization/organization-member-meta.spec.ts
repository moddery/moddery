import { describe, expect, test } from 'bun:test';

import { organizationMemberPosition } from './organization-member-meta.ts';

describe(organizationMemberPosition.name, () => {
  test('formats organization member sort order as one-based position', () => {
    expect(organizationMemberPosition(0)).toBe('Position 1');
    expect(organizationMemberPosition(42)).toBe('Position 43');
    expect(organizationMemberPosition(1234)).toBe('Position 1,235');
  });
});
