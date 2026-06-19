import { describe, expect, test } from 'bun:test';

import {
  type ProjectDetails,
  type ProjectMember,
} from '../../../lib/catalog.ts';
import { projectOwnershipSummary } from './project-ownership.ts';

describe(projectOwnershipSummary.name, () => {
  test('links organization-owned projects to the organization route', () => {
    expect(
      projectOwnershipSummary({
        members: [memberFixture({ username: 'creator' })],
        project: projectFixture({
          organization: {
            color: null,
            iconUrl: null,
            id: 'organization-a',
            name: 'Build Team',
            slug: 'build team',
          },
        }),
      }),
    ).toEqual({
      href: '/organizations/build%20team',
      label: 'Organization',
      name: 'Build Team',
      teamSize: 1,
    });
  });

  test('falls back to the owning creator when no organization is present', () => {
    expect(
      projectOwnershipSummary({
        members: [
          memberFixture({ owner: false, username: 'member' }),
          memberFixture({
            displayName: 'Creator One',
            owner: true,
            username: 'creator one',
          }),
        ],
        project: projectFixture({ authorUsername: 'creator one' }),
      }),
    ).toEqual({
      href: '/users/creator%20one',
      label: 'Creator',
      name: 'Creator One',
      teamSize: 2,
    });
  });
});

function projectFixture(patch: Partial<ProjectDetails> = {}): ProjectDetails {
  return {
    additionalCategories: [],
    approvedAt: null,
    archivedAt: null,
    author: 'Creator',
    authorUsername: 'creator',
    body: '',
    categories: [],
    color: null,
    description: 'Summary',
    discordUrl: null,
    donationUrls: [],
    downloads: 0,
    externalLinks: [],
    followers: 0,
    gallery: [],
    gameVersions: [],
    iconUrl: null,
    id: 'project-a',
    issuesUrl: null,
    license: { id: 'mit', name: 'MIT', url: null },
    loaders: [],
    organization: null,
    projectType: 'mod',
    published: '2026-01-01T00:00:00.000Z',
    queuedAt: null,
    requestedStatus: null,
    slug: 'example',
    sourceUrl: null,
    status: 'APPROVED',
    title: 'Example',
    updated: '2026-01-01T00:00:00.000Z',
    wikiUrl: null,
    ...patch,
  };
}

function memberFixture({
  displayName = null,
  owner = true,
  username,
}: {
  displayName?: string | null;
  owner?: boolean;
  username: string;
}): ProjectMember {
  return {
    accepted: true,
    owner,
    permissions: [],
    role: owner ? 'Owner' : 'Member',
    sortOrder: 0,
    user: {
      avatarUrl: null,
      displayName,
      id: username,
      username,
    },
  };
}
