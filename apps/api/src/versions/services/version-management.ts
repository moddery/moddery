import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { type PrismaService } from '../../prisma/prisma.service.js';

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
          team: {
            select: {
              members: {
                select: { userId: true },
                take: 1,
                where: {
                  acceptedAt: { not: null },
                  userId,
                },
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
    throw new ForbiddenException('Project membership required');
  }

  return version;
}
