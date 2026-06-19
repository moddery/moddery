import { describe, expect, test } from 'bun:test';

import {
  isPublicDashboardProject,
  managedProjectStatusMessage,
  projectSummaryLinks,
} from './ProjectsSummary.js';

describe('projectSummaryLinks', () => {
  test('includes standard, license, and custom project links', () => {
    expect(
      projectSummaryLinks({
        discordUrl: 'https://chat.example.test',
        issuesUrl: null,
        license: {
          id: 'mit',
          name: 'MIT',
          url: 'https://licenses.example.test/mit',
        },
        links: [
          {
            kind: 'DONATION',
            label: 'Sponsor',
            url: 'https://sponsor.example.test',
          },
          {
            kind: 'COMMUNITY',
            label: null,
            url: 'https://community.example.test',
          },
        ],
        sourceUrl: 'https://source.example.test',
        wikiUrl: null,
      }),
    ).toEqual([
      {
        href: 'https://source.example.test',
        key: 'source',
        label: 'Source',
      },
      {
        href: 'https://chat.example.test',
        key: 'discord',
        label: 'Discord',
      },
      {
        href: 'https://licenses.example.test/mit',
        key: 'license',
        label: 'MIT',
      },
      {
        href: 'https://sponsor.example.test',
        key: 'link-0-https://sponsor.example.test',
        label: 'Sponsor',
      },
      {
        href: 'https://community.example.test',
        key: 'link-1-https://community.example.test',
        label: 'Community',
      },
    ]);
  });
});

describe(isPublicDashboardProject.name, () => {
  test('only approved dashboard projects should open as public project cards', () => {
    expect(isPublicDashboardProject({ status: 'APPROVED' })).toBe(true);
    expect(isPublicDashboardProject({ status: 'PENDING_REVIEW' })).toBe(false);
    expect(isPublicDashboardProject({ status: 'REJECTED' })).toBe(false);
    expect(isPublicDashboardProject({ status: 'ARCHIVED' })).toBe(false);
  });
});

describe(managedProjectStatusMessage.name, () => {
  test('explains private managed project lifecycle states', () => {
    expect(managedProjectStatusMessage({ status: 'PENDING_REVIEW' })).toContain(
      'review',
    );
    expect(managedProjectStatusMessage({ status: 'REJECTED' })).toContain(
      'private',
    );
    expect(managedProjectStatusMessage({ status: 'ARCHIVED' })).toContain(
      'restored',
    );
    expect(managedProjectStatusMessage({ status: 'DRAFT' })).toContain(
      'not public',
    );
  });
});
