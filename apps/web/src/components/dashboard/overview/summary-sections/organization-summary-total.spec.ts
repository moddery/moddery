import { describe, expect, test } from 'bun:test';

import { organizationSummaryTotal } from './organization-summary-total.ts';

describe(organizationSummaryTotal.name, () => {
  test('uses the authoritative dashboard organization count', () => {
    expect(organizationSummaryTotal({ organizationCount: 12 })).toBe(12);
  });
});
