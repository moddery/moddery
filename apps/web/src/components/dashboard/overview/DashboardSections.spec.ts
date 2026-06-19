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
  test('starts empty project workflows at project publishing', () => {
    expect(projectWorkflowFormOrder(dashboardProjectsByCapability([]))).toEqual(
      ['publish-project'],
    );
  });

  test('includes all workflows for project owners', () => {
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
      'publish-project',
      'project-metadata',
      'project-gallery',
      'project-team',
      'project-analytics',
      'publish-version',
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
      'publish-project',
      'project-analytics',
      'publish-version',
      'edit-version',
      'edit-version-dependencies',
    ]);
  });
});
