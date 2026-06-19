import {
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
} from '../../../lib/dashboard.ts';

export function normalizeCreateOrganizationInput(
  input: CreateOrganizationInput,
): CreateOrganizationInput {
  return {
    ...input,
    color: nullableTrim(input.color),
    description: nullableTrim(input.description),
    iconUrl: nullableTrim(input.iconUrl),
    name: input.name.trim(),
    slug: normalizeOrganizationSlug(input.slug),
  };
}

export function normalizeUpdateOrganizationInput(
  input: UpdateOrganizationInput,
): UpdateOrganizationInput {
  return {
    ...input,
    color: nullableTrim(input.color),
    description: nullableTrim(input.description),
    iconUrl: nullableTrim(input.iconUrl),
    name: input.name.trim(),
    organizationId: input.organizationId.trim(),
    slug: normalizeOrganizationSlug(input.slug),
  };
}

export function assertOrganizationInput(
  input: Pick<CreateOrganizationInput, 'name' | 'slug'>,
): void {
  if (input.name.trim().length === 0) {
    throw new Error('Organization name is required');
  }

  if (normalizeOrganizationSlug(input.slug).length < 3) {
    throw new Error('Organization slug must be at least 3 characters');
  }
}

export function assertUpdateOrganizationInput(
  input: UpdateOrganizationInput,
): void {
  if (input.organizationId.trim().length === 0) {
    throw new Error('Choose an organization before saving');
  }

  assertOrganizationInput(input);
}

export function normalizeOrganizationSlug(value: string): string {
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
