import { describe, expect, test } from 'bun:test';

import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { publishableVersionProjects } from './publish-version-projects.ts';

describe(publishableVersionProjects.name, () => {
  test('keeps only approved projects eligible for new versions', () => {
    expect(
      publishableVersionProjects([
        project({ slug: 'queued', status: 'PENDING_REVIEW' }),
        project({ slug: 'approved', status: 'APPROVED' }),
        project({ slug: 'rejected', status: 'REJECTED' }),
      ]).map((item) => item.slug),
    ).toEqual(['approved']);
  });
});

function project({
  slug,
  status,
}: {
  slug: string;
  status: string;
}): DashboardProject {
  return {
    body: 'Body',
    categories: [],
    color: null,
    discordUrl: null,
    downloads: 0,
    followers: 0,
    gallery: [],
    gameVersions: ['1.21.6'],
    iconUrl: null,
    issuesUrl: null,
    kind: 'MOD',
    license: {
      id: 'mit',
      name: 'MIT',
      url: null,
    },
    links: [],
    loaders: ['fabric'],
    moderationLock: null,
    requestedStatus: null,
    slug,
    sourceUrl: null,
    status,
    summary: 'Summary',
    title: slug,
    updatedAt: '2026-01-01T00:00:00.000Z',
    wikiUrl: null,
  };
}
