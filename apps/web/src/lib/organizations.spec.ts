import { describe, expect, test } from 'bun:test';

import { organizationProjectToMod } from './organizations.js';

describe(organizationProjectToMod.name, () => {
  test('maps organization context onto project cards', () => {
    const mod = organizationProjectToMod(
      {
        categories: ['optimization'],
        color: '#22c55e',
        downloads: 1200,
        followers: 45,
        gameVersions: ['1.21.6'],
        iconUrl: 'https://cdn.example.test/project.webp',
        kind: 'MOD',
        loaders: ['FABRIC'],
        owner: {
          avatarUrl: null,
          displayName: 'Individual Owner',
          id: 'user-a',
          username: 'owner',
        },
        slug: 'fast-blocks',
        summary: 'Makes blocks fast.',
        title: 'Fast Blocks',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        color: '#1d9bf0',
        iconUrl: 'https://cdn.example.test/org.webp',
        id: 'org-a',
        name: 'Speed Lab',
        slug: 'speed-lab',
      },
    );

    expect(mod.author).toBe('Speed Lab');
    expect(mod.authorUsername).toBeNull();
    expect(mod.organization).toEqual({
      color: '#1d9bf0',
      iconUrl: 'https://cdn.example.test/org.webp',
      id: 'org-a',
      name: 'Speed Lab',
      slug: 'speed-lab',
    });
    expect(mod.loaders).toEqual(['fabric']);
  });

  test('uses owner attribution when organization context is absent', () => {
    const mod = organizationProjectToMod({
      categories: [],
      color: null,
      downloads: 0,
      followers: 0,
      gameVersions: [],
      iconUrl: null,
      kind: 'PLUGIN',
      loaders: [],
      owner: {
        avatarUrl: null,
        displayName: null,
        id: 'user-a',
        username: 'owner',
      },
      slug: 'server-tool',
      summary: 'Server utility.',
      title: 'Server Tool',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(mod.author).toBe('owner');
    expect(mod.authorUsername).toBe('owner');
    expect(mod.organization).toBeNull();
    expect(mod.projectType).toBe('plugin');
  });
});
