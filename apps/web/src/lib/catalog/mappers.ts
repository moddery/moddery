import { type ProjectKind } from '@moddery/shared';

import { type Mod, type ProjectType } from '../../types.js';
import { projectTypeFromKind } from '../projectTypes.js';
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
  return {
    author: 'Moddery',
    categories: project.categories,
    client: 'optional',
    color: '#1d9bf0',
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: normalizeLoaders(project.loaders),
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
    additional_categories: [],
    author: mod.author,
    body: project.body,
    categories: mod.categories,
    color: 0x1d9bf0,
    description: project.summary,
    discord_url: discordUrl,
    donation_urls: project.links
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
      raw_url: image.rawUrl,
      title: image.title,
      url: image.displayUrl,
    })),
    game_versions: mod.gameVersions,
    icon_url: mod.icon,
    id: project.id,
    issues_url: issuesUrl,
    license: project.license,
    loaders: mod.loaders,
    project_type: mod.projectType ?? 'mod',
    published: project.updatedAt,
    slug: project.slug,
    source_url: sourceUrl,
    title: project.title,
    updated: project.updatedAt,
    wiki_url: wikiUrl,
  };
}

export function versionFromSummary(version: VersionSummary): ProjectVersion {
  return {
    changelog: version.changelog,
    date_published: version.datePublished ?? new Date().toISOString(),
    dependencies: version.dependencies,
    downloads: version.downloads,
    files: version.files.map((file) => ({
      filename: file.fileName,
      hashes: file.hashes,
      id: file.id,
      primary: file.primary,
      scans: file.scans,
      size: Number(file.sizeBytes),
      url: file.url,
    })),
    game_versions: version.gameVersions,
    id: version.id,
    loaders: normalizeLoaders(version.loaders),
    name: version.name,
    version_number: version.versionNumber,
    version_type:
      version.channel.toLowerCase() as ProjectVersion['version_type'],
  };
}

export function memberFromSummary(member: ProjectMemberSummary): ProjectMember {
  return {
    accepted: member.accepted,
    owner: member.owner,
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

export function sortByName(projects: Mod[]): Mod[] {
  return [...projects].sort((a, b) => a.title.localeCompare(b.title));
}

function projectLinkUrl(
  links: ProjectSummary['links'],
  kind: string,
): string | null {
  return links.find((link) => link.kind === kind)?.url ?? null;
}

function projectKindFromType(projectType: ProjectType): ProjectKind {
  switch (projectType) {
    case 'datapack':
      return 'DATAPACK';
    case 'modpack':
      return 'MODPACK';
    case 'plugin':
      return 'PLUGIN';
    case 'resourcepack':
      return 'RESOURCE_PACK';
    case 'shader':
      return 'SHADER';
    case 'mod':
      return 'MOD';
  }
}

function normalizeLoaders(loaders: string[]): string[] {
  return loaders.map((loader) => loader.toLowerCase());
}
