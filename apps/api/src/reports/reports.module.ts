import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ReportsResolver } from './graphql/reports.resolver.js';
import { ReportDirectThreadsService } from './services/report-direct-threads.service.js';
import { ReportModerationNotesService } from './services/report-moderation-notes.service.js';
import { ReportThreadsService } from './services/report-threads.service.js';
import { ReportsService } from './services/reports.service.js';

@Module({
  imports: [AuditModule, NotificationsModule, PrismaModule],
  providers: [
    ReportDirectThreadsService,
    ReportModerationNotesService,
    ReportThreadsService,
    ReportsResolver,
    ReportsService,
  ],
})
export class ReportsModule {}
