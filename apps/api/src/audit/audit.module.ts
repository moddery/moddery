import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditResolver } from './graphql/audit.resolver.js';
import { AuditService } from './audit.service.js';

@Module({
  exports: [AuditService],
  imports: [PrismaModule],
  providers: [AuditResolver, AuditService],
})
export class AuditModule {}
