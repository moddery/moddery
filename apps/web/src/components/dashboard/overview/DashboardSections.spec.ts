import { describe, expect, test } from 'bun:test';

import { projectWorkflowFormOrder } from './DashboardProjectWorkflowForms.tsx';

describe(projectWorkflowFormOrder.name, () => {
  test('starts empty project workflows at project publishing', () => {
    expect(projectWorkflowFormOrder(false)).toEqual(['publish-project']);
  });

  test('places version publishing before version editing', () => {
    expect(projectWorkflowFormOrder(true)).toEqual([
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
});
