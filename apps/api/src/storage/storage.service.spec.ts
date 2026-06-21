import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from './storage.service.js';

function serviceWithProject(project: unknown, queries: unknown[] = []) {
  return new StorageService(
    {
      getOrThrow: (key: string) => {
        if (key === 's3.bucket') return 'project-files';
        if (key === 's3.publicBaseUrl') return 'https://cdn.example.test/root';
        throw new Error(`Unexpected config key ${key}`);
      },
    } as never,
    {
      project: {
        findUnique: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(project);
        },
      },
    } as unknown as PrismaService,
    s3Client('https://internal-s3.example.test'),
    s3Client('https://s3.example.test'),
  );
}

function s3Client(endpoint: string): S3Client {
  return new S3Client({
    credentials: {
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
    },
    endpoint,
    forcePathStyle: true,
    region: 'us-east-1',
  });
}

describe(StorageService.name, () => {
  test('prepares release file uploads for project owners or version managers', async () => {
    const queries: unknown[] = [];
    const target = await serviceWithProject(
      {
        id: 'project-a',
        slug: 'cool-project',
        status: 'APPROVED',
        team: { members: [{ userId: 'user-a' }] },
      },
      queries,
    ).prepareProjectUpload(
      {
        contentType: ' application/zip ',
        fileName: 'release.zip',
        projectSlug: 'cool-project',
        sizeBytes: 1024,
        uploadKind: 'version-file',
      },
      'user-a',
    );

    expect(target.bucket).toBe('project-files');
    expect(queries[0]).toMatchObject({
      select: {
        team: {
          select: {
            members: {
              where: {
                acceptedAt: { not: null },
                OR: [
                  { isOwner: true },
                  { permissions: { has: 'MANAGE_VERSIONS' } },
                ],
                userId: 'user-a',
              },
            },
          },
        },
      },
    });
    expect(target.key).toMatch(
      /^projects\/cool-project\/version-file\/[a-f0-9-]+\.zip$/,
    );
    expect(target.method).toBe('PUT');
    expect(target.objectUrl).toBe(
      `https://cdn.example.test/root/${target.key}`,
    );
    expect(target.uploadUrl).toContain('https://s3.example.test');
    expect(target.uploadUrl).toContain('X-Amz-Signature=');
  });

  test('probes the configured storage bucket', async () => {
    const sentCommands: unknown[] = [];
    const service = new StorageService(
      {
        getOrThrow: (key: string) => {
          if (key === 's3.bucket') return 'project-files';
          if (key === 's3.publicBaseUrl') return 'https://cdn.example.test';
          throw new Error(`Unexpected config key ${key}`);
        },
      } as never,
      { project: {} } as unknown as PrismaService,
      {
        send: (command: unknown) => {
          sentCommands.push(command);
          return Promise.resolve();
        },
      } as never,
      s3Client('https://s3.example.test'),
    );

    await service.ping();

    expect(sentCommands).toHaveLength(1);
    expect(sentCommands[0]).toBeInstanceOf(HeadBucketCommand);
  });

  test('requires project version permission before preparing uploads', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
        status: 'APPROVED',
        team: { members: [] },
      }).prepareProjectUpload(
        {
          fileName: 'release.zip',
          projectSlug: 'cool-project',
          sizeBytes: 1024,
          uploadKind: 'version-file',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ForbiddenException);
    expect(caught).toHaveProperty(
      'message',
      'Project version permission required',
    );
  });

  test('requires approved projects before preparing release file uploads', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
        status: 'PENDING_REVIEW',
        team: { members: [{ userId: 'user-a' }] },
      }).prepareProjectUpload(
        {
          fileName: 'release.zip',
          projectSlug: 'cool-project',
          sizeBytes: 1024,
          uploadKind: 'version-file',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught).toHaveProperty(
      'message',
      'Project must be approved before release files can be uploaded',
    );
  });

  test('allows setup image uploads before project approval', async () => {
    const queries: unknown[] = [];
    const target = await serviceWithProject(
      {
        id: 'project-a',
        slug: 'cool-project',
        status: 'PENDING_REVIEW',
        team: { members: [{ userId: 'user-a' }] },
      },
      queries,
    ).prepareProjectUpload(
      {
        contentType: 'image/png',
        fileName: 'icon.png',
        projectSlug: 'cool-project',
        sizeBytes: 1024,
        uploadKind: 'project-icon',
      },
      'user-a',
    );

    expect(target.key).toMatch(
      /^projects\/cool-project\/project-icon\/[a-f0-9-]+\.png$/,
    );
    expect(queries[0]).toMatchObject({
      select: {
        team: {
          select: {
            members: {
              where: {
                acceptedAt: { not: null },
                OR: [
                  { isOwner: true },
                  { permissions: { has: 'MANAGE_DETAILS' } },
                ],
                userId: 'user-a',
              },
            },
          },
        },
      },
    });
  });

  test('rejects missing project slugs before project lookups', async () => {
    const service = new StorageService(
      {
        getOrThrow: (key: string) => {
          if (key === 's3.bucket') return 'project-files';
          if (key === 's3.publicBaseUrl') return 'https://cdn.example.test';
          throw new Error(`Unexpected config key ${key}`);
        },
      } as never,
      {
        project: {
          findUnique: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      s3Client('https://internal-s3.example.test'),
      s3Client('https://s3.example.test'),
    );

    let caught: unknown;
    try {
      await service.prepareProjectUpload(
        {
          fileName: 'icon.png',
          projectSlug: ' ',
          sizeBytes: 1024,
          uploadKind: 'project-icon',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toHaveProperty('message', 'Project is required');
  });

  test('rejects non-image project image uploads before project lookups', async () => {
    const service = new StorageService(
      {
        getOrThrow: (key: string) => {
          if (key === 's3.bucket') return 'project-files';
          if (key === 's3.publicBaseUrl') return 'https://cdn.example.test';
          throw new Error(`Unexpected config key ${key}`);
        },
      } as never,
      {
        project: {
          findUnique: () => {
            throw new Error('Project lookup should not run');
          },
        },
      } as unknown as PrismaService,
      s3Client('https://internal-s3.example.test'),
      s3Client('https://s3.example.test'),
    );

    let caught: unknown;
    try {
      await service.prepareProjectUpload(
        {
          contentType: 'application/javascript',
          fileName: 'icon.js',
          projectSlug: 'cool-project',
          sizeBytes: 1024,
          uploadKind: 'project-icon',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toHaveProperty(
      'message',
      'Image uploads must be PNG, JPEG, GIF, or WebP',
    );
  });

  test('rejects unsupported release file extensions before project lookups', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
        status: 'APPROVED',
        team: { members: [{ userId: 'user-a' }] },
      }).prepareProjectUpload(
        {
          fileName: 'release.exe',
          projectSlug: 'cool-project',
          sizeBytes: 1024,
          uploadKind: 'version-file',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught).toHaveProperty(
      'message',
      'Version files must be JAR, MRPACK, or ZIP archives',
    );
  });

  test('rejects oversized images before project lookups', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
        status: 'APPROVED',
        team: { members: [{ userId: 'user-a' }] },
      }).prepareProjectUpload(
        {
          contentType: 'image/png',
          fileName: 'icon.png',
          projectSlug: 'cool-project',
          sizeBytes: 11 * 1024 * 1024,
          uploadKind: 'project-icon',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught).toHaveProperty(
      'message',
      'Image upload exceeds the project limit',
    );
  });

  test('rejects unsupported upload kinds', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
        status: 'APPROVED',
        team: { members: [{ userId: 'user-a' }] },
      }).prepareProjectUpload(
        {
          fileName: 'release.zip',
          projectSlug: 'cool-project',
          sizeBytes: 1024,
          uploadKind: 'avatar',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught).toHaveProperty('message', 'Unsupported upload kind');
  });

  test('prepares avatar uploads for the owning user', async () => {
    const target = await ownerService().prepareOwnerUpload(
      {
        contentType: 'image/png',
        fileName: 'me.png',
        ownerId: 'user-a',
        ownerType: 'user',
        sizeBytes: 1024,
        uploadKind: 'avatar',
      },
      'user-a',
    );

    expect(target.key).toMatch(/^users\/user-a\/avatar\/[a-f0-9-]+\.png$/);
    expect(target.method).toBe('PUT');
    expect(target.objectUrl).toBe(
      `https://cdn.example.test/root/${target.key}`,
    );
  });

  test('rejects avatar uploads for a different user', async () => {
    let caught: unknown;
    try {
      await ownerService().prepareOwnerUpload(
        {
          contentType: 'image/png',
          fileName: 'me.png',
          ownerId: 'user-b',
          ownerType: 'user',
          sizeBytes: 1024,
          uploadKind: 'avatar',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ForbiddenException);
    expect(caught).toHaveProperty(
      'message',
      'Avatar uploads require account ownership',
    );
  });

  test('prepares organization icon uploads for managers', async () => {
    const queries: unknown[] = [];
    const target = await ownerService({
      organization: { slug: 'acme' },
      queries,
    }).prepareOwnerUpload(
      {
        contentType: 'image/png',
        fileName: 'logo.png',
        ownerId: 'org-a',
        ownerType: 'organization',
        sizeBytes: 1024,
        uploadKind: 'organization-icon',
      },
      'user-a',
    );

    expect(target.key).toMatch(
      /^organizations\/acme\/organization-icon\/[a-f0-9-]+\.png$/,
    );
    expect(queries[0]).toMatchObject({
      where: {
        id: 'org-a',
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: 'MANAGE_SETTINGS' } },
              ],
              userId: 'user-a',
            },
          },
        },
      },
    });
  });

  test('rejects organization icon uploads without management permission', async () => {
    let caught: unknown;
    try {
      await ownerService({ organization: null }).prepareOwnerUpload(
        {
          contentType: 'image/png',
          fileName: 'logo.png',
          ownerId: 'org-a',
          ownerType: 'organization',
          sizeBytes: 1024,
          uploadKind: 'organization-icon',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ForbiddenException);
    expect(caught).toHaveProperty(
      'message',
      'Organization settings permission required',
    );
  });

  test('prepares collection icon uploads for the owner', async () => {
    const target = await ownerService({
      collection: { slug: 'favorites' },
    }).prepareOwnerUpload(
      {
        contentType: 'image/png',
        fileName: 'cover.png',
        ownerId: 'collection-a',
        ownerType: 'collection',
        sizeBytes: 1024,
        uploadKind: 'collection-icon',
      },
      'user-a',
    );

    expect(target.key).toMatch(
      /^collections\/favorites\/collection-icon\/[a-f0-9-]+\.png$/,
    );
  });

  test('rejects collection icon uploads for non-owners', async () => {
    let caught: unknown;
    try {
      await ownerService({ collection: null }).prepareOwnerUpload(
        {
          contentType: 'image/png',
          fileName: 'cover.png',
          ownerId: 'collection-a',
          ownerType: 'collection',
          sizeBytes: 1024,
          uploadKind: 'collection-icon',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ForbiddenException);
    expect(caught).toHaveProperty('message', 'Collection ownership required');
  });

  test('rejects owner uploads when owner type mismatches the kind', async () => {
    let caught: unknown;
    try {
      await ownerService().prepareOwnerUpload(
        {
          contentType: 'image/png',
          fileName: 'me.png',
          ownerId: 'user-a',
          ownerType: 'organization',
          sizeBytes: 1024,
          uploadKind: 'avatar',
        },
        'user-a',
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught).toHaveProperty(
      'message',
      'Owner type does not match upload kind',
    );
  });
});

function ownerService({
  organization,
  collection,
  queries = [],
}: {
  organization?: unknown;
  collection?: unknown;
  queries?: unknown[];
} = {}) {
  return new StorageService(
    {
      getOrThrow: (key: string) => {
        if (key === 's3.bucket') return 'project-files';
        if (key === 's3.publicBaseUrl') return 'https://cdn.example.test/root';
        throw new Error(`Unexpected config key ${key}`);
      },
    } as never,
    {
      collection: {
        findFirst: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(collection ?? null);
        },
      },
      organization: {
        findFirst: (query: unknown) => {
          queries.push(query);
          return Promise.resolve(organization ?? null);
        },
      },
    } as unknown as PrismaService,
    s3Client('https://internal-s3.example.test'),
    s3Client('https://s3.example.test'),
  );
}
