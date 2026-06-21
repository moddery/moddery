import { describe, expect, test } from 'bun:test';

import { type DashboardData } from '../../../lib/dashboard.ts';
import {
  dashboardProjectsByCapability,
  projectWorkflowFormOrder,
} from './DashboardProjectWorkflowForms.tsx';

function projectWithCapabilities(
  viewerCapabilities: NonNullable<
    DashboardData['projects'][number]['viewerCapabilities']
  >,
): DashboardData['projects'][number] {
  return { viewerCapabilities } as DashboardData['projects'][number];
}

describe(projectWorkflowFormOrder.name, () => {
  test('has no inline forms when the viewer manages no projects', () => {
    expect(projectWorkflowFormOrder(dashboardProjectsByCapability([]))).toEqual(
      [],
    );
  });

  test('includes all management workflows for project owners', () => {
    expect(
      projectWorkflowFormOrder(
        dashboardProjectsByCapability([
          projectWithCapabilities({
            manageDetails: true,
            manageMembers: true,
            manageVersions: true,
            viewAnalytics: true,
          }),
        ]),
      ),
    ).toEqual([
      'project-gallery',
      'project-team',
      'project-analytics',
      'edit-version',
      'edit-version-dependencies',
    ]);
  });

  test('only includes workflows backed by viewer project capabilities', () => {
    expect(
      projectWorkflowFormOrder(
        dashboardProjectsByCapability([
          projectWithCapabilities({
            manageDetails: false,
            manageMembers: false,
            manageVersions: true,
            viewAnalytics: true,
          }),
        ]),
      ),
    ).toEqual([
      'project-analytics',
      'edit-version',
      'edit-version-dependencies',
    ]);
  });
});
