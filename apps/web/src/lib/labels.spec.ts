import { describe, expect, test } from 'bun:test';

import { enumLabel } from './labels.ts';

describe(enumLabel.name, () => {
  test('formats enum and slug strings for display', () => {
    expect(enumLabel('PROJECT_APPROVED')).toBe('Project Approved');
    expect(enumLabel('not_ready')).toBe('Not Ready');
    expect(enumLabel('email-delivery')).toBe('Email Delivery');
    expect(enumLabel(' already read ')).toBe('Already Read');
  });
});
