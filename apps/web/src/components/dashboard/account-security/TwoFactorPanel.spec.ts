import { describe, expect, test } from 'bun:test';

import {
  twoFactorActionMessage,
  twoFactorSubmitLabel,
} from './TwoFactorPanel.tsx';

describe(twoFactorActionMessage.name, () => {
  test('describes enable and disable outcomes', () => {
    expect(twoFactorActionMessage('enable')).toBe(
      'Two-factor authentication enabled.',
    );
    expect(twoFactorActionMessage('disable')).toBe(
      'Two-factor authentication disabled.',
    );
  });
});

describe(twoFactorSubmitLabel.name, () => {
  test('describes idle and busy submit states', () => {
    expect(twoFactorSubmitLabel(false, null)).toBe('Enable 2FA');
    expect(twoFactorSubmitLabel(true, null)).toBe('Disable 2FA');
    expect(twoFactorSubmitLabel(false, 'enable')).toBe('Enabling 2FA...');
    expect(twoFactorSubmitLabel(true, 'disable')).toBe('Disabling 2FA...');
  });
});
