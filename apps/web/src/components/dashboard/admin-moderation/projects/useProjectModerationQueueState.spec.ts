import { describe, expect, test } from 'bun:test';

import {
  projectModerationActionMessage,
  projectModerationLockMessage,
} from './useProjectModerationQueueState.ts';

describe(projectModerationActionMessage.name, () => {
  test('describes known project moderation actions', () => {
    const project = { slug: 'iris', title: 'Iris Tools' };

    expect(projectModerationActionMessage('APPROVE', project)).toBe(
      'Approved Iris Tools.',
    );
    expect(projectModerationActionMessage('REJECT', project)).toBe(
      'Rejected Iris Tools.',
    );
    expect(projectModerationActionMessage('ARCHIVE', project)).toBe(
      'Archived Iris Tools.',
    );
    expect(projectModerationActionMessage('RESTORE', project)).toBe(
      'Restored Iris Tools.',
    );
  });

  test('falls back for unknown project moderation actions', () => {
    expect(
      projectModerationActionMessage('CUSTOM', {
        slug: 'iris',
        title: 'Iris Tools',
      }),
    ).toBe('Updated Iris Tools.');
  });

  test('falls back to the slug when the project title is blank', () => {
    expect(
      projectModerationActionMessage('APPROVE', { slug: 'iris', title: ' ' }),
    ).toBe('Approved iris.');
  });
});

describe(projectModerationLockMessage.name, () => {
  test('describes project lock updates', () => {
    expect(projectModerationLockMessage('lock', { slug: 'iris' })).toBe(
      'Locked iris for review.',
    );
    expect(projectModerationLockMessage('release', { slug: 'iris' })).toBe(
      'Released review lock for iris.',
    );
  });
});
