import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  organizationMemberRowToContract,
  organizationMemberSelect,
  type OrganizationMemberSearchResultContract,
  type OrganizationProjectSearchResultContract,
  organizationRowToContract,
  organizationSelect,
  type OrganizationSearchResultContract,
  projectRowToContract,
  projectSelect,
} from './organization-read-model.js';

@Injectable()
export class OrganizationDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicOrganizations({
    limit = 50,
    offset = 0,
    search,
  }: {
    limit?: number;
    offset?: number;
    search?: string | null;
  } = {}): Promise<OrganizationSearchResultContract> {
    const where = publicOrganizationWhere(search);
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, organizations] = await Promise.all([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        select: organizationSelect(4, { includeDraftProjects: false }),
        skip,
        take,
        where,
      }),
    ]);

    return {
      organizations: organizations.map(organizationRowToContract),
      totalHits,
    };
  }

  async findPublicOrganizationList({
    search,
  }: {
    search?: string | null;
  } = {}) {
    const result = await this.findPublicOrganizations({ search });

    return result.organizations;
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

  async findOrganizationMembers(
    slug: string,
    { limit = 24, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<OrganizationMemberSearchResultContract> {
    const organization = await this.prisma.organization.findFirst({
      select: { teamId: true },
      where: {
        slug: { equals: slug, mode: 'insensitive' },
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    const where = {
      acceptedAt: { not: null },
      teamId: organization.teamId,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, members] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.findMany({
        orderBy: [{ isOwner: 'desc' }, { sortOrder: 'asc' }],
        select: organizationMemberSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      members: members.map(organizationMemberRowToContract),
      totalHits,
    };
  }

  async findOrganizationProjects(
    slug: string,
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<OrganizationProjectSearchResultContract> {
    const organization = await this.prisma.organization.findFirst({
      select: { id: true },
      where: {
        slug: { equals: slug, mode: 'insensitive' },
      },
    });

    if (organization === null) {
      throw new NotFoundException('Organization not found');
    }

    const where = {
      organizationId: organization.id,
      status: 'APPROVED' as const,
    };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        select: projectSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      projects: projects.map(projectRowToContract),
      totalHits,
    };
  }
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
