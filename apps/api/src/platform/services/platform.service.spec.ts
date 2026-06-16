import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { PlatformService } from './platform.service.js';

describe(PlatformService.name, () => {
  test('loads metadata from taxonomy tables', async () => {
    const service = new PlatformService({
      category: {
        findMany: () =>
          Promise.resolve([
            {
              description: null,
              name: 'Optimization',
              projectKind: 'MOD',
              slug: 'optimization',
            },
          ]),
      },
      gameVersion: {
        findMany: () => Promise.resolve([{ version: '1.21.6' }]),
      },
    } as unknown as PrismaService);

    const metadata = await service.metadata();

    expect(metadata.categories[0]?.slug).toBe('optimization');
    expect(metadata.gameVersions).toEqual(['1.21.6']);
    expect(metadata.loaders).toContain('fabric');
  });

  test('upserts category taxonomy rows', async () => {
    const upserts: unknown[] = [];
    const service = new PlatformService({
      category: {
        upsert: (query: unknown) => {
          upserts.push(query);
          return Promise.resolve({
            description: 'Performance projects',
            name: 'Optimization',
            projectKind: 'MOD',
            slug: 'optimization',
          });
        },
      },
    } as unknown as PrismaService);

    const category = await service.upsertCategory({
      description: ' Performance projects ',
      name: ' Optimization ',
      projectKind: ' mod ',
      slug: ' Optimization ',
    });

    expect(upserts[0]).toEqual({
      create: {
        description: 'Performance projects',
        name: 'Optimization',
        projectKind: 'MOD',
        slug: 'optimization',
      },
      update: {
        description: 'Performance projects',
        name: 'Optimization',
        projectKind: 'MOD',
      },
      where: { slug: 'optimization' },
    });
    expect(category.slug).toBe('optimization');
  });

  test('upserts game version taxonomy rows', async () => {
    const upserts: unknown[] = [];
    const service = new PlatformService({
      gameVersion: {
        upsert: (query: unknown) => {
          upserts.push(query);
          return Promise.resolve({ isActive: true, version: '1.21.6' });
        },
      },
    } as unknown as PrismaService);

    const gameVersion = await service.upsertGameVersion({
      isActive: true,
      version: ' 1.21.6 ',
    });

    expect(upserts[0]).toEqual({
      create: {
        isActive: true,
        version: '1.21.6',
      },
      update: {
        isActive: true,
      },
      where: { version: '1.21.6' },
    });
    expect(gameVersion.version).toBe('1.21.6');
  });
});
