import { S3Client } from '@aws-sdk/client-s3';
import { ForbiddenException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { type PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from './storage.service.js';

function serviceWithProject(project: unknown) {
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
        findUnique: () => Promise.resolve(project),
      },
    } as unknown as PrismaService,
    new S3Client({
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
      endpoint: 'https://s3.example.test',
      forcePathStyle: true,
      region: 'us-east-1',
    }),
  );
}

describe(StorageService.name, () => {
  test('prepares project upload targets for accepted project members', async () => {
    const target = await serviceWithProject({
      id: 'project-a',
      slug: 'cool-project',
      team: { members: [{ userId: 'user-a' }] },
    }).prepareProjectUpload(
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

  test('requires project membership before preparing uploads', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
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
  });

  test('rejects unsupported upload kinds', async () => {
    let caught: unknown;

    try {
      await serviceWithProject({
        id: 'project-a',
        slug: 'cool-project',
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
});
