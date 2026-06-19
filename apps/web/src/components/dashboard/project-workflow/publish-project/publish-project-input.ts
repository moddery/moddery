import { type CreateProjectInput } from '../../../../lib/dashboard.ts';

export function normalizeCreateProjectInput(
  input: CreateProjectInput,
): CreateProjectInput {
  return {
    ...input,
    categories: normalizeStringList(input.categories),
    color: nullableTrim(input.color),
    description: input.description.trim(),
    gameVersions: normalizeStringList(input.gameVersions),
    iconUrl: nullableTrim(input.iconUrl),
    loaders: normalizeStringList(input.loaders),
    slug: normalizeProjectSlug(input.slug),
    summary: input.summary.trim(),
    title: input.title.trim(),
  };
}

export function assertCreateProjectInput(input: CreateProjectInput): void {
  const slug = normalizeProjectSlug(input.slug);

  if (slug.length < 3) {
    throw new Error('Project slug must be at least 3 characters');
  }

  if (input.title.trim().length === 0) {
    throw new Error('Project title is required');
  }

  if (input.summary.trim().length === 0) {
    throw new Error('Project summary is required');
  }

  if (input.description.trim().length === 0) {
    throw new Error('Project description is required');
  }
}

export function normalizeProjectSlug(value: string): string {
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

function normalizeStringList(values: readonly string[] | undefined): string[] {
  return [
    ...new Set(
      (values ?? [])
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0),
    ),
  ];
}
