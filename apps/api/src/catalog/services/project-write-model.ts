import { ForbiddenException } from '@nestjs/common';
import { isGameVersionTag } from '@moddery/shared';
import { Loader, LinkKind, type Prisma } from '@prisma/client';

import { type UpdateProjectInput } from '../dto/update-project.input.js';

export async function replaceProjectCategories(
  tx: Prisma.TransactionClient,
  projectId: string,
  categories: readonly string[],
): Promise<void> {
  const slugs = uniqueNormalized(categories).slice(0, 12);
  await tx.projectCategory.deleteMany({ where: { projectId } });
  if (slugs.length === 0) return;

  for (const slug of slugs) {
    const category = await tx.category.upsert({
      create: {
        name: titleize(slug),
        slug,
      },
      update: {},
      where: { slug },
    });

    await tx.projectCategory.create({
      data: {
        categoryId: category.id,
        projectId,
      },
    });
  }
}

export async function replaceProjectGameVersions(
  tx: Prisma.TransactionClient,
  projectId: string,
  versions: readonly string[],
): Promise<void> {
  const normalized = uniqueNormalized(versions)
    .filter(isGameVersionTag)
    .slice(0, 12);
  await tx.projectGameVersion.deleteMany({ where: { projectId } });
  if (normalized.length === 0) return;

  for (const version of normalized) {
    const gameVersion = await tx.gameVersion.upsert({
      create: { version },
      update: {},
      where: { version },
    });

    await tx.projectGameVersion.create({
      data: {
        gameVersionId: gameVersion.id,
        projectId,
      },
    });
  }
}

export async function replaceProjectLoaders(
  tx: Prisma.TransactionClient,
  projectId: string,
  loaders: readonly string[],
): Promise<void> {
  const normalized = uniqueNormalized(loaders)
    .map(loaderToEnum)
    .filter((loader) => loader !== null)
    .slice(0, 8);
  await tx.projectLoader.deleteMany({ where: { projectId } });

  for (const loader of normalized) {
    await tx.projectLoader.create({
      data: {
        loader,
        projectId,
      },
    });
  }
}

export async function replaceProjectLinks(
  tx: Prisma.TransactionClient,
  projectId: string,
  links: readonly NonNullable<UpdateProjectInput['links']>[number][],
): Promise<void> {
  const normalized = links
    .map((link) => ({
      kind: linkKind(link.kind),
      label: nullableTrim(link.label),
      url: requiredText(link.url),
    }))
    .slice(0, 16);

  await tx.projectLink.deleteMany({ where: { projectId } });

  for (const link of normalized) {
    await tx.projectLink.create({
      data: {
        ...link,
        projectId,
      },
    });
  }
}

export async function updatedLicenseId(
  tx: Prisma.TransactionClient,
  input: UpdateProjectInput,
): Promise<string | undefined> {
  if (input.licenseKey === undefined) {
    return undefined;
  }

  const key = requiredText(input.licenseKey).toLowerCase();
  const name = nullableTrim(input.licenseName) ?? key;
  const url = optionalUrl(input.licenseUrl);
  const license = await tx.license.upsert({
    create: { key, name, url },
    update: { name, url },
    where: { key },
  });

  return license.id;
}

export function projectUpdateData(
  input: UpdateProjectInput,
  licenseId: string | undefined,
): Prisma.ProjectUpdateInput {
  return {
    ...(input.color === undefined ? {} : { color: nullableTrim(input.color) }),
    ...(input.description === undefined
      ? {}
      : { description: input.description?.trim() ?? '' }),
    ...(input.discordUrl === undefined
      ? {}
      : { discordUrl: optionalUrl(input.discordUrl) }),
    ...(input.iconUrl === undefined
      ? {}
      : { iconUrl: optionalUrl(input.iconUrl) }),
    ...(input.issuesUrl === undefined
      ? {}
      : { issuesUrl: optionalUrl(input.issuesUrl) }),
    ...(licenseId === undefined
      ? {}
      : { license: { connect: { id: licenseId } } }),
    ...(input.sourceUrl === undefined
      ? {}
      : { sourceUrl: optionalUrl(input.sourceUrl) }),
    ...(input.summary === undefined
      ? {}
      : { summary: input.summary?.trim() ?? '' }),
    ...(input.title === undefined ? {} : { title: input.title?.trim() ?? '' }),
    ...(input.wikiUrl === undefined
      ? {}
      : { wikiUrl: optionalUrl(input.wikiUrl) }),
  };
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function optionalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function requiredText(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    throw new ForbiddenException('Required project metadata is missing');
  }
  return trimmed;
}

function linkKind(value: string): LinkKind {
  const normalized = value.trim().toUpperCase();
  if (normalized in LinkKind) {
    return LinkKind[normalized as keyof typeof LinkKind];
  }

  throw new ForbiddenException('Unsupported project link kind');
}

function loaderToEnum(loader: string): Loader | null {
  if (loader === 'fabric') return Loader.FABRIC;
  if (loader === 'forge') return Loader.FORGE;
  if (loader === 'neoforge') return Loader.NEOFORGE;
  if (loader === 'quilt') return Loader.QUILT;
  return null;
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueNormalized(values: readonly string[]): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0),
    ),
  ];
}
