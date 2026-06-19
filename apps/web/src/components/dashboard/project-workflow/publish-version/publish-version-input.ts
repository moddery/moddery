import { type CreateVersionInput } from '../../../../lib/dashboard.ts';

const MAX_VERSION_FILES = 8;
const MAX_FILE_HASHES = 8;

export function assertCreateVersionInput(input: CreateVersionInput): void {
  if (input.projectSlug.trim().length === 0) {
    throw new Error('Choose a project before publishing a version');
  }

  if (input.name.trim().length === 0) {
    throw new Error('Version name is required');
  }

  if (input.versionNumber.trim().length === 0) {
    throw new Error('Version number is required');
  }

  if (input.files.length === 0) {
    throw new Error('Version file metadata is required');
  }

  if (input.files.length > MAX_VERSION_FILES) {
    throw new Error('A version can include at most 8 files');
  }

  if (!input.files.some((file) => file.primary)) {
    throw new Error('A primary version file is required');
  }

  for (const file of input.files) {
    if (file.fileName.trim().length === 0) {
      throw new Error('Version file name is required');
    }

    if (file.url.trim().length === 0) {
      throw new Error('Version file URL is required');
    }

    if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes <= 0) {
      throw new Error('Version file size must be a positive integer');
    }

    if (file.hashes.length > MAX_FILE_HASHES) {
      throw new Error('A version file can include at most 8 hashes');
    }
  }
}
