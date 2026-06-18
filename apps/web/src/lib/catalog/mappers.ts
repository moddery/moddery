import { type Mod, type ProjectType } from '../../types.js';
import { projectKindFromType, projectTypeFromKind } from '../projectTypes.js';
import {
  type ProjectDetails,
  type ProjectMember,
  type ProjectMemberSummary,
  type ProjectSummary,
  type ProjectVersion,
  type PublicCollection,
  type PublicCollectionSummary,
  type VersionSummary,
} from './types.js';

export function projectFromSummary(project: ProjectSummary): Mod {
  const organizationName = project.organization?.name.trim() ?? '';
  const ownerName =
    project.owner?.displayName ?? project.owner?.username ?? 'Unknown user';

  return {
    author: organizationName || ownerName,
    authorUsername: project.owner?.username ?? null,
    categories: project.categories,
    client: 'optional',
    color: project.color,
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: normalizeLoaders(project.loaders),
    organization: project.organization ?? null,
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}

export function collectionFromSummary(
  collection: PublicCollectionSummary,
): PublicCollection {
  return {
    ...collection,
    items: collection.items.map((item) => ({
      ...item,
      project: projectFromSummary(item.project),
    })),
    projects: collection.projects.map(projectFromSummary),
  };
}

export function projectDetailsFromSummary(
  project: ProjectSummary,
): ProjectDetails {
  const mod = projectFromSummary(project);
  const sourceUrl =
    project.sourceUrl ?? projectLinkUrl(project.links, 'SOURCE');
  const issuesUrl =
    project.issuesUrl ?? projectLinkUrl(project.links, 'ISSUES');
  const wikiUrl = project.wikiUrl ?? projectLinkUrl(project.links, 'WIKI');
  const discordUrl =
    project.discordUrl ?? projectLinkUrl(project.links, 'DISCORD');

  return {
    additionalCategories: [],
    author: mod.author,
    authorUsername: mod.authorUsername,
    body: project.body,
    categories: mod.categories,
    color: colorNumberFromHex(project.color),
    description: project.summary,
    discordUrl,
    donationUrls: project.links
      .filter((link) => link.kind === 'DONATION')
      .map((link) => ({
        id: link.label ?? link.url,
        platform: link.label ?? 'Donation',
        url: link.url,
      })),
    downloads: project.downloads,
    followers: project.followers,
    gallery: project.gallery.map((image) => ({
      created: image.createdAt,
      description: image.description,
      featured: image.featured,
      ordering: image.sortOrder,
      rawUrl: image.rawUrl,
      title: image.title,
      url: image.displayUrl,
    })),
    gameVersions: mod.gameVersions,
    iconUrl: mod.icon,
    id: project.id,
    issuesUrl,
    license: project.license,
    loaders: mod.loaders,
    organization: mod.organization ?? null,
    projectType: mod.projectType ?? 'mod',
    published: project.publishedAt ?? project.updatedAt,
    slug: project.slug,
    sourceUrl,
    title: project.title,
    updated: project.updatedAt,
    wikiUrl,
  };
}

export function versionFromSummary(version: VersionSummary): ProjectVersion {
  return {
    author:
      version.author === null
        ? null
        : {
            avatar_url: version.author.avatarUrl,
            display_name: version.author.displayName,
            id: version.author.id,
            username: version.author.username,
          },
    changelog: version.changelog,
    created_at: version.createdAt,
    date_published: version.datePublished ?? new Date().toISOString(),
    dependencies: version.dependencies,
    downloads: version.downloads,
    featured: version.featured,
    files: version.files.map((file) => ({
      filename: file.fileName,
      hashes: file.hashes,
      id: file.id,
      kind: file.kind,
      primary: file.primary,
      scans: file.scans,
      size: Number(file.sizeBytes),
      url: file.url,
    })),
    game_versions: version.gameVersions,
    id: version.id,
    loaders: normalizeLoaders(version.loaders),
    name: version.name,
    requested_status: version.requestedStatus,
    sort_order: version.sortOrder,
    status: version.status,
    updated_at: version.updatedAt,
    version_number: version.versionNumber,
    version_type:
      version.channel.toLowerCase() as ProjectVersion['version_type'],
  };
}

export function memberFromSummary(member: ProjectMemberSummary): ProjectMember {
  return {
    accepted: member.accepted,
    owner: member.owner,
    permissions: member.permissions,
    role: member.role,
    sortOrder: member.sortOrder,
    user: {
      avatar_url: member.user.avatarUrl,
      display_name: member.user.displayName,
      id: member.user.id,
      username: member.user.username,
    },
  };
}

export function projectSearchTags({
  categories,
  loaders,
  projectType,
  versions,
}: {
  categories: string[];
  loaders: string[];
  projectType: ProjectType;
  versions: string[];
}): string[] {
  return [
    `kind:${projectKindFromType(projectType)}`,
    ...categories.map((category) => `category:${category}`),
    ...loaders.map((loader) => `loader:${loader}`),
    ...versions.map((version) => `game-version:${version}`),
  ];
}

function projectLinkUrl(
  links: ProjectSummary['links'],
  kind: string,
): string | null {
  return links.find((link) => link.kind === kind)?.url ?? null;
}

function normalizeLoaders(loaders: string[]): string[] {
  return loaders.map((loader) => loader.toLowerCase());
}

function colorNumberFromHex(color: string | null): number | null {
  if (color === null) return null;

  const normalized = color.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;

  return Number.parseInt(normalized, 16);
}
