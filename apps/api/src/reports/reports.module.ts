import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { ReportsResolver } from './graphql/reports.resolver.js';
import { ReportsService } from './services/reports.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ReportsResolver, ReportsService],
})
export class ReportsModule {}
