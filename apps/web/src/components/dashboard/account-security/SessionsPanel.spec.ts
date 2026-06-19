import { describe, expect, test } from 'bun:test';

import { sessionActionMessage } from './SessionsPanel.tsx';

describe(sessionActionMessage.name, () => {
  test('describes session revocation with the user agent when available', () => {
    expect(
      sessionActionMessage('revoke', {
        isCurrent: false,
        userAgent: 'Firefox on macOS',
      }),
    ).toBe('Revoked Firefox on macOS.');
  });

  test('uses a generic label when the session has no user agent', () => {
    expect(
      sessionActionMessage('revoke', { isCurrent: false, userAgent: null }),
    ).toBe('Revoked browser session.');
  });

  test('describes current session revocation as requiring sign in', () => {
    expect(
      sessionActionMessage('revoke', {
        isCurrent: true,
        userAgent: 'Safari on macOS',
      }),
    ).toBe('Revoked current Safari on macOS. Sign in again to continue.');
  });
});
