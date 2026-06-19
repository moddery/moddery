import { describe, expect, test } from 'bun:test';

import {
  releaseModerationActionMessage,
  releaseModerationActions,
} from './ReleaseModerationQueue.tsx';

describe(releaseModerationActions.name, () => {
  test('offers review decisions for pending releases', () => {
    expect(releaseModerationActions('PENDING_REVIEW')).toEqual([
      { kind: 'APPROVE', label: 'Approve' },
      { kind: 'REJECT', label: 'Reject' },
      { kind: 'ARCHIVE', label: 'Archive' },
    ]);
  });

  test('offers recovery or archival actions for rejected releases', () => {
    expect(releaseModerationActions('REJECTED')).toEqual([
      { kind: 'APPROVE', label: 'Approve' },
      { kind: 'ARCHIVE', label: 'Archive' },
    ]);
  });

  test('only restores archived releases', () => {
    expect(releaseModerationActions('ARCHIVED')).toEqual([
      { kind: 'RESTORE', label: 'Restore' },
    ]);
  });

  test('does not show moderation actions for public releases', () => {
    expect(releaseModerationActions('APPROVED')).toEqual([]);
  });
});

describe(releaseModerationActionMessage.name, () => {
  test('describes release moderation outcomes', () => {
    const version = { name: 'Release', versionNumber: '1.0.0' };

    expect(releaseModerationActionMessage('APPROVE', version)).toBe(
      'Approved Release 1.0.0.',
    );
    expect(releaseModerationActionMessage('REJECT', version)).toBe(
      'Rejected Release 1.0.0.',
    );
    expect(releaseModerationActionMessage('ARCHIVE', version)).toBe(
      'Archived Release 1.0.0.',
    );
    expect(releaseModerationActionMessage('RESTORE', version)).toBe(
      'Restored Release 1.0.0.',
    );
  });
});
