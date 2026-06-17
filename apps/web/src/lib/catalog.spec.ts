import { afterEach, describe, expect, spyOn, test } from 'bun:test';

import { apolloClient } from '../apollo.js';
import { fetchProjectDetails, fetchProjectVersionSearch } from './catalog.js';

describe(fetchProjectDetails.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('maps project follower counts from GraphQL details', async () => {
    spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        projectBySlug: {
          body: 'Project body',
          categories: ['utility'],
          color: '#f97316',
          downloads: 42,
          followers: 12,
          gallery: [],
          gameVersions: ['1.21.6'],
          iconUrl: null,
          id: 'project-a',
          kind: 'MOD',
          license: {
            id: 'mit',
            name: 'MIT',
            url: null,
          },
          links: [],
          loaders: ['fabric'],
          publishedAt: '2025-12-15T00:00:00.000Z',
          slug: 'example',
          status: 'APPROVED',
          summary: 'Project summary',
          title: 'Example',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    } as never);

    const project = await fetchProjectDetails('example');

    expect(project.followers).toBe(12);
    expect(project.published).toBe('2025-12-15T00:00:00.000Z');
    expect(project.color).toBe(0xf97316);
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
