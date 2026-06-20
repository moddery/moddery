import {
  CollectionVisibility,
  FileKind,
  HashAlgorithm,
  LinkKind,
  Loader,
  PrismaClient,
  ProjectKind,
  ProjectStatus,
  TeamTargetKind,
  VersionChannel,
} from '@prisma/client';
import { Client } from '@opensearch-project/opensearch';
import { isProjectCategoryTag } from '@moddery/shared';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();
const searchClient = new Client({
  node: requiredEnv('OPENSEARCH_NODE'),
});

const sourceBaseUrl = requiredEnv('SEED_SOURCE_API_URL');
const limit = requiredPositiveIntegerEnv('SEED_PROJECT_LIMIT');
const versionsPerProject = requiredPositiveIntegerEnv(
  'SEED_VERSIONS_PER_PROJECT',
);
const projectsIndex = 'projects';
const seedProjectTypes = [
  'mod',
  'plugin',
  'modpack',
  'resourcepack',
  'shader',
] as const;

interface SearchResponse {
  hits: SearchHit[];
}

interface SearchHit {
  author: string;
  categories: string[];
  date_created: string;
  date_modified: string;
  description: string;
  downloads: number;
  icon_url: string | null;
  license: string;
  project_id: string;
  project_type: string;
  slug: string;
  title: string;
  versions: string[];
}

interface ProjectDetail {
  body: string;
  discord_url: string | null;
  donation_urls: SourceDonationLink[];
  gallery: ProjectDetailGalleryImage[];
  issues_url: string | null;
  license: SourceLicense;
  source_url: string | null;
  wiki_url: string | null;
}

interface SourceDonationLink {
  id: string;
  platform: string;
  url: string;
}

interface SourceLicense {
  id: string;
  name: string;
  url: string | null;
}

interface ProjectDetailGalleryImage {
  created: string;
  description: string | null;
  featured: boolean;
  ordering: number;
  raw_url: string;
  title: string | null;
  url: string;
}

interface SourceVersion {
  changelog: string | null;
  date_published: string;
  downloads: number;
  files: SourceVersionFile[];
  game_versions: string[];
  id: string;
  loaders: string[];
  name: string;
  version_number: string;
  version_type: string;
}

interface SourceVersionFile {
  filename: string;
  hashes: Partial<Record<'sha1' | 'sha256' | 'sha512', string>>;
  primary: boolean;
  size: number;
  url: string;
}

async function main(): Promise<void> {
  const projects = await fetchPopularProjects();
  const owner = await prisma.user.upsert({
    create: {
      bio: 'Local development curator for seeded catalog data.',
      displayName: 'Seed Curator',
      email: 'seed@moddery.local',
      username: 'seed',
    },
    update: {
      bio: 'Local development curator for seeded catalog data.',
      displayName: 'Seed Curator',
    },
    where: { username: 'seed' },
  });
  await upsertSeedPassword(owner.id);
  const organization = await upsertSeedOrganization(owner.id);

  for (const project of projects) {
    const kind = mapProjectKind(project.project_type);
    if (kind === null) continue;
    const detail = await fetchProjectDetail(project.project_id);

    const license = await upsertLicense(project, detail);
    const existing = await prisma.project.findUnique({
      select: { id: true },
      where: { slug: project.slug },
    });
    const saved =
      existing === null
        ? await createProject(
            project,
            detail,
            kind,
            license.id,
            owner.id,
            organization.id,
          )
        : await updateProject(
            project,
            detail,
            kind,
            license.id,
            organization.id,
          );

    await upsertCategories(saved.id, kind, project.categories);
    await upsertGameVersions(saved.id, project.versions);
    await upsertLoaders(saved.id, project.categories);
    await replaceGallery(saved.id, detail.gallery);
    await replaceProjectLinks(saved.id, detail);
    await replaceVersions(saved.id, owner.id, project.project_id);
    await replaceAnalyticsEvents(saved.id, project.downloads);
    await indexProject(saved.id, project, detail, kind);
  }

  await seedPublicCollections(owner.id);
  await seedNotifications(owner.id);

  console.log(`Seeded ${projects.length.toString()} projects`);
}

async function upsertSeedPassword(userId: string): Promise<void> {
  await prisma.passwordCredential.upsert({
    create: {
      passwordHash: await hash('password123', 12),
      userId,
    },
    update: {},
    where: { userId },
  });
}

async function upsertSeedOrganization(ownerId: string) {
  const existing = await prisma.organization.findUnique({
    select: { id: true },
    where: { slug: 'moddery-seed' },
  });

  if (existing !== null) {
    return prisma.organization.update({
      data: {
        color: '#1d9bf0',
        description: 'Local development organization for seeded catalog data.',
        name: 'Moddery Seed',
        owner: { connect: { id: ownerId } },
      },
      where: { id: existing.id },
    });
  }

  return prisma.organization.create({
    data: {
      color: '#1d9bf0',
      description: 'Local development organization for seeded catalog data.',
      name: 'Moddery Seed',
      owner: { connect: { id: ownerId } },
      slug: 'moddery-seed',
      team: {
        create: {
          members: {
            create: {
              acceptedAt: new Date(),
              isOwner: true,
              permissions: [
                'MANAGE_DETAILS',
                'MANAGE_MEMBERS',
                'MANAGE_SETTINGS',
                'VIEW_ANALYTICS',
              ],
              role: 'Owner',
              userId: ownerId,
            },
          },
          targetKind: TeamTargetKind.ORGANIZATION,
        },
      },
    },
  });
}

async function indexProject(
  projectId: string,
  project: SearchHit,
  detail: ProjectDetail,
  kind: ProjectKind,
): Promise<void> {
  await ensureProjectsIndex();

  const loaders = project.categories.flatMap((category) => {
    const loader = mapLoader(category);
    return loader === null ? [] : [loader.toLowerCase()];
  });
  const categories = project.categories.filter(isProjectCategoryTag);
  const licenseKey = normalizedLicenseKey(detail.license.id || project.license);
  const updatedAt = parseDate(project.date_modified).toISOString();

  await searchClient.index({
    body: {
      categories,
      description: detail.body,
      downloads: project.downloads,
      followers: 0,
      gameVersions: project.versions,
      iconUrl: project.icon_url,
      id: projectId,
      kind,
      licenseKey,
      loaders,
      slug: project.slug,
      summary: project.description,
      tags: [
        `kind:${kind}`,
        ...categories.map((category) => `category:${category}`),
        ...project.versions.map((version) => `game-version:${version}`),
        ...(licenseKey === null ? [] : [`license:${licenseKey}`]),
        ...loaders.map((loader) => `loader:${loader}`),
      ],
      title: project.title,
      titleSort: project.title.toLowerCase(),
      updatedAt,
    },
    id: projectId,
    index: projectsIndex,
    refresh: true,
  });
}

async function ensureProjectsIndex(): Promise<void> {
  const exists = await searchClient.indices.exists({ index: projectsIndex });

  if (exists.body) {
    await searchClient.indices.putMapping({
      body: projectIndexMapping() as never,
      index: projectsIndex,
    });
    return;
  }

  await searchClient.indices.create({
    body: {
      mappings: projectIndexMapping() as never,
    },
    index: projectsIndex,
  });
}

function projectIndexMapping() {
  return {
    properties: {
      categories: { type: 'keyword' },
      description: { type: 'text' },
      downloads: { type: 'integer' },
      followers: { type: 'integer' },
      gameVersions: { type: 'keyword' },
      iconUrl: { type: 'keyword', index: false },
      kind: { type: 'keyword' },
      licenseKey: { type: 'keyword' },
      loaders: { type: 'keyword' },
      slug: { type: 'keyword' },
      summary: { type: 'text' },
      tags: { type: 'keyword' },
      title: { type: 'text' },
      titleSort: { type: 'keyword' },
      updatedAt: { type: 'date' },
    },
  };
}

async function seedPublicCollections(ownerId: string): Promise<void> {
  await Promise.all([
    upsertPublicCollection(ownerId, {
      categorySlugs: ['optimization', 'library'],
      color: '#1d9bf0',
      description: 'Performance-focused projects and libraries worth testing.',
      name: 'Performance Picks',
      slug: 'performance-picks',
    }),
    upsertPublicCollection(ownerId, {
      categorySlugs: ['adventure', 'mobs', 'decoration'],
      color: '#30a46c',
      description: 'Projects that add places, creatures, and world detail.',
      name: 'Worldbuilding',
      slug: 'worldbuilding',
    }),
    upsertPublicCollection(ownerId, {
      categorySlugs: ['utility', 'management'],
      color: '#f76808',
      description: 'Utilities for managing play, servers, and project stacks.',
      name: 'Utility Shelf',
      slug: 'utility-shelf',
    }),
  ]);
}

async function upsertPublicCollection(
  ownerId: string,
  collection: {
    categorySlugs: string[];
    color: string;
    description: string;
    name: string;
    slug: string;
  },
): Promise<void> {
  const saved = await prisma.collection.upsert({
    create: {
      color: collection.color,
      description: collection.description,
      name: collection.name,
      ownerId,
      slug: collection.slug,
      visibility: CollectionVisibility.PUBLIC,
    },
    update: {
      color: collection.color,
      description: collection.description,
      name: collection.name,
      visibility: CollectionVisibility.PUBLIC,
    },
    where: {
      ownerId_slug: {
        ownerId,
        slug: collection.slug,
      },
    },
  });

  const projects = await prisma.project.findMany({
    orderBy: [{ downloads: 'desc' }],
    select: { id: true },
    take: 6,
    where: {
      categories: {
        some: {
          category: {
            slug: { in: collection.categorySlugs },
          },
        },
      },
      status: ProjectStatus.APPROVED,
    },
  });

  await prisma.collectionProject.deleteMany({
    where: { collectionId: saved.id },
  });

  await prisma.collectionProject.createMany({
    data: projects.map((project, index) => ({
      addedById: ownerId,
      collectionId: saved.id,
      projectId: project.id,
      sortOrder: index,
    })),
  });
}

async function seedNotifications(userId: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: {
      type: { in: ['seed.project_update', 'seed.moderation'] },
      userId,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        actionUrl: '/mods?project=iris&type=mod',
        body: 'A seeded project has fresh versions, files, and gallery data.',
        title: 'Project data refreshed',
        type: 'seed.project_update',
        userId,
      },
      {
        actionUrl: '/collections',
        body: 'Public collections were generated from the current catalog.',
        title: 'Collections are ready',
        type: 'seed.moderation',
        userId,
      },
    ],
  });
}

async function replaceAnalyticsEvents(
  projectId: string,
  downloads: number,
): Promise<void> {
  await prisma.projectViewEvent.deleteMany({ where: { projectId } });
  await prisma.downloadEvent.deleteMany({ where: { projectId } });

  const now = new Date();
  const dailyViews = Math.max(2, Math.min(32, Math.floor(downloads / 50_000)));
  const dailyDownloads = Math.max(
    1,
    Math.min(18, Math.floor(downloads / 125_000)),
  );

  await prisma.projectViewEvent.createMany({
    data: Array.from({ length: 14 }).flatMap((_, dayIndex) => {
      const createdAt = daysAgo(now, 13 - dayIndex);
      return Array.from({ length: dailyViews + (dayIndex % 5) }).map(() => ({
        countryCode: 'US',
        createdAt,
        projectId,
        referrer: 'seed',
        userAgent: 'seed-script',
      }));
    }),
  });

  await prisma.downloadEvent.createMany({
    data: Array.from({ length: 14 }).flatMap((_, dayIndex) => {
      const createdAt = daysAgo(now, 13 - dayIndex);
      return Array.from({ length: dailyDownloads + (dayIndex % 3) }).map(
        () => ({
          countryCode: 'US',
          createdAt,
          projectId,
          userAgent: 'seed-script',
        }),
      );
    }),
  });
}

async function createProject(
  project: SearchHit,
  detail: ProjectDetail,
  kind: ProjectKind,
  licenseId: string,
  ownerId: string,
  organizationId: string,
) {
  const team = await prisma.team.create({
    data: {
      members: {
        create: {
          acceptedAt: new Date(),
          isOwner: true,
          permissions: [
            'MANAGE_DETAILS',
            'MANAGE_MEMBERS',
            'MANAGE_SETTINGS',
            'MANAGE_VERSIONS',
            'VIEW_ANALYTICS',
          ],
          role: 'Owner',
          userId: ownerId,
        },
      },
      targetKind: TeamTargetKind.PROJECT,
    },
  });

  return prisma.project.create({
    data: {
      approvedAt: new Date(),
      description: detail.body,
      downloads: project.downloads,
      iconUrl: project.icon_url,
      id: project.project_id,
      kind,
      license: { connect: { id: licenseId } },
      organization: { connect: { id: organizationId } },
      publishedAt: parseDate(project.date_created),
      slug: project.slug,
      status: ProjectStatus.APPROVED,
      summary: project.description,
      team: { connect: { id: team.id } },
      title: project.title,
      updatedAt: parseDate(project.date_modified),
    },
  });
}

function updateProject(
  project: SearchHit,
  detail: ProjectDetail,
  kind: ProjectKind,
  licenseId: string,
  organizationId: string,
) {
  return prisma.project.update({
    data: {
      description: detail.body,
      downloads: project.downloads,
      iconUrl: project.icon_url,
      kind,
      license: { connect: { id: licenseId } },
      organization: { connect: { id: organizationId } },
      publishedAt: parseDate(project.date_created),
      status: ProjectStatus.APPROVED,
      summary: project.description,
      title: project.title,
      updatedAt: parseDate(project.date_modified),
    },
    where: { slug: project.slug },
  });
}

async function fetchPopularProjects(): Promise<SearchHit[]> {
  const projects = new Map<string, SearchHit>();

  for (const projectType of seedProjectTypes) {
    const params = new URLSearchParams({
      facets: JSON.stringify([[`project_type:${projectType}`]]),
      index: 'downloads',
      limit: String(limit),
    });
    const response = await fetch(
      `${sourceBaseUrl}/search?${params.toString()}`,
      {
        headers: { Accept: 'application/json' },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Seed source returned ${response.status.toString()} for ${projectType}`,
      );
    }

    const data = (await response.json()) as SearchResponse;
    for (const project of data.hits) {
      projects.set(project.project_id, {
        ...project,
        project_type: projectType,
      });
    }
  }

  return [...projects.values()];
}

async function fetchProjectDetail(projectId: string): Promise<ProjectDetail> {
  const response = await fetch(`${sourceBaseUrl}/project/${projectId}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Seed source project detail returned ${response.status.toString()} for ${projectId}`,
    );
  }

  return (await response.json()) as ProjectDetail;
}

async function fetchProjectVersions(
  projectId: string,
): Promise<SourceVersion[]> {
  const response = await fetch(
    `${sourceBaseUrl}/project/${projectId}/version`,
    {
      headers: { Accept: 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Seed source project versions returned ${response.status.toString()} for ${projectId}`,
    );
  }

  return ((await response.json()) as SourceVersion[]).slice(
    0,
    versionsPerProject,
  );
}

async function upsertLicense(project: SearchHit, detail: ProjectDetail) {
  const key = detail.license.id || project.license;

  return prisma.license.upsert({
    create: {
      key,
      name: detail.license.name || key,
      url: detail.license.url,
    },
    update: {
      name: detail.license.name || key,
      url: detail.license.url,
    },
    where: { key },
  });
}

async function replaceGallery(
  projectId: string,
  gallery: ProjectDetailGalleryImage[],
): Promise<void> {
  await prisma.projectGalleryImage.deleteMany({
    where: { projectId },
  });

  if (gallery.length === 0) return;

  await prisma.projectGalleryImage.createMany({
    data: gallery.map((image) => ({
      createdAt: parseDate(image.created),
      description: image.description,
      displayUrl: image.url,
      featured: image.featured,
      projectId,
      rawUrl: image.raw_url,
      sortOrder: image.ordering,
      title: image.title,
    })),
  });
}

async function replaceProjectLinks(
  projectId: string,
  detail: ProjectDetail,
): Promise<void> {
  await prisma.project.update({
    data: {
      discordUrl: detail.discord_url,
      issuesUrl: detail.issues_url,
      sourceUrl: detail.source_url,
      wikiUrl: detail.wiki_url,
    },
    where: { id: projectId },
  });

  await prisma.projectLink.deleteMany({
    where: { projectId },
  });

  if (detail.donation_urls.length === 0) return;

  await prisma.projectLink.createMany({
    data: detail.donation_urls.map((link) => ({
      kind: LinkKind.DONATION,
      label: link.platform || link.id,
      projectId,
      url: link.url,
    })),
  });
}

async function replaceVersions(
  projectId: string,
  authorId: string,
  sourceProjectId: string,
): Promise<void> {
  const versions = uniqueVersionsByNumber(
    await fetchProjectVersions(sourceProjectId),
  );

  await prisma.version.deleteMany({
    where: { projectId },
  });

  for (const [index, version] of versions.entries()) {
    const saved = await prisma.version.create({
      data: {
        authorId,
        changelog: version.changelog,
        channel: mapVersionChannel(version.version_type),
        downloads: version.downloads,
        featured: index === 0,
        id: version.id,
        name: version.name,
        projectId,
        publishedAt: parseDate(version.date_published),
        sortOrder: index,
        status: ProjectStatus.APPROVED,
        versionNumber: version.version_number,
      },
    });

    await upsertVersionGameVersions(saved.id, version.game_versions);
    await upsertVersionLoaders(saved.id, version.loaders);
    await createVersionFiles(saved.id, version.files);
  }
}

function uniqueVersionsByNumber(versions: SourceVersion[]): SourceVersion[] {
  const seen = new Set<string>();

  return versions.filter((version) => {
    if (seen.has(version.version_number)) return false;
    seen.add(version.version_number);
    return true;
  });
}

async function upsertCategories(
  projectId: string,
  projectKind: ProjectKind,
  categories: string[],
): Promise<void> {
  await prisma.projectCategory.deleteMany({
    where: { projectId },
  });

  for (const slug of categories.filter(isProjectCategoryTag)) {
    const category = await prisma.category.upsert({
      create: {
        name: titleize(slug),
        projectKind,
        slug,
      },
      update: {},
      where: { slug },
    });

    await prisma.projectCategory.upsert({
      create: {
        categoryId: category.id,
        projectId,
      },
      update: {},
      where: {
        projectId_categoryId: {
          categoryId: category.id,
          projectId,
        },
      },
    });
  }
}

async function upsertGameVersions(
  projectId: string,
  versions: string[],
): Promise<void> {
  await prisma.projectGameVersion.deleteMany({
    where: { projectId },
  });

  for (const version of versions) {
    const gameVersion = await prisma.gameVersion.upsert({
      create: { version },
      update: {},
      where: { version },
    });

    await prisma.projectGameVersion.upsert({
      create: {
        gameVersionId: gameVersion.id,
        projectId,
      },
      update: {},
      where: {
        projectId_gameVersionId: {
          gameVersionId: gameVersion.id,
          projectId,
        },
      },
    });
  }
}

async function upsertLoaders(
  projectId: string,
  categories: string[],
): Promise<void> {
  await prisma.projectLoader.deleteMany({
    where: { projectId },
  });

  for (const category of categories) {
    const loader = mapLoader(category);
    if (loader === null) continue;

    await prisma.projectLoader.upsert({
      create: {
        loader,
        projectId,
      },
      update: {},
      where: {
        projectId_loader: {
          loader,
          projectId,
        },
      },
    });
  }
}

async function upsertVersionGameVersions(
  versionId: string,
  versions: string[],
): Promise<void> {
  for (const version of new Set(versions)) {
    const gameVersion = await prisma.gameVersion.upsert({
      create: { version },
      update: {},
      where: { version },
    });

    await prisma.versionGameVersion.create({
      data: {
        gameVersionId: gameVersion.id,
        versionId,
      },
    });
  }
}

async function upsertVersionLoaders(
  versionId: string,
  loaders: string[],
): Promise<void> {
  for (const sourceLoader of new Set(loaders)) {
    const loader = mapLoader(sourceLoader);
    if (loader === null) continue;

    await prisma.versionLoader.create({
      data: {
        loader,
        versionId,
      },
    });
  }
}

async function createVersionFiles(
  versionId: string,
  files: SourceVersionFile[],
): Promise<void> {
  for (const file of files) {
    const saved = await prisma.versionFile.create({
      data: {
        bucket: 'external',
        fileName: file.filename,
        isPrimary: file.primary,
        key: `${versionId}/${file.filename}`,
        kind: FileKind.UNIVERSAL,
        sizeBytes: BigInt(file.size),
        url: file.url,
        versionId,
      },
    });

    await createFileHashes(saved.id, file.hashes);
  }
}

async function createFileHashes(
  fileId: string,
  hashes: SourceVersionFile['hashes'],
): Promise<void> {
  const data = Object.entries(hashes).flatMap(([algorithm, value]) => {
    const mapped = mapHashAlgorithm(algorithm);
    return mapped === null ? [] : [{ algorithm: mapped, fileId, value }];
  });

  if (data.length === 0) return;

  await prisma.fileHash.createMany({ data });
}

function mapProjectKind(kind: string): ProjectKind | null {
  if (kind === 'mod') return ProjectKind.MOD;
  if (kind === 'modpack') return ProjectKind.MODPACK;
  if (kind === 'resourcepack') return ProjectKind.RESOURCE_PACK;
  if (kind === 'shader') return ProjectKind.SHADER;
  if (kind === 'plugin') return ProjectKind.PLUGIN;
  if (kind === 'datapack') return ProjectKind.DATAPACK;
  return null;
}

function mapLoader(category: string): Loader | null {
  if (category === 'fabric') return Loader.FABRIC;
  if (category === 'forge') return Loader.FORGE;
  if (category === 'neoforge') return Loader.NEOFORGE;
  if (category === 'quilt') return Loader.QUILT;
  return null;
}

function mapVersionChannel(channel: string): VersionChannel {
  if (channel === 'alpha') return VersionChannel.ALPHA;
  if (channel === 'beta') return VersionChannel.BETA;
  return VersionChannel.RELEASE;
}

function mapHashAlgorithm(algorithm: string): HashAlgorithm | null {
  if (algorithm === 'sha1') return HashAlgorithm.SHA1;
  if (algorithm === 'sha256') return HashAlgorithm.SHA256;
  if (algorithm === 'sha512') return HashAlgorithm.SHA512;
  return null;
}

function normalizedLicenseKey(licenseKey: string): string | null {
  const normalized = licenseKey.trim().toLowerCase();
  return normalized === '' || normalized === 'unknown' ? null : normalized;
}

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date from seed source: ${value}`);
  }

  return date;
}

function daysAgo(from: Date, days: number): Date {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function requiredPositiveIntegerEnv(name: string): number {
  const rawValue = requiredEnv(name);
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

void main().finally(async () => {
  await prisma.$disconnect();
});
