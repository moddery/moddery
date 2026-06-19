import { describe, expect, test } from 'bun:test';

import { projectCreationReviewMessage } from './PublishProjectForm.tsx';

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
