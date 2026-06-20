import { afterEach, describe, expect, spyOn, test } from 'bun:test';

import { apolloClient } from '../apollo.js';
import {
  fetchFilterTags,
  fetchProjectDetails,
  fetchProjectMembers,
  fetchProjectVersions,
  fetchProjectVersionSearch,
  searchProjects,
} from './catalog.js';

describe(fetchProjectDetails.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('maps project details from GraphQL into the frontend shape', async () => {
    const signal = new AbortController().signal;
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
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
            {
              kind: 'WEBSITE',
              label: 'Homepage',
              url: 'https://project.example.test',
            },
            {
              kind: 'OTHER',
              label: null,
              url: 'https://docs.example.test/project',
            },
          ],
          loaders: ['fabric'],
          owner: {
            avatarUrl: null,
            displayName: 'Creator',
            id: 'user-a',
            username: 'creator',
          },
          approvedAt: '2025-12-16T00:00:00.000Z',
          archivedAt: null,
          publishedAt: '2025-12-15T00:00:00.000Z',
          queuedAt: '2025-12-14T00:00:00.000Z',
          requestedStatus: null,
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

    const project = await fetchProjectDetails('example', signal);
    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { context?: { fetchOptions?: { signal?: AbortSignal } } }
      | undefined;

    expect(queryOptions?.context?.fetchOptions?.signal).toBe(signal);
    expect(project.followers).toBe(12);
    expect(project.published).toBe('2025-12-15T00:00:00.000Z');
    expect(project.approvedAt).toBe('2025-12-16T00:00:00.000Z');
    expect(project.queuedAt).toBe('2025-12-14T00:00:00.000Z');
    expect(project.status).toBe('APPROVED');
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
    expect(project.externalLinks).toEqual([
      {
        id: 'WEBSITE:https://project.example.test',
        label: 'Homepage',
        url: 'https://project.example.test',
      },
      {
        id: 'OTHER:https://docs.example.test/project',
        label: 'OTHER',
        url: 'https://docs.example.test/project',
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

describe(fetchProjectMembers.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('passes abort signals to the GraphQL project members request', async () => {
    const signal = new AbortController().signal;
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        projectMembers: [],
      },
    } as never);

    await fetchProjectMembers('example', signal);

    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { context?: { fetchOptions?: { signal?: AbortSignal } } }
      | undefined;

    expect(queryOptions?.context?.fetchOptions?.signal).toBe(signal);
  });
});

describe(searchProjects.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('sends license filters and follows sorting as project search tags', async () => {
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        projectSearch: {
          projects: [],
          totalHits: 0,
        },
      },
    } as never);

    await searchProjects({
      categories: ['optimization'],
      licenses: ['MIT'],
      limit: 20,
      loaders: ['fabric'],
      page: 2,
      projectType: 'mod',
      query: '  sodium  ',
      sort: 'follows',
      versions: ['1.21.6'],
    });

    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { variables: unknown }
      | undefined;

    expect(queryOptions?.variables).toEqual({
      query: {
        limit: 20,
        offset: 20,
        search: 'sodium',
        sort: 'follows',
        tags: [
          'kind:MOD',
          'category:optimization',
          'license:mit',
          'loader:fabric',
          'game-version:1.21.6',
        ],
      },
    });
  });

  test('passes abort signals to the GraphQL project search request', async () => {
    const signal = new AbortController().signal;
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        projectSearch: {
          projects: [],
          totalHits: 0,
        },
      },
    } as never);

    await searchProjects({
      categories: [],
      limit: 20,
      loaders: [],
      page: 1,
      projectType: 'plugin',
      query: '',
      signal,
      sort: 'relevance',
      versions: [],
    });

    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { context?: { fetchOptions?: { signal?: AbortSignal } } }
      | undefined;

    expect(queryOptions?.context?.fetchOptions?.signal).toBe(signal);
  });
});

describe(fetchFilterTags.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('passes abort signals to the GraphQL platform metadata request', async () => {
    const signal = new AbortController().signal;
    const querySpy = spyOn(apolloClient, 'query').mockResolvedValue({
      data: {
        platformMetadata: {
          categories: [
            {
              description: null,
              name: 'Optimization',
              projectKind: 'MOD',
              slug: 'optimization',
            },
            {
              description: null,
              name: 'Server',
              projectKind: 'PLUGIN',
              slug: 'server',
            },
            {
              description: null,
              name: 'Library',
              projectKind: null,
              slug: 'library',
            },
          ],
          gameVersions: [],
          licenses: [],
          loaders: [],
        },
      },
    } as never);

    const filterTags = await fetchFilterTags('mod', signal);

    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | { context?: { fetchOptions?: { signal?: AbortSignal } } }
      | undefined;

    expect(queryOptions?.context?.fetchOptions?.signal).toBe(signal);
    expect(filterTags.categories.map((category) => category.slug)).toEqual([
      'optimization',
      'library',
    ]);
  });
});

describe(fetchProjectVersions.name, () => {
  afterEach(() => {
    spyOn(apolloClient, 'query').mockRestore();
  });

  test('maps version dependency targets from GraphQL', async () => {
    const signal = new AbortController().signal;
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

    const versions = await fetchProjectVersions('example', signal);
    const queryOptions = querySpy.mock.calls[0]?.[0] as
      | {
          context?: { fetchOptions?: { signal?: AbortSignal } };
          variables: unknown;
        }
      | undefined;

    expect(queryOptions?.context?.fetchOptions?.signal).toBe(signal);
    expect(queryOptions?.variables).toEqual({ projectSlug: 'example' });
    expect(versions[0]?.versionType).toBe('beta');
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
