import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findViewerNotifications(userId: string) {
    return this.prisma.notification.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 20,
      where: { userId },
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        readAt: null,
        userId,
      },
    });
  }

  markRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      data: {
        readAt: new Date(),
        state: 'READ',
      },
      where: {
        id: notificationId,
        userId,
      },
    });
  }
}
