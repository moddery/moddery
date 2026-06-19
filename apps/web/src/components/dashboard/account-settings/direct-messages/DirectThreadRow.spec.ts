import { describe, expect, test } from 'bun:test';

import { directThreadTiming } from './DirectThreadRow.tsx';

describe(directThreadTiming.name, () => {
  test('summarizes direct thread created and updated timing', () => {
    expect(
      directThreadTiming(
        {
          createdAt: '2026-06-18T16:00:00.000Z',
          updatedAt: '2026-06-18T17:45:00.000Z',
        },
        new Date('2026-06-18T18:00:00.000Z'),
      ),
    ).toBe('Opened 2 hours ago · updated 15 minutes ago');
  });
});
