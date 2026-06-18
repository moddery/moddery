import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

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
