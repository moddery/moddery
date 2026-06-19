import { describe, expect, test } from 'bun:test';

import { apiTokenActionMessage } from './ApiTokensPanel.tsx';
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
