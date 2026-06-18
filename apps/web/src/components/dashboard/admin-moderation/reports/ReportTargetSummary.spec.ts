import { describe, expect, test } from 'bun:test';

import { type ModerationReport } from '../../../../lib/dashboard.ts';
import {
  reportVersionHref,
  resolveReportTarget,
} from './ReportTargetSummary.tsx';

describe(reportVersionHref.name, () => {
  test('links moderation version reports to the selected project version', () => {
    expect(
      reportVersionHref('/mods?project=required-lib&type=mod', '1.0.0+fabric'),
    ).toBe(
      '/mods?project=required-lib&type=mod&tab=versions&version=1.0.0%2Bfabric',
    );
  });
});

describe(resolveReportTarget.name, () => {
  test('keeps version target links separate from project context links', () => {
    const target = resolveReportTarget(reportFixture());

    expect(target.href).toBe(
      '/mods?project=required-lib&type=mod&tab=versions&version=1.0.0%2Bfabric',
    );
    expect(target.version?.projectHref).toBe(
      '/mods?project=required-lib&type=mod',
    );
  });

  test('links user report targets with encoded profile paths', () => {
    const target = resolveReportTarget({
      ...reportFixture(),
      userTarget: {
        displayName: null,
        id: 'user-b',
        username: 'space user',
      },
      userTargetId: 'user-b',
      version: null,
      versionId: null,
    });

    expect(target.href).toBe('/users/space%20user');
  });
});

function reportFixture(): ModerationReport {
  return {
    body: 'Wrong file uploaded',
    closedAt: null,
    createdAt: '2026-06-18T00:00:00.000Z',
    id: 'report-a',
    project: null,
    projectId: null,
    reason: 'MALWARE',
    reporter: {
      displayName: null,
      id: 'user-a',
      username: 'reporter',
    },
    state: 'OPEN',
    userTarget: null,
    userTargetId: null,
    version: {
      id: 'version-a',
      name: 'Required Lib 1.0.0',
      project: {
        id: 'project-a',
        kind: 'MOD',
        slug: 'required-lib',
        title: 'Required Lib',
      },
      versionNumber: '1.0.0+fabric',
    },
    versionId: 'version-a',
  };
}
