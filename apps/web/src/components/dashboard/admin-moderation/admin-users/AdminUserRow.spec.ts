import { describe, expect, test } from 'bun:test';

import { adminUserHref, statusBadgeTone } from './AdminUserRow.tsx';

describe(adminUserHref.name, () => {
  test('links admin user rows to public profiles', () => {
    expect(adminUserHref({ username: 'Coah Builder' })).toBe(
      '/users/Coah%20Builder',
    );
  });
});

describe(statusBadgeTone.name, () => {
  test('keeps the normal state quiet and colors the ones needing attention', () => {
    expect(statusBadgeTone('ACTIVE')).toBe('muted');
    expect(statusBadgeTone('SUSPENDED')).toBe('warning');
    expect(statusBadgeTone('DELETED')).toBe('danger');
  });
});
