import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminAuditLogs({
    limit = 50,
    offset = 0,
  }: {
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditLogSearchResultContract> {
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, auditLogs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: auditLogSelect(),
        skip,
        take,
      }),
    ]);

    return {
      auditLogs: auditLogs.map(auditLogRowToContract),
      totalHits,
    };
  }

  async recordUserAccountUpdate({
    actorId,
    after,
    before,
    targetUserId,
  }: {
    actorId: string;
    after: UserAccountAuditSnapshot;
    before: UserAccountAuditSnapshot;
    targetUserId: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'USER_ACCOUNT_UPDATED',
        actorId,
        metadata: {
          after,
          before,
        },
        targetUserId,
      },
    });
  }

  async recordProjectModeration({
    action,
    actorId,
    after,
    before,
    reason,
  }: {
    action: string;
    actorId: string;
    after: ProjectAuditSnapshot;
    before: ProjectAuditSnapshot;
    reason: string | null;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'PROJECT_MODERATED',
        actorId,
        metadata: {
          action,
          after,
          before,
          reason,
        },
      },
    });
  }

  async recordTeamMembershipChange({
    action,
    actorId,
    after,
    before,
    resource,
    targetUserId,
  }: {
    action: string;
    actorId: string;
    after: TeamMemberAuditSnapshot | null;
    before: TeamMemberAuditSnapshot | null;
    resource: AuditResourceSnapshot;
    targetUserId: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBERSHIP_CHANGED',
        actorId,
        metadata: {
          action,
          after,
          before,
          resource,
        },
        targetUserId,
      },
    });
  }
}

export interface UserAccountAuditSnapshot extends Prisma.InputJsonObject {
  role: string;
  status: string;
}

export interface ProjectAuditSnapshot extends Prisma.InputJsonObject {
  id: string;
  requestedStatus: string | null;
  slug: string;
  status: string;
  title: string;
}

export interface AuditResourceSnapshot extends Prisma.InputJsonObject {
  id: string;
  kind: 'ORGANIZATION' | 'PROJECT';
  name: string;
  slug: string;
}

export interface TeamMemberAuditSnapshot extends Prisma.InputJsonObject {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  username: string;
}

export interface AuditLogSearchResultContract {
  auditLogs: AuditLogContract[];
  totalHits: number;
}

export interface AuditLogContract {
  action: string;
  actor: AuditUserRow | null;
  actorId: string | null;
  after: UserAccountAuditSnapshot | null;
  before: UserAccountAuditSnapshot | null;
  createdAt: Date;
  id: string;
  projectAfter: ProjectAuditSnapshot | null;
  projectBefore: ProjectAuditSnapshot | null;
  reason: string | null;
  moderationAction: string | null;
  resource: AuditResourceSnapshot | null;
  targetUser: AuditUserRow | null;
  targetUserId: string | null;
  teamMemberAction: string | null;
  teamMemberAfter: TeamMemberAuditSnapshot | null;
  teamMemberBefore: TeamMemberAuditSnapshot | null;
}

function auditLogSelect() {
  return {
    action: true,
    actor: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    actorId: true,
    createdAt: true,
    id: true,
    metadata: true,
    targetUser: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    targetUserId: true,
  };
}

function auditLogRowToContract(row: {
  action: string;
  actor: AuditUserRow | null;
  actorId: string | null;
  createdAt: Date;
  id: string;
  metadata: Prisma.JsonValue;
  targetUser: AuditUserRow | null;
  targetUserId: string | null;
}) {
  const metadata = auditMetadata(row.metadata);

  return {
    action: row.action,
    actor: row.actor,
    actorId: row.actorId,
    after: metadata.after,
    before: metadata.before,
    createdAt: row.createdAt,
    id: row.id,
    moderationAction: metadata.moderationAction,
    projectAfter: metadata.projectAfter,
    projectBefore: metadata.projectBefore,
    reason: metadata.reason,
    resource: metadata.resource,
    targetUser: row.targetUser,
    targetUserId: row.targetUserId,
    teamMemberAction: metadata.teamMemberAction,
    teamMemberAfter: metadata.teamMemberAfter,
    teamMemberBefore: metadata.teamMemberBefore,
  };
}

function auditMetadata(metadata: Prisma.JsonValue): {
  after: UserAccountAuditSnapshot | null;
  before: UserAccountAuditSnapshot | null;
  moderationAction: string | null;
  projectAfter: ProjectAuditSnapshot | null;
  projectBefore: ProjectAuditSnapshot | null;
  reason: string | null;
  resource: AuditResourceSnapshot | null;
  teamMemberAction: string | null;
  teamMemberAfter: TeamMemberAuditSnapshot | null;
  teamMemberBefore: TeamMemberAuditSnapshot | null;
} {
  if (metadata === null || typeof metadata !== 'object') {
    return emptyAuditMetadata();
  }

  if (Array.isArray(metadata)) {
    return emptyAuditMetadata();
  }

  return {
    moderationAction:
      metadata.resource === undefined && typeof metadata.action === 'string'
        ? metadata.action
        : null,
    after: auditSnapshot(metadata.after),
    before: auditSnapshot(metadata.before),
    projectAfter: projectSnapshot(metadata.after),
    projectBefore: projectSnapshot(metadata.before),
    reason: typeof metadata.reason === 'string' ? metadata.reason : null,
    resource: resourceSnapshot(metadata.resource),
    teamMemberAction:
      metadata.resource !== undefined && typeof metadata.action === 'string'
        ? metadata.action
        : null,
    teamMemberAfter: teamMemberSnapshot(metadata.after),
    teamMemberBefore: teamMemberSnapshot(metadata.before),
  };
}

function emptyAuditMetadata() {
  return {
    after: null,
    before: null,
    moderationAction: null,
    projectAfter: null,
    projectBefore: null,
    reason: null,
    resource: null,
    teamMemberAction: null,
    teamMemberAfter: null,
    teamMemberBefore: null,
  };
}

function auditSnapshot(
  value: Prisma.JsonValue | undefined,
): UserAccountAuditSnapshot | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  return typeof value.role === 'string' && typeof value.status === 'string'
    ? {
        role: value.role,
        status: value.status,
      }
    : null;
}

function projectSnapshot(
  value: Prisma.JsonValue | undefined,
): ProjectAuditSnapshot | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  return typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.status === 'string' &&
    typeof value.title === 'string' &&
    (typeof value.requestedStatus === 'string' ||
      value.requestedStatus === null)
    ? {
        id: value.id,
        requestedStatus: value.requestedStatus,
        slug: value.slug,
        status: value.status,
        title: value.title,
      }
    : null;
}

function resourceSnapshot(
  value: Prisma.JsonValue | undefined,
): AuditResourceSnapshot | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  const kind =
    value.kind === 'ORGANIZATION' || value.kind === 'PROJECT'
      ? value.kind
      : null;

  if (
    typeof value.id !== 'string' ||
    kind === null ||
    typeof value.name !== 'string' ||
    typeof value.slug !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    kind,
    name: value.name,
    slug: value.slug,
  };
}

function teamMemberSnapshot(
  value: Prisma.JsonValue | undefined,
): TeamMemberAuditSnapshot | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  return typeof value.accepted === 'boolean' &&
    typeof value.owner === 'boolean' &&
    Array.isArray(value.permissions) &&
    value.permissions.every((permission) => typeof permission === 'string') &&
    typeof value.role === 'string' &&
    typeof value.username === 'string'
    ? {
        accepted: value.accepted,
        owner: value.owner,
        permissions: value.permissions,
        role: value.role,
        username: value.username,
      }
    : null;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

export interface AuditUserRow {
  displayName: string | null;
  id: string;
  username: string;
}
