import { describe, expect, test } from 'bun:test';

import {
  projectViewerCapabilities,
  userProjectMembershipSelect,
} from './user-read-model.js';

describe(projectViewerCapabilities.name, () => {
  test('grants every project capability to owners', () => {
    expect(
      projectViewerCapabilities({
        isOwner: true,
        permissions: [],
      }),
    ).toEqual({
      manageDetails: true,
      manageMembers: true,
      manageVersions: true,
      viewAnalytics: true,
    });
  });

  test('maps explicit team permissions to dashboard capabilities', () => {
    expect(
      projectViewerCapabilities({
        isOwner: false,
        permissions: ['MANAGE_VERSIONS', 'VIEW_ANALYTICS'],
      }),
    ).toEqual({
      manageDetails: false,
      manageMembers: false,
      manageVersions: true,
      viewAnalytics: true,
    });
  });
});

describe(userProjectMembershipSelect.name, () => {
  test('selects the viewer membership fields needed for capabilities', () => {
    expect(userProjectMembershipSelect()).toMatchObject({
      isOwner: true,
      permissions: true,
    });
  });
});
