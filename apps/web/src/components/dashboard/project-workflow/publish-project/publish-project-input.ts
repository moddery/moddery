import { type CreateProjectInput } from '../../../../lib/dashboard.ts';

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

function normalizeProjectSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
