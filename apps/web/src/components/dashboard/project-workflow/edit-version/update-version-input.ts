import { type UpdateVersionInput } from '../../../../lib/dashboard.ts';

export function normalizeUpdateVersionInput(
  input: UpdateVersionInput,
): UpdateVersionInput {
  return {
    ...input,
    changelog: nullableText(input.changelog),
    name: input.name.trim(),
    versionNumber: input.versionNumber.trim(),
  };
}

export function assertUpdateVersionInput(input: UpdateVersionInput): void {
  if (input.versionId.trim().length === 0) {
    throw new Error('Choose a version before saving changes');
  }

  if (input.name.trim().length === 0) {
    throw new Error('Version name is required');
  }

  if (input.versionNumber.trim().length === 0) {
    throw new Error('Version number is required');
  }
}

function nullableText(value: string | null): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
