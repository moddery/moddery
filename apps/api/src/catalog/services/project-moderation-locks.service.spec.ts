import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../../prisma/prisma.service.js';
import { ProjectModerationLocksService } from './project-moderation-locks.service.js';

function createProjectModerationLocksService(prisma: PrismaService) {
  return new ProjectModerationLocksService(prisma, fakeRedis());
}

function fakeRedis() {
  return {
    delete: () => Promise.resolve(),
  } as never;
}

describe(ProjectModerationLocksService.name, () => {
  test('locks projects for moderator review', async () => {
    const upserts: unknown[] = [];
    const service = createProjectModerationLocksService({
      moderationLock: {
        upsert: (query: unknown) => {
          upserts.push(query);
          return Promise.resolve({});
        },
      },
      project: {
        findUnique: () => Promise.resolve({ id: 'project-a' }),
        findUniqueOrThrow: () =>
          Promise.resolve(
            projectRow({
              moderationLock: moderationLockRow(),
              status: 'PENDING_REVIEW',
              title: 'Queued',
            }),
          ),
      },
    } as unknown as PrismaService);

    const project = await service.lockProjectForModeration(
      'example',
      'moderator-a',
    );

    expect(upserts[0]).toEqual(
      expect.objectContaining({
        create: expect.objectContaining({
          moderatorId: 'moderator-a',
          projectId: 'project-a',
        }),
        update: expect.objectContaining({
          moderatorId: 'moderator-a',
        }),
        where: { projectId: 'project-a' },
      }),
    );
    expect(project.moderationLock?.moderator.username).toBe('moderator');
  });

  test('releases project moderation locks owned by the moderator', async () => {
    const deletes: unknown[] = [];
    const service = createProjectModerationLocksService({
      moderationLock: {
        deleteMany: (query: unknown) => {
          deletes.push(query);
          return Promise.resolve({ count: 1 });
        },
      },
      project: {
        findUnique: () =>
          Promise.resolve({
            id: 'project-a',
            moderationLock: { moderatorId: 'moderator-a' },
          }),
        findUniqueOrThrow: () =>
          Promise.resolve(
            projectRow({ status: 'PENDING_REVIEW', title: 'Queued' }),
          ),
      },
    } as unknown as PrismaService);

    const project = await service.releaseProjectModerationLock(
      'example',
      'moderator-a',
    );

    expect(deletes[0]).toEqual({ where: { projectId: 'project-a' } });
    expect(project.moderationLock).toBeNull();
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
  moderationLock?: ReturnType<typeof moderationLockRow> | null;
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

function moderationLockRow() {
  return {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    expiresAt: new Date('2026-01-01T00:30:00.000Z'),
    id: 'lock-a',
    moderator: {
      displayName: 'Moderator',
      id: 'moderator-a',
      username: 'moderator',
    },
  };
}
