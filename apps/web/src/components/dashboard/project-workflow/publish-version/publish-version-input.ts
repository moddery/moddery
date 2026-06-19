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

  const primaryFiles = input.files.filter((file) => file.primary);
  if (primaryFiles.length === 0) {
    throw new Error('A primary version file is required');
  }

  if (primaryFiles.length > 1) {
    throw new Error('Only one primary version file is allowed');
  }

  const fileNames = new Set<string>();
  for (const file of input.files) {
    const fileName = file.fileName.trim();
    if (fileName.length === 0) {
      throw new Error('Version file name is required');
    }

    if (fileNames.has(fileName)) {
      throw new Error('Version file names must be unique');
    }
    fileNames.add(fileName);

    if (file.url.trim().length === 0) {
      throw new Error('Version file URL is required');
    }

    if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes <= 0) {
      throw new Error('Version file size must be a positive integer');
    }

    if (file.hashes.length > MAX_FILE_HASHES) {
      throw new Error('A version file can include at most 8 hashes');
    }

    const hashAlgorithms = new Set<string>();
    for (const hash of file.hashes) {
      const algorithm = hash.algorithm.trim().toUpperCase();
      if (hashAlgorithms.has(algorithm)) {
        throw new Error('Version file hash algorithms must be unique');
      }
      hashAlgorithms.add(algorithm);

      if (hash.value.trim().length === 0) {
        throw new Error('Version file hash value is required');
      }
    }
  }
}
