import { describe, expect, test } from 'bun:test';

import {
  auditResourceHref,
  auditUserHref,
  projectAuditSnapshotHref,
} from './AuditLogPanel.tsx';
import { deniedActionLabel } from './AuditLogDescription.tsx';

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
        projectKind: null,
        slug: 'build team',
      }),
    ).toBe('/organizations/build%20team');
  });

  test('links project audit resources when project kind route data is present', () => {
    expect(
      auditResourceHref({
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Required Lib',
        projectKind: 'MOD',
        slug: 'required-lib',
      }),
    ).toBe('/mods?project=required-lib&type=mod');
  });

  test('does not link project resources without project kind route data', () => {
    expect(
      auditResourceHref({
        id: 'project-a',
        kind: 'PROJECT',
        name: 'Required Lib',
        projectKind: null,
        slug: 'required-lib',
      }),
    ).toBeNull();
  });
});

describe(projectAuditSnapshotHref.name, () => {
  test('links project moderation snapshots to public project routes', () => {
    expect(
      projectAuditSnapshotHref({
        projectKind: 'PLUGIN',
        slug: 'server-tools',
      }),
    ).toBe('/plugins?project=server-tools&type=plugin');
  });
});

describe(deniedActionLabel.name, () => {
  test('formats denied permission actions', () => {
    expect(deniedActionLabel('PROJECT_UPDATE')).toBe('project update');
    expect(deniedActionLabel(null)).toBe('a denied action');
  });
});
