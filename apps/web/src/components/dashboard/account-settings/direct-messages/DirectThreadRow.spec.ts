import { describe, expect, test } from 'bun:test';

import {
  directThreadTiming,
  directThreadUnreadCount,
} from './DirectThreadRow.tsx';

describe(directThreadTiming.name, () => {
  test('summarizes direct thread created and updated timing', () => {
    expect(
      directThreadTiming(
        {
          createdAt: '2026-06-18T16:00:00.000Z',
          updatedAt: '2026-06-18T17:45:00.000Z',
        },
        new Date('2026-06-18T18:00:00.000Z'),
      ),
    ).toBe('Opened 2 hours ago · updated 15 minutes ago');
  });
});

describe(directThreadUnreadCount.name, () => {
  test('counts messages from other users after the viewer read marker', () => {
    expect(
      directThreadUnreadCount(
        directThreadFixture({
          lastReadAt: '2026-06-18T17:00:00.000Z',
          messages: [
            messageFixture({
              authorId: 'user-b',
              createdAt: '2026-06-18T16:30:00.000Z',
            }),
            messageFixture({
              authorId: 'user-b',
              createdAt: '2026-06-18T17:30:00.000Z',
            }),
          ],
        }),
        'user-a',
      ),
    ).toBe(1);
  });

  test('treats missing read state as unread for other-user messages', () => {
    expect(
      directThreadUnreadCount(
        directThreadFixture({
          lastReadAt: null,
          messages: [
            messageFixture({ authorId: 'user-b' }),
            messageFixture({ authorId: 'user-c' }),
          ],
        }),
        'user-a',
      ),
    ).toBe(2);
  });

  test('does not count messages authored by the viewer', () => {
    expect(
      directThreadUnreadCount(
        directThreadFixture({
          lastReadAt: null,
          messages: [
            messageFixture({ authorId: 'user-a' }),
            messageFixture({ authorId: 'user-b' }),
          ],
        }),
        'user-a',
      ),
    ).toBe(1);
  });
});

function directThreadFixture({
  lastReadAt,
  messages,
}: {
  lastReadAt: string | null;
  messages: ReturnType<typeof messageFixture>[];
}) {
  return {
    members: [
      {
        createdAt: '2026-06-18T16:00:00.000Z',
        lastReadAt,
        user: {
          displayName: 'Viewer',
          id: 'user-a',
          username: 'viewer',
        },
      },
    ],
    messages,
  };
}

function messageFixture({
  authorId,
  createdAt = '2026-06-18T17:30:00.000Z',
}: {
  authorId: string;
  createdAt?: string;
}) {
  return {
    author: {
      displayName: null,
      id: authorId,
      username: authorId,
    },
    body: 'Message',
    createdAt,
    id: `${authorId}-${createdAt}`,
  };
}
