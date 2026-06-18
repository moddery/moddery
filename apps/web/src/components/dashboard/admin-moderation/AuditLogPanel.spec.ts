import { describe, expect, test } from 'bun:test';

import { auditResourceHref, auditUserHref } from './AuditLogPanel.tsx';

describe(auditUserHref.name, () => {
  test('links audit users to encoded profile paths', () => {
    expect(auditUserHref({ username: 'space user' })).toBe(
      '/users/space%20user',
    );
  });
});

describe(auditResourceHref.name, () => {
  test('links organization audit resources to organization routes', () => {
    expect(
      auditResourceHref({
        id: 'org-a',
        kind: 'ORGANIZATION',
        name: 'Build Team',
        slug: 'build team',
      }),
    ).toBe('/organizations/build%20team');
  });

  test('does not link project resources without project kind route data', () => {
    expect(
      auditResourceHref({
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Required Lib',
        slug: 'required-lib',
      }),
    ).toBeNull();
  });
});
