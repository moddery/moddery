import {
  Loader,
  PrismaClient,
  ProjectKind,
  ProjectStatus,
  TeamTargetKind,
} from '@prisma/client';
import { Client } from '@opensearch-project/opensearch';
import { isProjectCategoryTag } from '@moddery/shared';

const prisma = new PrismaClient();
const searchClient = new Client({
  node: process.env.OPENSEARCH_NODE ?? 'http://localhost:9200',
});

const sourceBaseUrl =
  process.env.SEED_SOURCE_API_URL ?? 'https://api.modrinth.com/v2';
const limit = Number(process.env.SEED_PROJECT_LIMIT ?? '20');
const projectsIndex = 'projects';

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
  gallery: ProjectDetailGalleryImage[];
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

async function main(): Promise<void> {
  const projects = await fetchPopularProjects();
  const owner = await prisma.user.upsert({
    create: {
      email: 'seed@moddery.local',
      username: 'seed',
    },
    update: {},
    where: { username: 'seed' },
  });

  for (const project of projects) {
    const kind = mapProjectKind(project.project_type);
    if (kind === null) continue;
    const detail = await fetchProjectDetail(project.project_id);

    const license = await prisma.license.upsert({
      create: {
        key: project.license,
        name: project.license,
      },
      update: {},
      where: { key: project.license },
    });
    const existing = await prisma.project.findUnique({
      select: { id: true },
      where: { slug: project.slug },
    });
    const saved =
      existing === null
        ? await createProject(project, detail, kind, license.id, owner.id)
        : await updateProject(project, detail, kind, license.id);

    await upsertCategories(saved.id, kind, project.categories);
    await upsertGameVersions(saved.id, project.versions);
    await upsertLoaders(saved.id, project.categories);
    await replaceGallery(saved.id, detail.gallery);
    await indexProject(saved.id, project, detail, kind);
  }

  console.log(`Seeded ${projects.length.toString()} projects`);
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
      loaders,
      slug: project.slug,
      summary: project.description,
      tags: [
        `kind:${kind}`,
        ...categories.map((category) => `category:${category}`),
        ...project.versions.map((version) => `game-version:${version}`),
        ...loaders.map((loader) => `loader:${loader}`),
      ],
      title: project.title,
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
      loaders: { type: 'keyword' },
      slug: { type: 'keyword' },
      summary: { type: 'text' },
      tags: { type: 'keyword' },
      title: { type: 'text' },
      updatedAt: { type: 'date' },
    },
  };
}

async function createProject(
  project: SearchHit,
  detail: ProjectDetail,
  kind: ProjectKind,
  licenseId: string,
  ownerId: string,
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
      licenseId,
      publishedAt: parseDate(project.date_created),
      slug: project.slug,
      status: ProjectStatus.APPROVED,
      summary: project.description,
      teamId: team.id,
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
) {
  return prisma.project.update({
    data: {
      description: detail.body,
      downloads: project.downloads,
      iconUrl: project.icon_url,
      kind,
      licenseId,
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
  const params = new URLSearchParams({
    facets: JSON.stringify([['project_type:mod']]),
    index: 'downloads',
    limit: String(limit),
  });
  const response = await fetch(`${sourceBaseUrl}/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Seed source returned ${response.status.toString()}`);
  }

  const data = (await response.json()) as SearchResponse;
  return data.hits;
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

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date from seed source: ${value}`);
  }

  return date;
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

void main().finally(async () => {
  await prisma.$disconnect();
});
