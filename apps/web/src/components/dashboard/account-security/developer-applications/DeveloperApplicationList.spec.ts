import { describe, expect, test } from 'bun:test';

import {
  oauthClientIdLabel,
  oauthClientRevoked,
  redirectUriLabel,
} from './developer-application-labels.ts';

describe(redirectUriLabel.name, () => {
  test('includes the redirect URI creation age', () => {
    expect(redirectUriLabel({ createdAt: new Date().toISOString() })).toMatch(
      /^Added /,
    );
  });
});

describe(oauthClientIdLabel.name, () => {
  test('formats missing client IDs explicitly', () => {
    expect(oauthClientIdLabel(null)).toBe('Client ID pending');
    expect(oauthClientIdLabel('client-a')).toBe('client-a');
  });
});

describe(oauthClientRevoked.name, () => {
  test('treats revoked status and timestamps as revoked', () => {
    expect(oauthClientRevoked({ revokedAt: null, status: 'ACTIVE' })).toBe(
      false,
    );
    expect(oauthClientRevoked({ revokedAt: null, status: 'REVOKED' })).toBe(
      true,
    );
    expect(
      oauthClientRevoked({
        revokedAt: '2026-01-01T00:00:00.000Z',
        status: 'ACTIVE',
      }),
    ).toBe(true);
  });
});
