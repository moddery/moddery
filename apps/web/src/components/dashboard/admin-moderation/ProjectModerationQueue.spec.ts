import { describe, expect, test } from 'bun:test';

import { projectModerationQueueBusy } from './ProjectModerationQueue.tsx';

describe(projectModerationQueueBusy.name, () => {
  test('tracks whether the project review queue has an active action', () => {
    expect(projectModerationQueueBusy(null)).toBe(false);
    expect(projectModerationQueueBusy('iris')).toBe(true);
  });
});
