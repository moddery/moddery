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

  async recordReportStateUpdate({
    actorId,
    after,
    before,
  }: {
    actorId: string;
    after: ReportAuditSnapshot;
    before: ReportAuditSnapshot;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'REPORT_STATE_UPDATED',
        actorId,
        metadata: {
          after,
          before,
          entity: 'REPORT',
        },
        targetUserId: after.targetKind === 'USER' ? after.targetId : undefined,
      },
    });
  }

  async recordVersionModeration({
    action,
    actorId,
    after,
    before,
    reason,
  }: {
    action: string;
    actorId: string;
    after: VersionAuditSnapshot;
    before: VersionAuditSnapshot;
    reason: string | null;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'VERSION_MODERATED',
        actorId,
        metadata: {
          action,
          after,
          before,
          entity: 'VERSION',
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

  async recordSecurityEvent({
    action,
    actorId,
    metadata = {},
    targetUserId,
  }: {
    action: SecurityAuditAction;
    actorId?: string | null;
    metadata?: SecurityAuditMetadata;
    targetUserId: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'SECURITY_EVENT',
        actorId,
        metadata: {
          action,
          ...metadata,
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
  projectKind: string | null;
  requestedStatus: string | null;
  slug: string;
  status: string;
  title: string;
}

export interface AuditResourceSnapshot extends Prisma.InputJsonObject {
  id: string;
  kind: 'ORGANIZATION' | 'PROJECT';
  name: string;
  projectKind: string | null;
  slug: string;
}

export interface ReportAuditSnapshot extends Prisma.InputJsonObject {
  id: string;
  reason: string;
  state: string;
  targetId: string | null;
  targetKind: 'PROJECT' | 'USER' | 'VERSION' | 'UNKNOWN';
  targetLabel: string;
}

export interface VersionAuditSnapshot extends Prisma.InputJsonObject {
  id: string;
  name: string;
  projectSlug: string;
  requestedStatus: string | null;
  status: string;
  versionNumber: string;
}

export interface TeamMemberAuditSnapshot extends Prisma.InputJsonObject {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  username: string;
}

export type SecurityAuditAction =
  | 'API_TOKEN_CREATED'
  | 'API_TOKEN_REVOKED'
  | 'ACCOUNT_CREDENTIALS_REVOKED'
  | 'PASSWORD_RESET_CONFIRMED'
  | 'SESSION_CREATED'
  | 'SESSION_REVOKED'
  | 'TWO_FACTOR_DISABLED'
  | 'TWO_FACTOR_ENABLED';

export interface SecurityAuditMetadata extends Prisma.InputJsonObject {
  expiresAt?: string | null;
  revokedApiTokens?: number;
  revokedSessions?: number;
  scopes?: string[];
  sessionId?: string;
  tokenId?: string;
  tokenName?: string;
  userAgent?: string | null;
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
  reportAfter: ReportAuditSnapshot | null;
  reportBefore: ReportAuditSnapshot | null;
  moderationAction: string | null;
  resource: AuditResourceSnapshot | null;
  securityAction: string | null;
  targetUser: AuditUserRow | null;
  targetUserId: string | null;
  teamMemberAction: string | null;
  teamMemberAfter: TeamMemberAuditSnapshot | null;
  teamMemberBefore: TeamMemberAuditSnapshot | null;
  versionAfter: VersionAuditSnapshot | null;
  versionBefore: VersionAuditSnapshot | null;
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
    reportAfter: metadata.reportAfter,
    reportBefore: metadata.reportBefore,
    resource: metadata.resource,
    securityAction: metadata.securityAction,
    targetUser: row.targetUser,
    targetUserId: row.targetUserId,
    teamMemberAction: metadata.teamMemberAction,
    teamMemberAfter: metadata.teamMemberAfter,
    teamMemberBefore: metadata.teamMemberBefore,
    versionAfter: metadata.versionAfter,
    versionBefore: metadata.versionBefore,
  };
}

function auditMetadata(metadata: Prisma.JsonValue): {
  after: UserAccountAuditSnapshot | null;
  before: UserAccountAuditSnapshot | null;
  moderationAction: string | null;
  projectAfter: ProjectAuditSnapshot | null;
  projectBefore: ProjectAuditSnapshot | null;
  reason: string | null;
  reportAfter: ReportAuditSnapshot | null;
  reportBefore: ReportAuditSnapshot | null;
  resource: AuditResourceSnapshot | null;
  securityAction: string | null;
  teamMemberAction: string | null;
  teamMemberAfter: TeamMemberAuditSnapshot | null;
  teamMemberBefore: TeamMemberAuditSnapshot | null;
  versionAfter: VersionAuditSnapshot | null;
  versionBefore: VersionAuditSnapshot | null;
} {
  if (metadata === null || typeof metadata !== 'object') {
    return emptyAuditMetadata();
  }

  if (Array.isArray(metadata)) {
    return emptyAuditMetadata();
  }

  return {
    moderationAction:
      metadata.entity !== 'REPORT' &&
      metadata.resource === undefined &&
      !rowActionIsSecurity(metadata) &&
      typeof metadata.action === 'string'
        ? metadata.action
        : null,
    after: auditSnapshot(metadata.after),
    before: auditSnapshot(metadata.before),
    projectAfter: projectSnapshot(metadata.after),
    projectBefore: projectSnapshot(metadata.before),
    reason: typeof metadata.reason === 'string' ? metadata.reason : null,
    reportAfter: reportSnapshot(metadata.after),
    reportBefore: reportSnapshot(metadata.before),
    resource: resourceSnapshot(metadata.resource),
    securityAction:
      rowActionIsSecurity(metadata) && typeof metadata.action === 'string'
        ? metadata.action
        : null,
    teamMemberAction:
      metadata.resource !== undefined && typeof metadata.action === 'string'
        ? metadata.action
        : null,
    teamMemberAfter: teamMemberSnapshot(metadata.after),
    teamMemberBefore: teamMemberSnapshot(metadata.before),
    versionAfter: versionSnapshot(metadata.after),
    versionBefore: versionSnapshot(metadata.before),
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
    reportAfter: null,
    reportBefore: null,
    resource: null,
    securityAction: null,
    teamMemberAction: null,
    teamMemberAfter: null,
    teamMemberBefore: null,
    versionAfter: null,
    versionBefore: null,
  };
}

function rowActionIsSecurity(
  metadata: Prisma.JsonObject,
): metadata is Prisma.JsonObject & { action: string } {
  return (
    metadata.action === 'API_TOKEN_CREATED' ||
    metadata.action === 'API_TOKEN_REVOKED' ||
    metadata.action === 'PASSWORD_RESET_CONFIRMED' ||
    metadata.action === 'SESSION_CREATED' ||
    metadata.action === 'SESSION_REVOKED' ||
    metadata.action === 'TWO_FACTOR_DISABLED' ||
    metadata.action === 'TWO_FACTOR_ENABLED'
  );
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
        projectKind:
          typeof value.projectKind === 'string' ? value.projectKind : null,
        requestedStatus: value.requestedStatus,
        slug: value.slug,
        status: value.status,
        title: value.title,
      }
    : null;
}

function reportSnapshot(
  value: Prisma.JsonValue | undefined,
): ReportAuditSnapshot | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  const targetKind =
    value.targetKind === 'PROJECT' ||
    value.targetKind === 'USER' ||
    value.targetKind === 'VERSION' ||
    value.targetKind === 'UNKNOWN'
      ? value.targetKind
      : null;

  if (
    typeof value.id !== 'string' ||
    typeof value.reason !== 'string' ||
    typeof value.state !== 'string' ||
    targetKind === null ||
    typeof value.targetLabel !== 'string' ||
    (typeof value.targetId !== 'string' && value.targetId !== null)
  ) {
    return null;
  }

  return {
    id: value.id,
    reason: value.reason,
    state: value.state,
    targetId: value.targetId,
    targetKind,
    targetLabel: value.targetLabel,
  };
}

function versionSnapshot(
  value: Prisma.JsonValue | undefined,
): VersionAuditSnapshot | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.projectSlug !== 'string' ||
    typeof value.status !== 'string' ||
    typeof value.versionNumber !== 'string' ||
    (typeof value.requestedStatus !== 'string' &&
      value.requestedStatus !== null)
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    projectSlug: value.projectSlug,
    requestedStatus: value.requestedStatus,
    status: value.status,
    versionNumber: value.versionNumber,
  };
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
    projectKind:
      kind === 'PROJECT' && typeof value.projectKind === 'string'
        ? value.projectKind
        : null,
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
