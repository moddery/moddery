import { Injectable, NotFoundException } from '@nestjs/common';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddProjectToOrganizationInput } from '../dto/add-project-to-organization.input.js';
import { type CreateOrganizationInput } from '../dto/create-organization.input.js';
import { type RemoveProjectFromOrganizationInput } from '../dto/remove-project-from-organization.input.js';
import { type UpdateOrganizationInput } from '../dto/update-organization.input.js';

interface OrganizationProjectRow {
  categories: { category: { slug: string } }[];
  description: string;
  discordUrl: string | null;
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
  issuesUrl: string | null;
  kind: ProjectKind;
  license: { key: string; name: string; url: string | null } | null;
  links: { kind: string; label: string | null; url: string }[];
  loaders: { loader: string }[];
  slug: string;
  sourceUrl: string | null;
  status: ProjectStatus;
  summary: string;
  title: string;
  updatedAt: Date;
  wikiUrl: string | null;
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

  async addProjectToOrganization(
    input: AddProjectToOrganizationInput,
    userId: string,
  ) {
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        id: input.organizationId,
        ownerId: userId,
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: {
        slug: input.projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              userId,
            },
          },
        },
      },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.update({
      data: { organizationId: organization.id },
      where: { id: project.id },
    });

    return this.findViewerOrganization(organization.id, userId);
  }

  async createOrganization(input: CreateOrganizationInput, ownerId: string) {
    const color = input.color?.trim() ?? '';
    const description = input.description?.trim() ?? '';

    const organization = await this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: { targetKind: 'ORGANIZATION' },
        select: { id: true },
      });

      await tx.teamMember.create({
        data: {
          acceptedAt: new Date(),
          isOwner: true,
          permissions: [
            'MANAGE_DETAILS',
            'MANAGE_MEMBERS',
            'MANAGE_SETTINGS',
            'VIEW_ANALYTICS',
          ],
          role: 'Owner',
          teamId: team.id,
          userId: ownerId,
        },
      });

      return tx.organization.create({
        data: {
          color: color.length === 0 ? null : color,
          description: description.length === 0 ? null : description,
          name: input.name.trim(),
          ownerId,
          slug: input.slug.trim(),
          teamId: team.id,
        },
        select: organizationSelect(8, { includeDraftProjects: true }),
      });
    });

    return organizationRowToContract(organization);
  }

  async findPublicOrganizations() {
    const organizations = await this.prisma.organization.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      select: organizationSelect(4, { includeDraftProjects: false }),
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
      select: organizationSelect(12, { includeDraftProjects: false }),
      where: { slug: { equals: slug, mode: 'insensitive' } },
    });

    return organization === null
      ? null
      : organizationRowToContract(organization);
  }

  async findViewerOrganizations(ownerId: string) {
    const organizations = await this.prisma.organization.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      select: organizationSelect(8, { includeDraftProjects: true }),
      where: { ownerId },
    });

    return organizations.map(organizationRowToContract);
  }

  async removeProjectFromOrganization(
    input: RemoveProjectFromOrganizationInput,
    ownerId: string,
  ) {
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        id: input.organizationId,
        ownerId,
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: {
        organizationId: organization.id,
        slug: input.projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              userId: ownerId,
            },
          },
        },
      },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.update({
      data: { organizationId: null },
      where: { id: project.id },
    });

    return this.findViewerOrganization(organization.id, ownerId);
  }

  async updateOrganization(input: UpdateOrganizationInput, ownerId: string) {
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        id: input.organizationId,
        ownerId,
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    await this.prisma.organization.update({
      data: {
        color:
          input.color === undefined ? undefined : nullableTrim(input.color),
        description:
          input.description === undefined
            ? undefined
            : nullableTrim(input.description),
        name: input.name == null ? undefined : input.name.trim(),
        slug: input.slug == null ? undefined : input.slug.trim(),
      },
      where: { id: organization.id },
    });

    return this.findViewerOrganization(organization.id, ownerId);
  }

  private async findViewerOrganization(
    organizationId: string,
    ownerId: string,
  ) {
    const organization = await this.prisma.organization.findFirst({
      select: organizationSelect(8, { includeDraftProjects: true }),
      where: {
        id: organizationId,
        ownerId,
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    return organizationRowToContract(organization);
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

function organizationSelect(
  projectTake: number,
  { includeDraftProjects }: { includeDraftProjects: boolean },
) {
  const projectVisibilityFilter = includeDraftProjects
    ? undefined
    : { status: 'APPROVED' as const };

  return {
    _count: {
      select: {
        projects: projectVisibilityFilter
          ? { where: projectVisibilityFilter }
          : true,
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
      where: projectVisibilityFilter,
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
    discordUrl: true,
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
    issuesUrl: true,
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
    sourceUrl: true,
    status: true,
    summary: true,
    title: true,
    updatedAt: true,
    wikiUrl: true,
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
    discordUrl: project.discordUrl,
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
    issuesUrl: project.issuesUrl,
    kind: project.kind,
    license: {
      id: project.license?.key ?? 'unknown',
      name: project.license?.name ?? 'Unknown',
      url: project.license?.url ?? null,
    },
    links: project.links,
    loaders: project.loaders.map(({ loader }) => loader),
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt,
    wikiUrl: project.wikiUrl,
  };
}
