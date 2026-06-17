import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';
import { TeamPermission } from '@prisma/client';

import { NotificationsService } from '../../notifications/services/notifications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddOrganizationTeamMemberInput } from '../dto/add-organization-team-member.input.js';
import { type AddProjectToOrganizationInput } from '../dto/add-project-to-organization.input.js';
import { type CreateOrganizationInput } from '../dto/create-organization.input.js';
import { type RemoveOrganizationTeamMemberInput } from '../dto/remove-organization-team-member.input.js';
import { type RemoveProjectFromOrganizationInput } from '../dto/remove-project-from-organization.input.js';
import { type UpdateOrganizationInput } from '../dto/update-organization.input.js';

interface OrganizationProjectRow {
  approvedAt: Date | null;
  archivedAt: Date | null;
  color: string | null;
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
  publishedAt: Date | null;
  queuedAt: Date | null;
  requestedStatus: ProjectStatus | null;
  team: {
    members: {
      user: {
        avatarUrl: string | null;
        displayName: string | null;
        id: string;
        username: string;
      };
    }[];
  };
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
    members: {
      isOwner: boolean;
      permissions: string[];
      role: string;
      sortOrder: number;
      user: {
        avatarUrl: string | null;
        displayName: string | null;
        id: string;
        username: string;
      };
    }[];
  };
  updatedAt: Date;
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

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
    const iconUrl = input.iconUrl?.trim() ?? '';

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
          iconUrl: iconUrl.length === 0 ? null : iconUrl,
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

  async addOrganizationTeamMember(
    input: AddOrganizationTeamMemberInput,
    userId: string,
  ) {
    const organization = await this.findOrganizationForMemberManagement(
      input.organizationId,
      userId,
    );
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: input.username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.teamMember.upsert({
      create: {
        acceptedAt: null,
        permissions: organizationMemberPermissions(input.permissions),
        role: input.role.trim() || 'Member',
        teamId: organization.teamId,
        userId: user.id,
      },
      update: {
        permissions: organizationMemberPermissions(input.permissions),
        role: input.role.trim() || 'Member',
      },
      where: {
        teamId_userId: {
          teamId: organization.teamId,
          userId: user.id,
        },
      },
    });

    await this.sendTeamInviteNotification({
      organizationName: organization.name,
      userId: user.id,
    });

    return this.findViewerOrganization(organization.id, userId);
  }

  private async sendTeamInviteNotification(input: {
    organizationName: string;
    userId: string;
  }) {
    await this.notificationsService?.sendUserNotification({
      actionUrl: `/dashboard`,
      body: `You were invited to collaborate with ${input.organizationName}.`,
      title: `Team invitation for ${input.organizationName}`,
      type: 'team',
      userId: input.userId,
    });
  }

  async findPublicOrganizations({
    search,
  }: {
    search?: string | null;
  } = {}) {
    const organizations = await this.prisma.organization.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      select: organizationSelect(4, { includeDraftProjects: false }),
      where: publicOrganizationWhere(search),
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

  async removeOrganizationTeamMember(
    input: RemoveOrganizationTeamMemberInput,
    userId: string,
  ) {
    const organization = await this.findOrganizationForMemberManagement(
      input.organizationId,
      userId,
    );
    const member = await this.prisma.teamMember.findFirst({
      select: {
        id: true,
        isOwner: true,
      },
      where: {
        teamId: organization.teamId,
        user: { username: { equals: input.username, mode: 'insensitive' } },
      },
    });

    if (member === null) {
      throw new NotFoundException('Team member not found');
    }

    if (member.isOwner) {
      throw new ForbiddenException('Organization owner cannot be removed');
    }

    await this.prisma.teamMember.delete({ where: { id: member.id } });

    return this.findViewerOrganization(organization.id, userId);
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
        iconUrl:
          input.iconUrl === undefined ? undefined : nullableTrim(input.iconUrl),
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

  private async findOrganizationForMemberManagement(
    organizationId: string,
    userId: string,
  ) {
    const organization = await this.prisma.organization.findFirst({
      select: {
        id: true,
        name: true,
        teamId: true,
      },
      where: {
        id: organizationId,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: 'MANAGE_MEMBERS' } },
              ],
              userId,
            },
          },
        },
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

function publicOrganizationWhere(search: string | null | undefined) {
  const trimmed = search?.trim() ?? '';
  const base = {
    projects: {
      some: { status: 'APPROVED' as const },
    },
  };

  if (trimmed === '') {
    return base;
  }

  return {
    ...base,
    OR: [
      { name: { contains: trimmed, mode: 'insensitive' as const } },
      { slug: { contains: trimmed, mode: 'insensitive' as const } },
      { description: { contains: trimmed, mode: 'insensitive' as const } },
      {
        owner: {
          is: {
            OR: [
              {
                username: {
                  contains: trimmed,
                  mode: 'insensitive' as const,
                },
              },
              {
                displayName: {
                  contains: trimmed,
                  mode: 'insensitive' as const,
                },
              },
            ],
          },
        },
      },
      {
        projects: {
          some: {
            status: 'APPROVED' as const,
            OR: [
              { title: { contains: trimmed, mode: 'insensitive' as const } },
              { summary: { contains: trimmed, mode: 'insensitive' as const } },
              { slug: { contains: trimmed, mode: 'insensitive' as const } },
            ],
          },
        },
      },
      {
        team: {
          is: {
            members: {
              some: {
                user: {
                  OR: [
                    {
                      username: {
                        contains: trimmed,
                        mode: 'insensitive' as const,
                      },
                    },
                    {
                      displayName: {
                        contains: trimmed,
                        mode: 'insensitive' as const,
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ],
  };
}

function organizationMemberPermissions(
  permissions: readonly string[] | null | undefined,
): TeamPermission[] {
  const allowed = new Set<TeamPermission>([
    TeamPermission.MANAGE_DETAILS,
    TeamPermission.MANAGE_MEMBERS,
    TeamPermission.MANAGE_SETTINGS,
    TeamPermission.VIEW_ANALYTICS,
  ]);

  return [...new Set(permissions ?? [])].flatMap((permission) =>
    allowed.has(permission as TeamPermission)
      ? [permission as TeamPermission]
      : [],
  );
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
        members: {
          orderBy: [
            { isOwner: 'desc' as const },
            { sortOrder: 'asc' as const },
          ],
          select: {
            isOwner: true,
            permissions: true,
            role: true,
            sortOrder: true,
            user: {
              select: {
                avatarUrl: true,
                displayName: true,
                id: true,
                username: true,
              },
            },
          },
          take: 12,
          where: { acceptedAt: { not: null } },
        },
      },
    },
    updatedAt: true,
  };
}

function projectSelect() {
  return {
    approvedAt: true,
    archivedAt: true,
    color: true,
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
    publishedAt: true,
    queuedAt: true,
    requestedStatus: true,
    team: {
      select: {
        members: {
          orderBy: [
            { isOwner: 'desc' as const },
            { sortOrder: 'asc' as const },
          ],
          select: {
            user: {
              select: {
                avatarUrl: true,
                displayName: true,
                id: true,
                username: true,
              },
            },
          },
          take: 1,
          where: { acceptedAt: { not: null } },
        },
      },
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
    members: organization.team.members.map((member) => ({
      isOwner: member.isOwner,
      permissions: member.permissions,
      role: member.role,
      sortOrder: member.sortOrder,
      user: member.user,
    })),
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
    approvedAt: project.approvedAt,
    archivedAt: project.archivedAt,
    body: project.description,
    categories: project.categories.map(({ category }) => category.slug),
    color: project.color,
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
    owner: project.team.members[0]?.user ?? null,
    publishedAt: project.publishedAt,
    queuedAt: project.queuedAt,
    requestedStatus: project.requestedStatus,
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    status: project.status,
    summary: project.summary,
    title: project.title,
    updatedAt: project.updatedAt,
    wikiUrl: project.wikiUrl,
  };
}
