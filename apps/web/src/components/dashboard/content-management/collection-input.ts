import {
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from '../../../lib/dashboard.ts';

export function normalizeCreateCollectionInput(
  input: CreateCollectionInput,
): CreateCollectionInput {
  return {
    ...input,
    color: nullableTrim(input.color),
    description: nullableTrim(input.description),
    iconUrl: nullableTrim(input.iconUrl),
    name: input.name.trim(),
    slug: normalizeCollectionSlug(input.slug),
  };
}

export function normalizeUpdateCollectionInput(
  input: UpdateCollectionInput,
): UpdateCollectionInput {
  return {
    ...input,
    collectionId: input.collectionId.trim(),
    color: nullableTrim(input.color),
    description: nullableTrim(input.description),
    iconUrl: nullableTrim(input.iconUrl),
    name: input.name.trim(),
    slug: normalizeCollectionSlug(input.slug),
  };
}

export function assertCollectionInput(
  input: Pick<CreateCollectionInput, 'name' | 'slug'>,
): void {
  if (input.name.trim().length === 0) {
    throw new Error('Collection name is required');
  }

  if (normalizeCollectionSlug(input.slug).length < 3) {
    throw new Error('Collection slug must be at least 3 characters');
  }
}

export function assertUpdateCollectionInput(
  input: UpdateCollectionInput,
): void {
  if (input.collectionId.trim().length === 0) {
    throw new Error('Choose a collection before saving');
  }

  assertCollectionInput(input);
}

export function normalizeCollectionSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
