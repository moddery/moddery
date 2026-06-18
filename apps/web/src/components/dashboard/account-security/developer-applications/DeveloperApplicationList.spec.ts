import { describe, expect, test } from 'bun:test';

import { redirectUriLabel } from './DeveloperApplicationList.js';

describe('redirectUriLabel', () => {
  test('includes the redirect URI creation age', () => {
    expect(redirectUriLabel({ createdAt: new Date().toISOString() })).toMatch(
      /^Added /,
    );
  });
});
