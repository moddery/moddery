import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ReportsResolver } from './graphql/reports.resolver.js';
import { ReportsService } from './services/reports.service.js';

@Module({
  imports: [NotificationsModule, PrismaModule],
  providers: [ReportsResolver, ReportsService],
})
export class ReportsModule {}
