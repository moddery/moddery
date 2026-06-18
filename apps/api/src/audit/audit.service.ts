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
}

export interface UserAccountAuditSnapshot extends Prisma.InputJsonObject {
  role: string;
  status: string;
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
    targetUser: row.targetUser,
    targetUserId: row.targetUserId,
  };
}

function auditMetadata(metadata: Prisma.JsonValue): {
  after: UserAccountAuditSnapshot | null;
  before: UserAccountAuditSnapshot | null;
} {
  if (metadata === null || typeof metadata !== 'object') {
    return { after: null, before: null };
  }

  if (Array.isArray(metadata)) {
    return { after: null, before: null };
  }

  return {
    after: auditSnapshot(metadata.after),
    before: auditSnapshot(metadata.before),
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

export interface AuditUserRow {
  displayName: string | null;
  id: string;
  username: string;
}
