import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TeamPermission } from '@prisma/client';

import { type PrismaService } from '../../prisma/prisma.service.js';

export const versionManagementMemberWhere = (userId: string) => ({
  acceptedAt: { not: null },
  OR: [
    { isOwner: true },
    { permissions: { has: TeamPermission.MANAGE_VERSIONS } },
  ],
  userId,
});

export async function findManagedVersion(
  prisma: PrismaService,
  versionId: string,
  userId: string,
) {
  const version = await prisma.version.findFirst({
    select: {
      id: true,
      project: {
        select: {
          id: true,
          slug: true,
          status: true,
          team: {
            select: {
              members: {
                select: { userId: true },
                take: 1,
                where: versionManagementMemberWhere(userId),
              },
            },
          },
        },
      },
    },
    where: { id: versionId },
  });

  if (version === null) {
    throw new NotFoundException('Version not found');
  }

  if (version.project.team.members.length === 0) {
    throw new ForbiddenException('Project version permission required');
  }

  if (version.project.status !== 'APPROVED') {
    throw new BadRequestException(
      'Project must be approved before releases can be changed',
    );
  }

  return version;
}
