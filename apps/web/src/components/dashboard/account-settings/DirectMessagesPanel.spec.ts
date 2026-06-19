import { describe, expect, test } from 'bun:test';

import { directMessageStatusMessage } from './DirectMessagesPanel.tsx';

describe(directMessageStatusMessage.name, () => {
  test('describes direct message actions', () => {
    const thread = { subject: 'Thread with alex' };

    expect(directMessageStatusMessage('create', thread)).toBe(
      'Started Thread with alex.',
    );
    expect(directMessageStatusMessage('reply', thread)).toBe(
      'Replied to Thread with alex.',
    );
    expect(directMessageStatusMessage('read', thread)).toBe(
      'Marked Thread with alex as read.',
    );
  });
});
