import { describe, expect, test } from 'bun:test';

import { sessionActionMessage } from './SessionsPanel.tsx';

describe(sessionActionMessage.name, () => {
  test('describes session revocation with the user agent when available', () => {
    expect(
      sessionActionMessage('revoke', { userAgent: 'Firefox on macOS' }),
    ).toBe('Revoked Firefox on macOS.');
  });

  test('uses a generic label when the session has no user agent', () => {
    expect(sessionActionMessage('revoke', { userAgent: null })).toBe(
      'Revoked browser session.',
    );
  });
});
