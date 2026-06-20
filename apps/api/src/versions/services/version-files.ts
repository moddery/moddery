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
  projectSlug: string,
): void {
  if (files.length === 0) {
    throw new BadRequestException('At least one version file is required');
  }

  if (files.length > MAX_VERSION_FILES) {
    throw new BadRequestException('A version can include at most 8 files');
  }

  const primaryFiles = files.filter((file) => file.primary);
  if (primaryFiles.length === 0) {
    throw new BadRequestException('A primary version file is required');
  }

  if (primaryFiles.length > 1) {
    throw new BadRequestException('Only one primary version file is allowed');
  }

  const fileNames = new Set<string>();
  for (const file of files) {
    const fileName = file.fileName.trim();
    if (fileName.length === 0) {
      throw new BadRequestException('Version file name is required');
    }

    if (fileNames.has(fileName)) {
      throw new BadRequestException('Version file names must be unique');
    }
    fileNames.add(fileName);

    const url = file.url.trim();
    if (url.length === 0) {
      throw new BadRequestException('Version file URL is required');
    }

    if (!isProjectVersionFileUrl(url, publicBaseUrl, projectSlug)) {
      throw new BadRequestException(
        'Version file URL must use this project release storage',
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

    const hashAlgorithms = new Set<HashAlgorithm>();
    for (const hash of file.hashes ?? []) {
      const algorithm = normalizeHashAlgorithm(hash.algorithm);
      if (hashAlgorithms.has(algorithm)) {
        throw new BadRequestException(
          'Version file hash algorithms must be unique',
        );
      }
      hashAlgorithms.add(algorithm);

      if (hash.value.trim().length === 0) {
        throw new BadRequestException('Version file hash value is required');
      }
    }
  }
}

function isProjectVersionFileUrl(
  url: string,
  publicBaseUrl: string,
  projectSlug: string,
): boolean {
  const normalizedBase = publicBaseUrl.trim().replace(/\/+$/, '');
  if (normalizedBase.length === 0) return false;

  try {
    const candidate = new URL(url);
    const base = new URL(`${normalizedBase}/`);
    const basePath = base.pathname.replace(/\/+$/, '');
    const expectedPathPrefix = `${basePath}/projects/${encodeStorageKeyPart(
      projectSlug,
    )}/version-file/`;

    return (
      candidate.protocol === base.protocol &&
      candidate.host === base.host &&
      candidate.pathname.startsWith(expectedPathPrefix)
    );
  } catch {
    return false;
  }
}

function encodeStorageKeyPart(value: string): string {
  return value.replaceAll(/[^a-z0-9._-]/gi, '-').toLowerCase();
}

function normalizeHashAlgorithm(value: string): HashAlgorithm {
  const normalized = value.trim().toUpperCase();
  if (normalized === HashAlgorithm.SHA1) return HashAlgorithm.SHA1;
  if (normalized === HashAlgorithm.SHA256) return HashAlgorithm.SHA256;
  if (normalized === HashAlgorithm.SHA512) return HashAlgorithm.SHA512;
  throw new BadRequestException('Unsupported version file hash algorithm');
}
