import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
  test('prepares project upload targets for accepted project members', async () => {
    const target = await serviceWithProject({
      id: 'project-a',
      slug: 'cool-project',
      status: 'APPROVED',
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

  test('requires project membership before preparing uploads', async () => {
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
    const target = await serviceWithProject({
      id: 'project-a',
      slug: 'cool-project',
      status: 'PENDING_REVIEW',
      team: { members: [{ userId: 'user-a' }] },
    }).prepareProjectUpload(
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
});
