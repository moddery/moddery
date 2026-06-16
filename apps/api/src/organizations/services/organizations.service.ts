import { Injectable } from '@nestjs/common';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';

interface OrganizationProjectRow {
  categories: { category: { slug: string } }[];
  description: string;
  downloads: number;
  followers: number;
  gallery: {
    createdAt: Date;
    description: string | null;
    displayUrl: string;
    featured: boolean;
    rawUrl: string;
    sortOrder: number;
    title: string | null;
  }[];
  gameVersions: { gameVersion: { version: string } }[];
  iconUrl: string | null;
  id: string;
  kind: ProjectKind;
  license: { key: string; name: string; url: string | null } | null;
  links: { kind: string; label: string | null; url: string }[];
  loaders: { loader: string }[];
  slug: string;
  status: ProjectStatus;
  summary: string;
  title: string;
  updatedAt: Date;
}

interface OrganizationRow {
  _count: {
    projects: number;
  };
  color: string | null;
  createdAt: Date;
  description: string | null;
  iconUrl: string | null;
  id: string;
  name: string;
  owner: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
  projects: OrganizationProjectRow[];
  slug: string;
  team: {
    _count: {
      members: number;
    };
  };
  updatedAt: Date;
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicOrganizations() {
    const organizations = await this.prisma.organization.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      select: organizationSelect(4),
      where: {
        projects: {
          some: { status: 'APPROVED' },
        },
      },
    });

    return organizations.map(organizationRowToContract);
  }

  async findBySlug(slug: string) {
    const organization = await this.prisma.organization.findFirst({
      select: organizationSelect(12),
      where: { slug: { equals: slug, mode: 'insensitive' } },
    });

    return organization === null
      ? null
      : organizationRowToContract(organization);
  }
}

function organizationSelect(projectTake: number) {
  return {
    _count: {
      select: {
        projects: { where: { status: 'APPROVED' as const } },
      },
    },
    color: true,
    createdAt: true,
    description: true,
    iconUrl: true,
    id: true,
    name: true,
    owner: {
      select: {
        avatarUrl: true,
        displayName: true,
        id: true,
        username: true,
      },
    },
    projects: {
      orderBy: [{ updatedAt: 'desc' as const }],
      select: projectSelect(),
      take: projectTake,
      where: { status: 'APPROVED' as const },
    },
    slug: true,
    team: {
      select: {
        _count: {
          select: {
            members: { where: { acceptedAt: { not: null } } },
          },
        },
      },
    },
    updatedAt: true,
  };
}

function projectSelect() {
  return {
    categories: {
      select: {
        category: {
          select: { slug: true },
        },
      },
    },
    description: true,
    downloads: true,
    followers: true,
    gallery: {
      orderBy: { sortOrder: 'asc' as const },
      select: {
        createdAt: true,
        description: true,
        displayUrl: true,
        featured: true,
        rawUrl: true,
        sortOrder: true,
        title: true,
      },
    },
    gameVersions: {
      select: {
        gameVersion: {
          select: { version: true },
        },
      },
    },
    iconUrl: true,
    id: true,
    kind: true,
    license: {
      select: {
        key: true,
        name: true,
        url: true,
      },
    },
    links: {
      select: {
        kind: true,
        label: true,
        url: true,
      },
    },
    loaders: {
      select: { loader: true },
    },
    slug: true,
    status: true,
    summary: true,
    title: true,
    updatedAt: true,
  };
}

function organizationRowToContract(organization: OrganizationRow) {
  return {
    color: organization.color,
    createdAt: organization.createdAt,
    description: organization.description,
    iconUrl: organization.iconUrl,
    id: organization.id,
    memberCount: organization.team._count.members,
    name: organization.name,
    owner: organization.owner,
    projectCount: organization._count.projects,
    projects: organization.projects.map(projectRowToContract),
    slug: organization.slug,
    updatedAt: organization.updatedAt,
  };
}

function projectRowToContract(project: OrganizationProjectRow) {
  return {
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
    downloads: project.downloads,
    followers: project.followers,
    gallery: project.gallery.map((image) => ({
      ...image,
      createdAt: image.createdAt,
    })),
    gameVersions: project.gameVersions.map(
      ({ gameVersion }) => gameVersion.version,
    ),
    iconUrl: project.iconUrl,
    id: project.id,
    kind: project.kind,
    license: {
      id: project.license?.key ?? 'unknown',
      name: project.license?.name ?? 'Unknown',
      url: project.license?.url ?? null,
    },
    links: project.links,
    loaders: project.loaders.map(({ loader }) => loader),
    slug: project.slug,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt,
  };
}
