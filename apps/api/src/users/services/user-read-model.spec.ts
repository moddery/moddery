import { describe, expect, test } from 'bun:test';

import {
  projectViewerCapabilities,
  userProjectMembershipSelect,
  userProfileSelect,
} from './user-read-model.js';

describe(userProfileSelect.name, () => {
  test('includes every accepted project membership for private dashboard reads', () => {
    const select = userProfileSelect({
      includePrivateAccountFields: true,
      includePrivateCollections: true,
      includePrivateProjects: true,
    });

    expect(select._count.select.teamMemberships).toEqual({
      where: { acceptedAt: { not: null } },
    });
    expect(select.teamMemberships.where).toEqual({
      acceptedAt: { not: null },
    });
  });

  test('keeps public profile project reads limited to approved projects', () => {
    const select = userProfileSelect({
      includePrivateAccountFields: false,
      includePrivateCollections: false,
      includePrivateProjects: false,
    });

    expect(select._count.select.teamMemberships).toEqual({
      where: {
        acceptedAt: { not: null },
        team: { project: { is: { status: 'APPROVED' } } },
      },
    });
    expect(select.teamMemberships.where).toEqual({
      acceptedAt: { not: null },
      team: { project: { is: { status: 'APPROVED' } } },
    });
  });
});

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
