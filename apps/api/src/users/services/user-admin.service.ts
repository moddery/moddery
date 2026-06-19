import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountRole, AccountStatus } from '@prisma/client';

import { AuditService } from '../../audit/audit.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type UpdateUserAccountInput } from '../dto/update-user-account.input.js';
import {
  type UserSearchResultContract,
  userProfileRowToContract,
  userProfileSelect,
} from './user-read-model.js';

@Injectable()
export class UserAdminService {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async findAdminUsers({
    limit = 50,
    offset = 0,
    search,
  }: {
    limit?: number;
    offset?: number;
    search?: string | null;
  } = {}): Promise<UserSearchResultContract> {
    const where = adminUserWhere(search);
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: userProfileSelect({
          includePrivateAccountFields: true,
          includePrivateCollections: true,
          includePrivateProjects: true,
        }),
        skip,
        take,
        where,
      }),
    ]);

    return {
      totalHits,
      users: users.map((user) =>
        userProfileRowToContract(user, { includePrivateAccountFields: true }),
      ),
    };
  }

  async findAdminUserList() {
    const result = await this.findAdminUsers();

    return result.users;
  }

  async updateUserAccount(input: UpdateUserAccountInput, actorId: string) {
    const role = accountRole(input.role);
    const status = accountStatus(input.status);
    const shouldRevokeCredentials =
      status !== undefined && status !== AccountStatus.ACTIVE;

    if (
      input.userId === actorId &&
      ((role !== undefined && role !== AccountRole.ADMIN) ||
        (status !== undefined && status !== AccountStatus.ACTIVE))
    ) {
      throw new ForbiddenException('Admins cannot restrict their own account');
    }

    const user = await this.prisma.user.findUnique({
      select: { id: true, role: true, status: true },
      where: { id: input.userId },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    const transactionResult = await this.prisma.$transaction([
      this.prisma.user.update({
        data: {
          role,
          status,
        },
        where: { id: input.userId },
      }),
      ...(shouldRevokeCredentials
        ? credentialRevocationQueries(this.prisma, input.userId, new Date())
        : []),
    ]);
    const revokedSessions = revocationCount(transactionResult[1]);
    const revokedApiTokens = revocationCount(transactionResult[2]);

    const updated = await this.prisma.user.findUnique({
      select: userProfileSelect({
        includePrivateAccountFields: true,
        includePrivateCollections: true,
        includePrivateProjects: true,
      }),
      where: { id: input.userId },
    });

    if (updated === null) {
      throw new NotFoundException('User not found');
    }

    await this.auditService.recordUserAccountUpdate({
      actorId,
      after: {
        role: updated.role,
        status: updated.status,
      },
      before: {
        role: user.role,
        status: user.status,
      },
      targetUserId: input.userId,
    });
    if (shouldRevokeCredentials) {
      await this.auditService.recordSecurityEvent({
        action: 'ACCOUNT_CREDENTIALS_REVOKED',
        actorId,
        metadata: {
          revokedApiTokens,
          revokedSessions,
        },
        targetUserId: input.userId,
      });
    }

    return userProfileRowToContract(updated, {
      includePrivateAccountFields: true,
    });
  }
}

function credentialRevocationQueries(
  prisma: PrismaService,
  userId: string,
  revokedAt: Date,
) {
  return [
    prisma.session.updateMany({
      data: { revokedAt },
      where: {
        revokedAt: null,
        userId,
      },
    }),
    prisma.apiToken.updateMany({
      data: { revokedAt },
      where: {
        revokedAt: null,
        userId,
      },
    }),
  ];
}

function revocationCount(result: unknown): number {
  return typeof result === 'object' &&
    result !== null &&
    'count' in result &&
    typeof result.count === 'number'
    ? result.count
    : 0;
}

function adminUserWhere(search: string | null | undefined) {
  const trimmed = search?.trim() ?? '';
  if (trimmed === '') {
    return {};
  }

  const role = optionalAccountRole(trimmed);
  const status = optionalAccountStatus(trimmed);

  return {
    OR: [
      { username: { contains: trimmed, mode: 'insensitive' as const } },
      { displayName: { contains: trimmed, mode: 'insensitive' as const } },
      { email: { contains: trimmed, mode: 'insensitive' as const } },
      ...(role === undefined ? [] : [{ role }]),
      ...(status === undefined ? [] : [{ status }]),
    ],
  };
}

function accountRole(
  value: string | null | undefined,
): AccountRole | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === AccountRole.USER) return AccountRole.USER;
  if (normalized === AccountRole.MODERATOR) return AccountRole.MODERATOR;
  if (normalized === AccountRole.ADMIN) return AccountRole.ADMIN;
  throw new ForbiddenException('Unsupported account role');
}

function accountStatus(
  value: string | null | undefined,
): AccountStatus | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === AccountStatus.ACTIVE) return AccountStatus.ACTIVE;
  if (normalized === AccountStatus.SUSPENDED) return AccountStatus.SUSPENDED;
  if (normalized === AccountStatus.DELETED) return AccountStatus.DELETED;
  throw new ForbiddenException('Unsupported account status');
}

function optionalAccountRole(value: string): AccountRole | undefined {
  const normalized = value.trim().toUpperCase();
  if (normalized === AccountRole.USER) return AccountRole.USER;
  if (normalized === AccountRole.MODERATOR) return AccountRole.MODERATOR;
  if (normalized === AccountRole.ADMIN) return AccountRole.ADMIN;

  return undefined;
}

function optionalAccountStatus(value: string): AccountStatus | undefined {
  const normalized = value.trim().toUpperCase();
  if (normalized === AccountStatus.ACTIVE) return AccountStatus.ACTIVE;
  if (normalized === AccountStatus.SUSPENDED) return AccountStatus.SUSPENDED;
  if (normalized === AccountStatus.DELETED) return AccountStatus.DELETED;

  return undefined;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}
