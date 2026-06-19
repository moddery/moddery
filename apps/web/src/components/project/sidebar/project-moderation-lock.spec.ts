import { describe, expect, test } from 'bun:test';

import {
  projectModerationLockExpiry,
  projectModerationLockSummary,
} from './project-moderation-lock.ts';

describe('projectModerationLockSummary', () => {
  test('formats the moderator display name and expiry', () => {
    expect(
      projectModerationLockSummary({
        createdAt: '2026-06-18T19:00:00.000Z',
        expiresAt: '2026-06-18T12:30:00.000',
        id: 'lock-a',
        moderator: {
          displayName: 'Reviewer',
          id: 'user-a',
          username: 'reviewer',
        },
      }),
    ).toBe('Reviewer until Jun 18, 12:30 PM');
  });

  test('falls back to the moderator username', () => {
    expect(
      projectModerationLockSummary({
        createdAt: '2026-06-18T19:00:00.000Z',
        expiresAt: '2026-06-18T13:00:00.000',
        id: 'lock-b',
        moderator: {
          displayName: null,
          id: 'user-b',
          username: 'queue-owner',
        },
      }),
    ).toBe('queue-owner until Jun 18, 1:00 PM');
  });

  test('formats the lock expiry independently for linked moderator labels', () => {
    expect(
      projectModerationLockExpiry({
        expiresAt: '2026-06-18T09:15:00.000',
      }),
    ).toBe('Jun 18, 9:15 AM');
  });
});
