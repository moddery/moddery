import { describe, expect, test } from 'bun:test';

import {
  organizationTeamPermissions,
  permissionLabel,
  projectTeamPermissions,
} from './permissions.ts';

describe(permissionLabel.name, () => {
  test('formats enum-style permission labels for UI display', () => {
    expect(permissionLabel('MANAGE_DETAILS')).toBe('Manage Details');
    expect(permissionLabel(' VIEW_ANALYTICS ')).toBe('View Analytics');
    expect(permissionLabel('MANAGE__MEMBERS')).toBe('Manage Members');
  });

  test('separates project and organization permission choices', () => {
    expect(projectTeamPermissions).toContain('MANAGE_VERSIONS');
    expect(organizationTeamPermissions).not.toContain('MANAGE_VERSIONS');
  });
});
