import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findViewerInvitations(
    userId: string,
    {
      limit = 20,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const where = {
      acceptedAt: null,
      userId,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, invitations] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: teamInvitationSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      invitations: invitations.map(teamInvitationRowToContract),
      totalHits,
    };
  }

  async findViewerInvitationList(userId: string) {
    const result = await this.findViewerInvitations(userId);

    return result.invitations;
  }

  async acceptInvitation({
    invitationId,
    userId,
  }: {
    invitationId: string;
    userId: string;
  }) {
    const invitation = await this.findViewerInvitationOrThrow({
      invitationId,
      userId,
    });

    await this.prisma.teamMember.update({
      data: { acceptedAt: new Date() },
      where: { id: invitation.id },
    });

    return {
      ...teamInvitationRowToContract(invitation),
      acceptedAt: new Date(),
    };
  }

  async declineInvitation({
    invitationId,
    userId,
  }: {
    invitationId: string;
    userId: string;
  }) {
    const invitation = await this.findViewerInvitationOrThrow({
      invitationId,
      userId,
    });

    if (invitation.isOwner) {
      throw new ForbiddenException('Owner invitations cannot be declined');
    }

    await this.prisma.teamMember.delete({ where: { id: invitation.id } });

    return teamInvitationRowToContract(invitation);
  }

  private async findViewerInvitationOrThrow({
    invitationId,
    userId,
  }: {
    invitationId: string;
    userId: string;
  }) {
    const invitation = await this.prisma.teamMember.findFirst({
      select: {
        ...teamInvitationSelect(),
        isOwner: true,
      },
      where: {
        acceptedAt: null,
        id: invitationId,
        userId,
      },
    });

    if (invitation === null) {
      throw new NotFoundException('Team invitation not found');
    }

    return invitation;
  }
}

function teamInvitationSelect() {
  return {
    createdAt: true,
    id: true,
    permissions: true,
    role: true,
    team: {
      select: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        project: {
          select: {
            id: true,
            kind: true,
            slug: true,
            title: true,
          },
        },
        targetKind: true,
      },
    },
  };
}

function teamInvitationRowToContract(row: {
  createdAt: Date;
  id: string;
  permissions: string[];
  role: string;
  team: {
    organization: { id: string; name: string; slug: string } | null;
    project: { id: string; kind: string; slug: string; title: string } | null;
    targetKind: string;
  };
}) {
  const target =
    row.team.targetKind === 'ORGANIZATION' && row.team.organization !== null
      ? {
          id: row.team.organization.id,
          name: row.team.organization.name,
          projectKind: null,
          slug: row.team.organization.slug,
          type: 'ORGANIZATION',
        }
      : {
          id: row.team.project?.id ?? row.id,
          name: row.team.project?.title ?? 'Project',
          projectKind: row.team.project?.kind ?? null,
          slug: row.team.project?.slug ?? '',
          type: 'PROJECT',
        };

  return {
    createdAt: row.createdAt,
    id: row.id,
    permissions: row.permissions,
    role: row.role,
    target,
  };
}

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}
