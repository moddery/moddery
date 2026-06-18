import { afterEach, describe, expect, spyOn, test } from 'bun:test';

import { apolloClient } from '../apollo.js';
import {
  fetchProjectDetails,
  fetchProjectVersions,
  fetchProjectVersionSearch,
} from './catalog.js';

describe(fetchProjectDetails.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('maps project details from GraphQL into the frontend shape', async () => {
    spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        projectBySlug: {
          body: 'Project body',
          categories: ['utility'],
          color: '#f97316',
          discordUrl: null,
          downloads: 42,
          followers: 12,
          gallery: [
            {
              createdAt: '2025-12-20T00:00:00.000Z',
              description: 'Screenshot description',
              displayUrl: 'https://cdn.example.test/display.webp',
              featured: true,
              rawUrl: 'https://cdn.example.test/raw.webp',
              sortOrder: 2,
              title: 'Screenshot',
            },
          ],
          gameVersions: ['1.21.6'],
          iconUrl: null,
          id: 'project-a',
          issuesUrl: null,
          kind: 'MOD',
          license: {
            id: 'mit',
            name: 'MIT',
            url: null,
          },
          links: [
            {
              kind: 'SOURCE',
              label: null,
              url: 'https://git.example.test/project',
            },
            {
              kind: 'DONATION',
              label: 'Sponsor',
              url: 'https://sponsor.example.test/project',
            },
          ],
          loaders: ['fabric'],
          owner: {
            avatarUrl: null,
            displayName: 'Creator',
            id: 'user-a',
            username: 'creator',
          },
          publishedAt: '2025-12-15T00:00:00.000Z',
          slug: 'example',
          status: 'APPROVED',
          sourceUrl: null,
          summary: 'Project summary',
          title: 'Example',
          updatedAt: '2026-01-01T00:00:00.000Z',
          wikiUrl: null,
        },
      },
    } as never);

    const project = await fetchProjectDetails('example');

    expect(project.followers).toBe(12);
    expect(project.published).toBe('2025-12-15T00:00:00.000Z');
    expect(project.color).toBe(0xf97316);
    expect(project.projectType).toBe('mod');
    expect(project.gameVersions).toEqual(['1.21.6']);
    expect(project.sourceUrl).toBe('https://git.example.test/project');
    expect(project.donationUrls).toEqual([
      {
        id: 'Sponsor',
        platform: 'Sponsor',
        url: 'https://sponsor.example.test/project',
      },
    ]);
    expect(project.gallery[0]).toEqual({
      created: '2025-12-20T00:00:00.000Z',
      description: 'Screenshot description',
      featured: true,
      ordering: 2,
      rawUrl: 'https://cdn.example.test/raw.webp',
      title: 'Screenshot',
      url: 'https://cdn.example.test/display.webp',
    });
  });
});

describe(fetchProjectVersionSearch.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('queries filtered project versions with pagination', async () => {
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        versionSearchForProject: {
          totalHits: 7,
          versions: [
            {
              author: {
                avatarUrl: null,
                displayName: 'Release Author',
                id: 'user-a',
                username: 'author',
              },
              changelog: 'Release notes',
              channel: 'RELEASE',
              createdAt: '2026-01-01T00:00:00.000Z',
              datePublished: '2026-01-02T00:00:00.000Z',
              dependencies: [],
              downloads: 42,
              featured: true,
              files: [
                {
                  fileName: 'example.jar',
                  hashes: [{ algorithm: 'SHA512', value: 'abc123' }],
                  id: 'file-a',
                  kind: 'UNIVERSAL',
                  primary: true,
                  scans: [],
                  sizeBytes: '1234',
                  url: 'https://example.test/example.jar',
                },
              ],
              gameVersions: ['1.21.6'],
              id: 'version-a',
              loaders: ['FABRIC'],
              name: 'Example 1.0.0',
              requestedStatus: null,
              sortOrder: 7,
              status: 'APPROVED',
              updatedAt: '2026-01-03T00:00:00.000Z',
              versionNumber: '1.0.0',
            },
          ],
        },
      },
    } as never);

    const result = await fetchProjectVersionSearch('example', {
      gameVersion: '1.21.6',
      limit: 20,
      loader: 'fabric',
      page: 2,
      search: '  1.0  ',
    });

    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { variables: unknown }
      | undefined;

    expect(queryOptions?.variables).toEqual({
      gameVersion: '1.21.6',
      limit: 20,
      loader: 'fabric',
      offset: 20,
      projectSlug: 'example',
      search: '1.0',
    });
    expect(result.totalHits).toBe(7);
    expect(result.versions[0]?.files[0]?.filename).toBe('example.jar');
    expect(result.versions[0]?.loaders).toEqual(['fabric']);
  });
});

describe(fetchProjectVersions.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('maps version dependency targets from GraphQL', async () => {
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        versionsForProject: [
          {
            author: null,
            changelog: null,
            channel: 'BETA',
            createdAt: '2026-01-01T00:00:00.000Z',
            datePublished: null,
            dependencies: [
              {
                dependencyKind: 'REQUIRED',
                externalFileName: null,
                id: 'dependency-a',
                targetProject: {
                  id: 'project-b',
                  kind: 'MOD',
                  slug: 'target-project',
                  title: 'Target Project',
                },
                targetVersion: {
                  id: 'version-b',
                  versionNumber: '2.0.0',
                },
              },
              {
                dependencyKind: 'OPTIONAL',
                externalFileName: 'optional-addon.jar',
                id: 'dependency-b',
                targetProject: null,
                targetVersion: null,
              },
            ],
            downloads: 0,
            featured: false,
            files: [],
            gameVersions: ['1.21.6'],
            id: 'version-a',
            loaders: ['FABRIC'],
            name: 'Example Beta',
            requestedStatus: null,
            sortOrder: 1,
            status: 'APPROVED',
            updatedAt: '2026-01-02T00:00:00.000Z',
            versionNumber: '1.1.0-beta',
          },
        ],
      },
    } as never);

    const versions = await fetchProjectVersions('example');
    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { variables: unknown }
      | undefined;

    expect(queryOptions?.variables).toEqual({ projectSlug: 'example' });
    expect(versions[0]?.version_type).toBe('beta');
    expect(versions[0]?.dependencies).toEqual([
      {
        dependencyKind: 'REQUIRED',
        externalFileName: null,
        id: 'dependency-a',
        targetProject: {
          id: 'project-b',
          kind: 'MOD',
          slug: 'target-project',
          title: 'Target Project',
        },
        targetVersion: {
          id: 'version-b',
          versionNumber: '2.0.0',
        },
      },
      {
        dependencyKind: 'OPTIONAL',
        externalFileName: 'optional-addon.jar',
        id: 'dependency-b',
        targetProject: null,
        targetVersion: null,
      },
    ]);
  });
});
