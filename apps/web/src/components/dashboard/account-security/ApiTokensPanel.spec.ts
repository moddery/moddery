import { describe, expect, test } from 'bun:test';

import { apiTokenActionMessage } from './ApiTokensPanel.tsx';

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
