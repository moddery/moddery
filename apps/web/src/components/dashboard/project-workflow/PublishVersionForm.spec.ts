import { describe, expect, test } from 'bun:test';

import { versionCreationReviewMessage } from './PublishVersionForm.tsx';

describe(versionCreationReviewMessage.name, () => {
  test('describes approved versions as visible', () => {
    expect(versionCreationReviewMessage({ status: 'APPROVED' })).toBe(
      'It is approved and visible on the project page.',
    );
  });

  test('describes pending versions as queued for review', () => {
    expect(versionCreationReviewMessage({ status: 'PENDING_REVIEW' })).toBe(
      'It is queued for review before becoming public.',
    );
  });

  test('describes other statuses as saved but non-public', () => {
    expect(versionCreationReviewMessage({ status: 'DRAFT' })).toBe(
      'It is saved, but it is not public yet.',
    );
  });
});
