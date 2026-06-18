import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectGalleryService } from './project-gallery.service.js';

function createProjectGalleryService(prisma: PrismaService) {
  return new ProjectGalleryService(prisma, {
    delete: () => Promise.resolve(),
  } as never);
}

describe(ProjectGalleryService.name, () => {
  test('adds gallery images to managed projects', async () => {
    const creates: unknown[] = [];
    const service = createProjectGalleryService({
      project: {
        findFirst: () => Promise.resolve({ id: 'project-a' }),
        findUniqueOrThrow: () =>
          Promise.resolve(
            projectRow({
              gallery: [
                {
                  createdAt: new Date('2026-01-02T00:00:00.000Z'),
                  description: 'Preview',
                  displayUrl: 'https://example.test/display.png',
                  featured: true,
                  rawUrl: 'https://example.test/raw.png',
                  sortOrder: 1,
                  title: 'Screenshot',
                },
              ],
              title: 'Example',
            }),
          ),
      },
      projectGalleryImage: {
        create: (query: unknown) => {
          creates.push(query);
          return Promise.resolve({});
        },
      },
    } as unknown as PrismaService);

    const project = await service.addProjectGalleryImage(
      {
        description: ' Preview ',
        displayUrl: ' https://example.test/display.png ',
        featured: true,
        projectSlug: 'example',
        rawUrl: ' https://example.test/raw.png ',
        sortOrder: 1,
        title: ' Screenshot ',
      },
      'user-a',
    );

    expect(creates[0]).toEqual({
      data: {
        description: 'Preview',
        displayUrl: 'https://example.test/display.png',
        featured: true,
        projectId: 'project-a',
        rawUrl: 'https://example.test/raw.png',
        sortOrder: 1,
        title: 'Screenshot',
      },
    });
    expect(project.gallery[0]?.title).toBe('Screenshot');
  });
});

function projectRow({
  gallery = [],
  license = { key: 'mit', name: 'MIT', url: null },
  links = [],
  moderationLock = null,
  status = 'APPROVED',
  title,
}: {
  gallery?: {
    createdAt: Date;
    description: string | null;
    displayUrl: string;
    featured: boolean;
    rawUrl: string;
    sortOrder: number;
    title: string | null;
  }[];
  license?: { key: string; name: string; url: string | null };
  links?: { kind: string; label: string | null; url: string }[];
  moderationLock?: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    moderator: {
      displayName: string | null;
      id: string;
      username: string;
    };
  } | null;
  status?: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'ARCHIVED';
  title: string;
}) {
  return {
    approvedAt:
      status === 'APPROVED' ? new Date('2026-01-01T00:00:00.000Z') : null,
    archivedAt:
      status === 'ARCHIVED' ? new Date('2026-01-01T00:00:00.000Z') : null,
    categories: [{ category: { slug: 'utility' } }],
    color: '#f97316',
    description: 'Updated body',
    discordUrl: null,
    downloads: 10,
    followers: 2,
    gallery,
    gameVersions: [{ gameVersion: { version: '1.21.6' } }],
    iconUrl: 'https://example.test/icon.png',
    id: 'project-a',
    issuesUrl: null,
    kind: 'MOD',
    license,
    links,
    loaders: [{ loader: 'FABRIC' }],
    moderationLock,
    organization: {
      color: '#1d9bf0',
      iconUrl: 'https://example.test/org.png',
      id: 'organization-a',
      name: 'Example Org',
      slug: 'example-org',
    },
    publishedAt: new Date('2025-12-15T00:00:00.000Z'),
    queuedAt:
      status === 'PENDING_REVIEW' ? new Date('2026-01-01T00:00:00.000Z') : null,
    requestedStatus: null,
    slug: 'example',
    sourceUrl: 'https://example.test/source',
    status,
    summary: 'Updated summary',
    team: {
      members: [
        {
          user: {
            avatarUrl: null,
            displayName: 'Project Creator',
            id: 'user-owner',
            username: 'creator',
          },
        },
      ],
    },
    title,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    wikiUrl: null,
  };
}
