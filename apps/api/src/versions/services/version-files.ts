import { BadRequestException } from '@nestjs/common';
import { HashAlgorithm, type Prisma } from '@prisma/client';

import { type CreateVersionInput } from '../dto/create-version.input.js';

const MAX_VERSION_FILES = 8;
const MAX_FILE_HASHES = 8;

export async function createVersionFiles(
  tx: Prisma.TransactionClient,
  versionId: string,
  files: CreateVersionInput['files'],
): Promise<void> {
  for (const file of files) {
    const created = await tx.versionFile.create({
      data: {
        bucket: 'external',
        fileName: file.fileName.trim(),
        isPrimary: file.primary,
        key: `${versionId}/${file.fileName.trim()}`,
        sizeBytes: BigInt(file.sizeBytes),
        url: file.url.trim(),
        versionId,
      },
      select: { id: true },
    });

    for (const hash of file.hashes ?? []) {
      const algorithm = normalizeHashAlgorithm(hash.algorithm);

      const value = hash.value.trim().toLowerCase();
      if (value.length === 0) {
        throw new BadRequestException('Version file hash value is required');
      }

      await tx.fileHash.upsert({
        create: {
          algorithm,
          fileId: created.id,
          value,
        },
        update: { value },
        where: {
          fileId_algorithm: {
            algorithm,
            fileId: created.id,
          },
        },
      });
    }
  }
}

export function validateVersionFiles(
  files: CreateVersionInput['files'],
  publicBaseUrl: string,
): void {
  if (files.length === 0) {
    throw new BadRequestException('At least one version file is required');
  }

  if (files.length > MAX_VERSION_FILES) {
    throw new BadRequestException('A version can include at most 8 files');
  }

  if (!files.some((file) => file.primary)) {
    throw new BadRequestException('A primary version file is required');
  }

  for (const file of files) {
    if (file.fileName.trim().length === 0) {
      throw new BadRequestException('Version file name is required');
    }

    const url = file.url.trim();
    if (url.length === 0) {
      throw new BadRequestException('Version file URL is required');
    }

    if (!isStorageObjectUrl(url, publicBaseUrl)) {
      throw new BadRequestException(
        'Version file URL must use project storage',
      );
    }

    if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes <= 0) {
      throw new BadRequestException('Version file size must be positive');
    }

    if ((file.hashes?.length ?? 0) > MAX_FILE_HASHES) {
      throw new BadRequestException(
        'A version file can include at most 8 hashes',
      );
    }

    for (const hash of file.hashes ?? []) {
      normalizeHashAlgorithm(hash.algorithm);

      if (hash.value.trim().length === 0) {
        throw new BadRequestException('Version file hash value is required');
      }
    }
  }
}

function isStorageObjectUrl(url: string, publicBaseUrl: string): boolean {
  const normalizedBase = publicBaseUrl.trim().replace(/\/+$/, '');
  if (normalizedBase.length === 0) return false;

  try {
    const candidate = new URL(url);
    const base = new URL(`${normalizedBase}/`);
    return (
      candidate.protocol === base.protocol &&
      candidate.host === base.host &&
      candidate.pathname.startsWith(base.pathname)
    );
  } catch {
    return false;
  }
}

function normalizeHashAlgorithm(value: string): HashAlgorithm {
  const normalized = value.trim().toUpperCase();
  if (normalized === HashAlgorithm.SHA1) return HashAlgorithm.SHA1;
  if (normalized === HashAlgorithm.SHA256) return HashAlgorithm.SHA256;
  if (normalized === HashAlgorithm.SHA512) return HashAlgorithm.SHA512;
  throw new BadRequestException('Unsupported version file hash algorithm');
}
