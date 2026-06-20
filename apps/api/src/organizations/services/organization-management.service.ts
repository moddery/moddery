import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamPermission } from '@prisma/client';

import { AuditService } from '../../audit/audit.service.js';
import { NotificationsService } from '../../notifications/services/notifications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddOrganizationTeamMemberInput } from '../dto/add-organization-team-member.input.js';
import { type AddProjectToOrganizationInput } from '../dto/add-project-to-organization.input.js';
import { type RemoveOrganizationTeamMemberInput } from '../dto/remove-organization-team-member.input.js';
import { type RemoveProjectFromOrganizationInput } from '../dto/remove-project-from-organization.input.js';
import { type UpdateOrganizationInput } from '../dto/update-organization.input.js';
import {
  nullableTrim,
  organizationRowToContract,
  organizationSelect,
} from './organization-read-model.js';

@Injectable()
export class OrganizationManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addProjectToOrganization(
    input: AddProjectToOrganizationInput,
    userId: string,
  ) {
    const organizationId = requiredText(
      input.organizationId,
      'Organization is required',
    );
    const projectSlug = requiredText(input.projectSlug, 'Project is required');
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        id: organizationId,
        ownerId: userId,
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: {
        slug: projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: TeamPermission.MANAGE_SETTINGS } },
              ],
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

  async addOrganizationTeamMember(
    input: AddOrganizationTeamMemberInput,
    userId: string,
  ) {
    const organizationId = requiredText(
      input.organizationId,
      'Organization is required',
    );
    const username = requiredText(input.username, 'Username is required');
    const organization = await this.findOrganizationForMemberManagement(
      organizationId,
      userId,
    );
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    const before = await this.prisma.teamMember.findUnique({
      select: organizationMemberSelect(),
      where: {
        teamId_userId: {
          teamId: organization.teamId,
          userId: user.id,
        },
      },
    });

    if (before?.isOwner) {
      throw new ForbiddenException('Organization owner cannot be updated');
    }

    const member = await this.prisma.teamMember.upsert({
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
      select: organizationMemberSelect(),
    });

    await this.auditService.recordTeamMembershipChange({
      action: before === null ? 'ADD' : 'UPDATE',
      actorId: userId,
      after: organizationMemberRowToAuditSnapshot(member),
      before:
        before === null ? null : organizationMemberRowToAuditSnapshot(before),
      resource: {
        id: organization.id,
        kind: 'ORGANIZATION',
        name: organization.name,
        projectKind: null,
        slug: organization.slug,
      },
      targetUserId: user.id,
    });
    if (before === null && member.acceptedAt === null) {
      await this.sendTeamInviteNotification({
        organizationName: organization.name,
        userId: user.id,
      });
    }

    return this.findViewerOrganization(organization.id, userId);
  }

  async removeProjectFromOrganization(
    input: RemoveProjectFromOrganizationInput,
    ownerId: string,
  ) {
    const organizationId = requiredText(
      input.organizationId,
      'Organization is required',
    );
    const projectSlug = requiredText(input.projectSlug, 'Project is required');
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        id: organizationId,
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
        slug: projectSlug,
        team: {
          members: {
            some: {
              acceptedAt: { not: null },
              OR: [
                { isOwner: true },
                { permissions: { has: TeamPermission.MANAGE_SETTINGS } },
              ],
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
    const organizationId = requiredText(
      input.organizationId,
      'Organization is required',
    );
    const username = requiredText(input.username, 'Username is required');
    const organization = await this.findOrganizationForMemberManagement(
      organizationId,
      userId,
    );
    const member = await this.prisma.teamMember.findFirst({
      select: {
        id: true,
        ...organizationMemberSelect(),
      },
      where: {
        teamId: organization.teamId,
        user: { username: { equals: username, mode: 'insensitive' } },
      },
    });

    if (member === null) {
      throw new NotFoundException('Team member not found');
    }

    if (member.isOwner) {
      throw new ForbiddenException('Organization owner cannot be removed');
    }

    await this.prisma.teamMember.delete({ where: { id: member.id } });
    await this.auditService.recordTeamMembershipChange({
      action: 'REMOVE',
      actorId: userId,
      after: null,
      before: organizationMemberRowToAuditSnapshot(member),
      resource: {
        id: organization.id,
        kind: 'ORGANIZATION',
        name: organization.name,
        projectKind: null,
        slug: organization.slug,
      },
      targetUserId: member.user.id,
    });

    return this.findViewerOrganization(organization.id, userId);
  }

  async updateOrganization(input: UpdateOrganizationInput, ownerId: string) {
    const normalized = normalizeUpdateOrganizationInput(input);
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        id: normalized.organizationId,
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
        name: normalized.name,
        slug: normalized.slug,
      },
      where: { id: organization.id },
    });

    return this.findViewerOrganization(organization.id, ownerId);
  }

  private async sendTeamInviteNotification(input: {
    organizationName: string;
    userId: string;
  }) {
    await this.notificationsService.sendUserNotification({
      actionUrl: '/dashboard#dashboard-team-invitations',
      body: `You were invited to collaborate with ${input.organizationName}.`,
      title: `Team invitation for ${input.organizationName}`,
      type: 'team',
      userId: input.userId,
    });
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
        slug: true,
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

interface OrganizationMemberRow {
  acceptedAt: Date | null;
  isOwner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    id: string;
    username: string;
  };
}

function organizationMemberSelect() {
  return {
    acceptedAt: true,
    isOwner: true,
    permissions: true,
    role: true,
    sortOrder: true,
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  };
}

function organizationMemberRowToAuditSnapshot(member: OrganizationMemberRow) {
  return {
    accepted: member.acceptedAt !== null,
    owner: member.isOwner,
    permissions: member.permissions,
    role: member.role,
    username: member.user.username,
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

function normalizeUpdateOrganizationInput(input: UpdateOrganizationInput): {
  name?: string;
  organizationId: string;
  slug?: string;
} {
  const organizationId = requiredText(
    input.organizationId,
    'Organization is required',
  );
  const name =
    input.name === undefined || input.name === null
      ? undefined
      : requiredText(input.name, 'Organization name is required');
  const slug =
    input.slug === undefined || input.slug === null
      ? undefined
      : normalizeOrganizationSlug(input.slug);

  if (slug !== undefined && slug.length < 3) {
    throw new BadRequestException(
      'Organization slug must be at least 3 characters',
    );
  }

  return { name, organizationId, slug };
}

function requiredText(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException(message);
  }

  return trimmed;
}

function normalizeOrganizationSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
