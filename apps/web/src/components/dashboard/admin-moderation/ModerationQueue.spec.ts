import { describe, expect, test } from 'bun:test';

import { reportStateUpdateMessage } from './ModerationQueue.tsx';

describe(reportStateUpdateMessage.name, () => {
  test('describes known report state updates', () => {
    expect(reportStateUpdateMessage({ state: 'TRIAGED' }, 'TRIAGED')).toBe(
      'Marked report as triaged.',
    );
    expect(reportStateUpdateMessage({ state: 'OPEN' }, 'OPEN')).toBe(
      'Reopened report.',
    );
    expect(reportStateUpdateMessage({ state: 'CLOSED' }, 'CLOSED')).toBe(
      'Closed report.',
    );
  });

  test('uses the requested state when the response state is empty', () => {
    expect(reportStateUpdateMessage({ state: '' }, 'CLOSED')).toBe(
      'Closed report.',
    );
  });

  test('falls back for unknown report states', () => {
    expect(reportStateUpdateMessage({ state: 'CUSTOM' }, 'TRIAGED')).toBe(
      'Updated report.',
    );
  });
});
