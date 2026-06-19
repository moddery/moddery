import { describe, expect, test } from 'bun:test';

import {
  projectCreationReviewMessage,
  publishProjectButtonLabel,
} from './PublishProjectForm.tsx';

describe(projectCreationReviewMessage.name, () => {
  test('describes approved projects as release-ready', () => {
    expect(projectCreationReviewMessage({ status: 'APPROVED' })).toBe(
      'It is approved and ready for releases.',
    );
  });

  test('describes non-approved projects as queued for review', () => {
    expect(projectCreationReviewMessage({ status: 'QUEUED' })).toBe(
      'It is queued for review before releases can be published.',
    );
  });
});

describe(publishProjectButtonLabel.name, () => {
  test('describes idle and submitting states', () => {
    expect(publishProjectButtonLabel(false)).toBe('Publish project');
    expect(publishProjectButtonLabel(true)).toBe('Publishing...');
  });
});
