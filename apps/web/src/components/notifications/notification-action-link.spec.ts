import { describe, expect, test } from 'bun:test';

import { notificationActionLinkAttributes } from './notification-action-link.ts';

describe(notificationActionLinkAttributes.name, () => {
  test('keeps internal notification actions in app navigation', () => {
    expect(notificationActionLinkAttributes('/dashboard')).toEqual({});
  });

  test('opens external notification actions outside the app tab', () => {
    expect(notificationActionLinkAttributes('https://example.test')).toEqual({
      rel: 'noreferrer',
      target: '_blank',
    });
  });
});
