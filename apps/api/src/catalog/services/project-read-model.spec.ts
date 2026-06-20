import { describe, expect, test } from 'bun:test';
import { type ProjectSummaryContract } from '@moddery/shared';

import {
  projectContractToSearch,
  projectSearchTags,
} from './project-read-model.js';

describe(projectSearchTags.name, () => {
  test('includes project kind, category, loader, and game version tags', () => {
    expect(
      projectSearchTags(
        projectContract({
          categories: ['utility', 'optimization'],
          gameVersions: ['1.21.6', '1.20.1'],
          licenseId: 'MIT',
          loaders: ['FABRIC', 'NeoForge'],
        }),
      ),
    ).toEqual([
      'kind:MOD',
      'category:utility',
      'category:optimization',
      'game-version:1.21.6',
      'game-version:1.20.1',
      'license:mit',
      'loader:fabric',
      'loader:neoforge',
    ]);
  });

  test('includes license tags for indexed project filtering', () => {
    expect(projectSearchTags(projectContract({ licenseId: 'MIT' }))).toContain(
      'license:mit',
    );
  });

  test('does not index placeholder license keys as searchable tags', () => {
    expect(
      projectSearchTags(projectContract({ licenseId: 'unknown' })),
    ).not.toContain('license:unknown');
  });
});

describe(projectContractToSearch.name, () => {
  test('stores normalized loader values beside prefixed search tags', () => {
    const document = projectContractToSearch(
      projectContract({
        licenseId: 'MIT',
        loaders: ['FABRIC', 'NeoForge'],
      }),
    );

    expect(document.loaders).toEqual(['fabric', 'neoforge']);
    expect(document.tags).toContain('loader:fabric');
    expect(document.tags).toContain('loader:neoforge');
  });

  test('stores the normalized license key alongside project tags', () => {
    const document = projectContractToSearch(
      projectContract({ licenseId: 'Apache-2.0' }),
    );

    expect(document.licenseKey).toBe('apache-2.0');
    expect(document.tags).toContain('license:apache-2.0');
  });
});

function projectContract({
  categories = ['utility'],
  gameVersions = ['1.21.6'],
  licenseId,
  loaders = ['FABRIC'],
}: {
  categories?: string[];
  gameVersions?: string[];
  licenseId: string;
  loaders?: string[];
}): ProjectSummaryContract {
  return {
    approvedAt: null,
    archivedAt: null,
    body: 'Body',
    categories,
    color: null,
    discordUrl: null,
    downloads: 42,
    followers: 12,
    gallery: [],
    gameVersions,
    iconUrl: null,
    id: 'project-a',
    issuesUrl: null,
    kind: 'MOD',
    license: {
      id: licenseId,
      name: licenseId,
      url: null,
    },
    links: [],
    loaders,
    moderationLock: null,
    organization: null,
    owner: null,
    publishedAt: null,
    queuedAt: null,
    requestedStatus: null,
    slug: 'example',
    sourceUrl: null,
    status: 'APPROVED',
    summary: 'Summary',
    title: 'Example',
    updatedAt: '2026-01-01T00:00:00.000Z',
    wikiUrl: null,
  };
}
