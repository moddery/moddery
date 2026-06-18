import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamPermission } from '@prisma/client';

import { NotificationsService } from '../../notifications/services/notifications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddProjectTeamMemberInput } from '../dto/add-project-team-member.input.js';
import { type RemoveProjectTeamMemberInput } from '../dto/remove-project-team-member.input.js';

interface ProjectMemberRow {
  acceptedAt: Date | null;
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
}

export interface ProjectMemberContract {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface ProjectMemberSearchResultContract {
  members: ProjectMemberContract[];
  totalHits: number;
}

@Injectable()
export class ProjectMembersService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async findProjectMembers(
    projectSlug: string,
  ): Promise<ProjectMemberContract[]> {
    const result = await this.findProjectMemberSearch(projectSlug, {
      limit: 100,
      offset: 0,
    });

    return result.members;
  }

  async findProjectMemberSearch(
    projectSlug: string,
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<ProjectMemberSearchResultContract> {
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const project = await this.prisma.project.findUnique({
      select: {
        teamId: true,
      },
      where: { slug: projectSlug },
    });

    if (project === null) {
      return { members: [], totalHits: 0 };
    }

    const where = { teamId: project.teamId };
    const [totalHits, members] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.findMany({
        orderBy: [{ isOwner: 'desc' }, { sortOrder: 'asc' }],
        select: projectMemberSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      members: members.map(projectMemberRowToContract),
      totalHits,
    };
  }

  async addProjectTeamMember(
    input: AddProjectTeamMemberInput,
    userId: string,
  ): Promise<ProjectMemberContract[]> {
    const project = await this.findProjectForMemberManagement(
      input.projectSlug,
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
        permissions: projectMemberPermissions(input.permissions),
        role: input.role.trim() || 'Member',
        teamId: project.teamId,
        userId: user.id,
      },
      update: {
        permissions: projectMemberPermissions(input.permissions),
        role: input.role.trim() || 'Member',
      },
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: user.id,
        },
      },
    });

    await this.sendTeamInviteNotification({
      targetName: project.title,
      userId: user.id,
    });

    return this.findProjectMembers(input.projectSlug);
  }

  async removeProjectTeamMember(
    input: RemoveProjectTeamMemberInput,
    userId: string,
  ): Promise<ProjectMemberContract[]> {
    const project = await this.findProjectForMemberManagement(
      input.projectSlug,
      userId,
    );
    const member = await this.prisma.teamMember.findFirst({
      select: {
        id: true,
        isOwner: true,
        user: { select: { username: true } },
      },
      where: {
        teamId: project.teamId,
        user: { username: { equals: input.username, mode: 'insensitive' } },
      },
    });

    if (member === null) {
      throw new NotFoundException('Team member not found');
    }

    if (member.isOwner) {
      throw new ForbiddenException('Project owner cannot be removed');
    }

    await this.prisma.teamMember.delete({ where: { id: member.id } });

    return this.findProjectMembers(input.projectSlug);
  }

  private async findProjectForMemberManagement(
    projectSlug: string,
    userId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      select: {
        id: true,
        teamId: true,
        title: true,
      },
      where: {
        slug: projectSlug,
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

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async sendTeamInviteNotification(input: {
    targetName: string;
    userId: string;
  }) {
    await this.notificationsService.sendUserNotification({
      actionUrl: `/dashboard`,
      body: `You were invited to collaborate on ${input.targetName}.`,
      title: `Team invitation for ${input.targetName}`,
      type: 'team',
      userId: input.userId,
    });
  }
}

function projectMemberRowToContract(
  member: ProjectMemberRow,
): ProjectMemberContract {
  return {
    accepted: member.acceptedAt !== null,
    owner: member.isOwner,
    permissions: member.permissions,
    role: member.role,
    sortOrder: member.sortOrder,
    user: member.user,
  };
}

function projectMemberSelect() {
  return {
    acceptedAt: true,
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
  };
}

function projectMemberPermissions(
  permissions: readonly string[] | null | undefined,
): TeamPermission[] {
  const allowed = new Set<TeamPermission>([
    TeamPermission.MANAGE_DETAILS,
    TeamPermission.MANAGE_MEMBERS,
    TeamPermission.MANAGE_SETTINGS,
    TeamPermission.MANAGE_VERSIONS,
    TeamPermission.VIEW_ANALYTICS,
  ]);

  return [...new Set(permissions ?? [])].flatMap((permission) =>
    allowed.has(permission as TeamPermission)
      ? [permission as TeamPermission]
      : [],
  );
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
