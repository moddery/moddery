import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type CreateOrganizationInput } from '../dto/create-organization.input.js';
import {
  organizationRowToContract,
  organizationSelect,
} from './organization-read-model.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findViewerOrganizations(ownerId: string) {
    const organizations = await this.prisma.organization.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      select: organizationSelect(8, { includeDraftProjects: true }),
      where: { ownerId },
    });

    return organizations.map(organizationRowToContract);
  }
}
