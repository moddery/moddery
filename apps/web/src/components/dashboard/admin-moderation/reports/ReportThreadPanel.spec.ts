import { describe, expect, test } from 'bun:test';

import { reportThreadTiming } from './ReportThreadPanel.tsx';

describe(reportThreadTiming.name, () => {
  test('summarizes report thread created and updated timing', () => {
    expect(
      reportThreadTiming(
        {
          createdAt: '2026-06-18T16:00:00.000Z',
          updatedAt: '2026-06-18T17:30:00.000Z',
        },
        new Date('2026-06-18T18:00:00.000Z'),
      ),
    ).toBe('Opened 2 hours ago · updated 30 minutes ago');
  });
});
