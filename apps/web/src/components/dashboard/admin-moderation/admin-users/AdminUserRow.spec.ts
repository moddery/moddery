import { describe, expect, test } from 'bun:test';

import { adminUserHref } from './AdminUserRow.tsx';

describe(adminUserHref.name, () => {
  test('links admin user rows to public profiles', () => {
    expect(adminUserHref({ username: 'Coah Builder' })).toBe(
      '/users/Coah%20Builder',
    );
  });
});
