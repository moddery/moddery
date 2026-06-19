import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HeadBucketCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { PrismaService } from '../prisma/prisma.service.js';
import { type PrepareProjectUploadInput } from './dto/prepare-project-upload.input.js';
import { S3_CLIENT, S3_PRESIGN_CLIENT } from './storage.constants.js';

export interface ProjectUploadTargetContract {
  bucket: string;
  expiresAt: Date;
  key: string;
  method: 'PUT';
  objectUrl: string;
  uploadUrl: string;
}

const maxUploadBytes = 512 * 1024 * 1024;
const uploadUrlTtlSeconds = 10 * 60;
const uploadKinds = new Set(['gallery-image', 'project-icon', 'version-file']);

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    @Inject(S3_PRESIGN_CLIENT) private readonly presignS3: S3Client,
  ) {}

  async ping(): Promise<void> {
    await this.s3.send(
      new HeadBucketCommand({
        Bucket: this.config.getOrThrow<string>('s3.bucket'),
      }),
    );
  }

  async prepareProjectUpload(
    input: PrepareProjectUploadInput,
    userId: string,
  ): Promise<ProjectUploadTargetContract> {
    const uploadKind = normalizedUploadKind(input.uploadKind);
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
        slug: true,
        status: true,
        team: {
          select: {
            members: {
              select: { userId: true },
              take: 1,
              where: {
                acceptedAt: { not: null },
                userId,
              },
            },
          },
        },
      },
      where: { slug: input.projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    if (project.team.members.length === 0) {
      throw new ForbiddenException('Project membership required');
    }

    if (uploadKind === 'version-file' && project.status !== 'APPROVED') {
      throw new BadRequestException(
        'Project must be approved before release files can be uploaded',
      );
    }

    const fileName = normalizedFileName(input.fileName);
    const sizeBytes = normalizedSize(input.sizeBytes);
    const contentType = nullableTrim(input.contentType);
    const bucket = this.config.getOrThrow<string>('s3.bucket');
    const key = projectUploadKey({
      fileName,
      projectSlug: project.slug,
      uploadKind,
    });

    const uploadUrl = await getSignedUrl(
      this.presignS3,
      new PutObjectCommand({
        Bucket: bucket,
        ContentLength: sizeBytes,
        ContentType: contentType ?? undefined,
        Key: key,
      }),
      { expiresIn: uploadUrlTtlSeconds },
    );

    return {
      bucket,
      expiresAt: new Date(Date.now() + uploadUrlTtlSeconds * 1000),
      key,
      method: 'PUT',
      objectUrl: publicObjectUrl(
        this.config.getOrThrow<string>('s3.publicBaseUrl'),
        key,
      ),
      uploadUrl,
    };
  }
}

function normalizedUploadKind(uploadKind: string): string {
  const value = uploadKind.trim().toLowerCase();

  if (!uploadKinds.has(value)) {
    throw new BadRequestException('Unsupported upload kind');
  }

  return value;
}

function normalizedFileName(fileName: string): string {
  const value = fileName.trim();

  if (value.length === 0) {
    throw new BadRequestException('File name is required');
  }

  if (value.includes('/') || value.includes('\\')) {
    throw new BadRequestException('File name cannot contain path separators');
  }

  return value;
}

function normalizedSize(sizeBytes: number): number {
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) {
    throw new BadRequestException('Upload size must be a positive integer');
  }

  if (sizeBytes > maxUploadBytes) {
    throw new BadRequestException('Upload size exceeds the project limit');
  }

  return sizeBytes;
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function projectUploadKey({
  fileName,
  projectSlug,
  uploadKind,
}: {
  fileName: string;
  projectSlug: string;
  uploadKind: string;
}): string {
  const extension = extname(fileName).toLowerCase();
  return [
    'projects',
    encodeKeyPart(projectSlug),
    uploadKind,
    `${randomUUID()}${extension}`,
  ].join('/');
}

function publicObjectUrl(baseUrl: string, key: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');

  return `${normalizedBase}/${encodedKey}`;
}

function encodeKeyPart(value: string): string {
  return value.replaceAll(/[^a-z0-9._-]/gi, '-').toLowerCase();
}
