import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationsResolver } from './graphql/notifications.resolver.js';
import { NotificationsService } from './services/notifications.service.js';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsResolver, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
