import { describe, expect, test } from 'bun:test';

import {
  apiTokenActionMessage,
  parseOptionalApiTokenExpiryDays,
} from './ApiTokensPanel.tsx';
import { toggleCredentialScope } from './shared.tsx';

describe(apiTokenActionMessage.name, () => {
  test('describes token creation and revocation', () => {
    const token = { name: 'Local CLI' };

    expect(apiTokenActionMessage('create', token)).toBe(
      'Created token Local CLI.',
    );
    expect(apiTokenActionMessage('revoke', token)).toBe(
      'Revoked token Local CLI.',
    );
  });
});

describe(toggleCredentialScope.name, () => {
  test('adds and removes supported credential scopes', () => {
    expect(toggleCredentialScope(['read:projects'], 'write:projects')).toEqual([
      'read:projects',
      'write:projects',
    ]);
    expect(
      toggleCredentialScope(
        ['read:projects', 'write:projects'],
        'read:projects',
      ),
    ).toEqual(['write:projects']);
  });
});

describe(parseOptionalApiTokenExpiryDays.name, () => {
  test('parses positive whole-day expirations', () => {
    expect(parseOptionalApiTokenExpiryDays('1')).toBe(1);
    expect(parseOptionalApiTokenExpiryDays(' 90 ')).toBe(90);
  });

  test('preserves blank expirations as no expiration', () => {
    expect(parseOptionalApiTokenExpiryDays('')).toBeNull();
    expect(parseOptionalApiTokenExpiryDays('   ')).toBeNull();
  });

  test('rejects invalid expiration input', () => {
    expect(() => parseOptionalApiTokenExpiryDays('3.5')).toThrow(
      'Token expiration must be a whole number of days',
    );
    expect(() => parseOptionalApiTokenExpiryDays('soon')).toThrow(
      'Token expiration must be a whole number of days',
    );
    expect(() => parseOptionalApiTokenExpiryDays('-1')).toThrow(
      'Token expiration must be a whole number of days',
    );
    expect(() => parseOptionalApiTokenExpiryDays('0')).toThrow(
      'Token expiration must be at least 1 day',
    );
  });
});
