import { type CreateVersionInput } from '../../../../lib/dashboard.ts';

export function assertCreateVersionInput(input: CreateVersionInput): void {
  const file = input.files[0];

  if (input.projectSlug.trim().length === 0) {
    throw new Error('Choose a project before publishing a version');
  }

  if (input.name.trim().length === 0) {
    throw new Error('Version name is required');
  }

  if (input.versionNumber.trim().length === 0) {
    throw new Error('Version number is required');
  }

  if (file === undefined) {
    throw new Error('Version file metadata is required');
  }

  if (file.fileName.trim().length === 0) {
    throw new Error('Version file name is required');
  }

  if (file.url.trim().length === 0) {
    throw new Error('Version file URL is required');
  }

  if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes <= 0) {
    throw new Error('Version file size must be a positive integer');
  }
}
