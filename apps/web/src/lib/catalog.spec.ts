import { afterEach, describe, expect, spyOn, test } from 'bun:test';

import { apolloClient } from '../apollo.js';
import { fetchProjectDetails } from './catalog.js';

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
