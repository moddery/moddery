import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationsResolver } from './graphql/notifications.resolver.js';
import { NotificationDispatchService } from './services/notification-dispatch.service.js';
import { NotificationPreferencesService } from './services/notification-preferences.service.js';
import { NotificationsService } from './services/notifications.service.js';

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationDispatchService,
    NotificationPreferencesService,
    NotificationsResolver,
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
