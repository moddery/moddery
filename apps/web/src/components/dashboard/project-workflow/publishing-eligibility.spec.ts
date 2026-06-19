import { describe, expect, test } from 'bun:test';

import {
  canPublishCreatorContent,
  creatorPublishingRequirementMessage,
} from './publishing-eligibility.ts';

describe(canPublishCreatorContent.name, () => {
  test('allows verified creators to publish', () => {
    expect(canPublishCreatorContent('2026-01-01T00:00:00.000Z')).toBe(true);
  });

  test('blocks unverified creators from publishing', () => {
    expect(canPublishCreatorContent(null)).toBe(false);
  });
});

describe(creatorPublishingRequirementMessage.name, () => {
  test('describes the verified email requirement when blocked', () => {
    expect(creatorPublishingRequirementMessage(null)).toBe(
      'Verify your email before publishing projects or versions.',
    );
  });

  test('returns no message for verified creators', () => {
    expect(
      creatorPublishingRequirementMessage('2026-01-01T00:00:00.000Z'),
    ).toBeNull();
  });
});
