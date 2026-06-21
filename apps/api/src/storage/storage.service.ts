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
import { TeamPermission } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { PrismaService } from '../prisma/prisma.service.js';
import { versionManagementMemberWhere } from '../versions/services/version-management.js';
import { type PrepareOwnerUploadInput } from './dto/prepare-owner-upload.input.js';
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
const maxImageUploadBytes = 10 * 1024 * 1024;
const uploadUrlTtlSeconds = 10 * 60;
const uploadKinds = new Set(['gallery-image', 'project-icon', 'version-file']);
const ownerUploadKinds = new Set([
  'avatar',
  'collection-icon',
  'organization-icon',
]);
const ownerTypeForUploadKind: Record<string, OwnerType> = {
  avatar: 'user',
  'collection-icon': 'collection',
  'organization-icon': 'organization',
};
const imageUploadKinds = new Set([
  'avatar',
  'collection-icon',
  'gallery-image',
  'organization-icon',
  'project-icon',
]);

type OwnerType = 'user' | 'organization' | 'collection';
const allowedVersionFileExtensions = new Set(['.jar', '.mrpack', '.zip']);
const allowedImageContentTypes = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

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
    const projectSlug = requiredText(input.projectSlug, 'Project is required');
    const fileName = normalizedFileName(input.fileName);
    const sizeBytes = normalizedSize(input.sizeBytes);
    const contentType = normalizedContentType(input.contentType);
    validateUploadFileName(uploadKind, fileName);
    validateUploadSize(uploadKind, sizeBytes);
    validateUploadContentType(uploadKind, contentType);
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
              where:
                uploadKind === 'version-file'
                  ? versionManagementMemberWhere(userId)
                  : projectDetailsMemberWhere(userId),
            },
          },
        },
      },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    if (project.team.members.length === 0) {
      throw new ForbiddenException(
        uploadKind === 'version-file'
          ? 'Project version permission required'
          : 'Project details permission required',
      );
    }

    if (uploadKind === 'version-file' && project.status !== 'APPROVED') {
      throw new BadRequestException(
        'Project must be approved before release files can be uploaded',
      );
    }

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

  async prepareOwnerUpload(
    input: PrepareOwnerUploadInput,
    userId: string,
  ): Promise<ProjectUploadTargetContract> {
    const uploadKind = normalizedOwnerUploadKind(input.uploadKind);
    const ownerType = normalizedOwnerType(input.ownerType, uploadKind);
    const ownerId = requiredText(input.ownerId, 'Owner is required');
    const fileName = normalizedFileName(input.fileName);
    const sizeBytes = normalizedSize(input.sizeBytes);
    const contentType = normalizedContentType(input.contentType);
    validateUploadSize(uploadKind, sizeBytes);
    validateUploadContentType(uploadKind, contentType);

    const ownerSlug = await this.authorizeOwnerUpload(
      ownerType,
      ownerId,
      userId,
    );

    const bucket = this.config.getOrThrow<string>('s3.bucket');
    const key = ownerUploadKey({
      fileName,
      ownerSlug,
      ownerType,
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

  // Authorizes the upload and returns a stable slug/id used to namespace the
  // object key. Throws Forbidden/NotFound mirroring the project upload path.
  private async authorizeOwnerUpload(
    ownerType: OwnerType,
    ownerId: string,
    userId: string,
  ): Promise<string> {
    if (ownerType === 'user') {
      if (ownerId !== userId) {
        throw new ForbiddenException(
          'Avatar uploads require account ownership',
        );
      }
      return userId;
    }

    if (ownerType === 'organization') {
      const organization = await this.prisma.organization.findFirst({
        select: { slug: true },
        where: {
          id: ownerId,
          team: {
            members: {
              some: {
                acceptedAt: { not: null },
                OR: [
                  { isOwner: true },
                  { permissions: { has: TeamPermission.MANAGE_SETTINGS } },
                ],
                userId,
              },
            },
          },
        },
      });

      if (organization === null) {
        throw new ForbiddenException(
          'Organization settings permission required',
        );
      }

      return organization.slug;
    }

    const collection = await this.prisma.collection.findFirst({
      select: { slug: true },
      where: { id: ownerId, ownerId: userId },
    });

    if (collection === null) {
      throw new ForbiddenException('Collection ownership required');
    }

    return collection.slug;
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

  if (value.length > 160) {
    throw new BadRequestException('File name is too long');
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

function validateUploadFileName(uploadKind: string, fileName: string): void {
  if (uploadKind !== 'version-file') {
    return;
  }

  if (!allowedVersionFileExtensions.has(fileExtension(fileName))) {
    throw new BadRequestException(
      'Version files must be JAR, MRPACK, or ZIP archives',
    );
  }
}

function validateUploadSize(uploadKind: string, sizeBytes: number): void {
  if (imageUploadKinds.has(uploadKind) && sizeBytes > maxImageUploadBytes) {
    throw new BadRequestException('Image upload exceeds the project limit');
  }
}

function normalizedContentType(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed.toLowerCase();
}

function validateUploadContentType(
  uploadKind: string,
  contentType: string | null,
): void {
  if (!imageUploadKinds.has(uploadKind)) {
    return;
  }

  if (contentType === null) {
    throw new BadRequestException('Image upload content type is required');
  }

  if (!allowedImageContentTypes.has(contentType)) {
    throw new BadRequestException(
      'Image uploads must be PNG, JPEG, GIF, or WebP',
    );
  }
}

function requiredText(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

function projectDetailsMemberWhere(userId: string) {
  return {
    acceptedAt: { not: null },
    OR: [
      { isOwner: true },
      { permissions: { has: TeamPermission.MANAGE_DETAILS } },
    ],
    userId,
  };
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

function fileExtension(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf('.');
  return extensionIndex === -1
    ? ''
    : fileName.slice(extensionIndex).toLowerCase();
}

function encodeKeyPart(value: string): string {
  return value.replaceAll(/[^a-z0-9._-]/gi, '-').toLowerCase();
}

function normalizedOwnerUploadKind(uploadKind: string): string {
  const value = uploadKind.trim().toLowerCase();

  if (!ownerUploadKinds.has(value)) {
    throw new BadRequestException('Unsupported upload kind');
  }

  return value;
}

function normalizedOwnerType(ownerType: string, uploadKind: string): OwnerType {
  const value = ownerType.trim().toLowerCase();
  const expected = ownerTypeForUploadKind[uploadKind];

  if (value !== expected) {
    throw new BadRequestException('Owner type does not match upload kind');
  }

  return expected;
}

function ownerUploadKey({
  fileName,
  ownerSlug,
  ownerType,
  uploadKind,
}: {
  fileName: string;
  ownerSlug: string;
  ownerType: OwnerType;
  uploadKind: string;
}): string {
  const extension = extname(fileName).toLowerCase();
  const prefix =
    ownerType === 'user'
      ? 'users'
      : ownerType === 'organization'
        ? 'organizations'
        : 'collections';

  return [
    prefix,
    encodeKeyPart(ownerSlug),
    uploadKind,
    `${randomUUID()}${extension}`,
  ].join('/');
}
