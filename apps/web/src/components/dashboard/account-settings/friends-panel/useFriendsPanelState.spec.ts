import { describe, expect, test } from 'bun:test';

import { friendActionMessage } from './useFriendsPanelState.ts';

describe(friendActionMessage.name, () => {
  test('describes friend actions with returned user names', () => {
    const friendship = friendshipFixture({ displayName: 'Alex' });

    expect(friendActionMessage('accept', 'alex', friendship)).toBe(
      "Accepted Alex's friend request.",
    );
    expect(friendActionMessage('block', 'alex', friendship)).toBe(
      'Blocked Alex.',
    );
    expect(friendActionMessage('request', 'alex', friendship)).toBe(
      'Sent a friend request to Alex.',
    );
  });

  test('describes reciprocal friend requests as accepted', () => {
    expect(
      friendActionMessage(
        'request',
        'alex',
        friendshipFixture({ direction: 'MUTUAL', displayName: null }),
      ),
    ).toBe("Accepted alex's friend request.");
  });

  test('describes removals without requiring returned friendship data', () => {
    expect(friendActionMessage('remove', 'alex', null)).toBe('Removed alex.');
  });
});

function friendshipFixture({
  direction = 'OUTGOING',
  displayName,
}: {
  direction?: 'INCOMING' | 'MUTUAL' | 'OUTGOING';
  displayName: string | null;
}) {
  return {
    direction,
    user: {
      avatarUrl: null,
      displayName,
      id: 'user-alex',
      username: 'alex',
    },
  };
}
