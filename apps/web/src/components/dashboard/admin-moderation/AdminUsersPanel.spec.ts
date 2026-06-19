import { describe, expect, test } from 'bun:test';

import { adminUsersPanelBusy } from './AdminUsersPanel.tsx';

describe(adminUsersPanelBusy.name, () => {
  test('tracks whether an admin account update is active', () => {
    expect(adminUsersPanelBusy(null)).toBe(false);
    expect(adminUsersPanelBusy('user-1')).toBe(true);
  });
});
