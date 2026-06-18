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
  targetUser: AuditUserRow | null;
  targetUserId: string | null;
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
    targetUser: row.targetUser,
    targetUserId: row.targetUserId,
  };
}

function auditMetadata(metadata: Prisma.JsonValue): {
  after: UserAccountAuditSnapshot | null;
  before: UserAccountAuditSnapshot | null;
  moderationAction: string | null;
  projectAfter: ProjectAuditSnapshot | null;
  projectBefore: ProjectAuditSnapshot | null;
  reason: string | null;
} {
  if (metadata === null || typeof metadata !== 'object') {
    return emptyAuditMetadata();
  }

  if (Array.isArray(metadata)) {
    return emptyAuditMetadata();
  }

  return {
    moderationAction:
      typeof metadata.action === 'string' ? metadata.action : null,
    after: auditSnapshot(metadata.after),
    before: auditSnapshot(metadata.before),
    projectAfter: projectSnapshot(metadata.after),
    projectBefore: projectSnapshot(metadata.before),
    reason: typeof metadata.reason === 'string' ? metadata.reason : null,
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
  };
}

function auditSnapshot(value: Prisma.JsonValue | undefined) {
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

function projectSnapshot(value: Prisma.JsonValue | undefined) {
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

export interface AuditUserRow {
  displayName: string | null;
  id: string;
  username: string;
}
