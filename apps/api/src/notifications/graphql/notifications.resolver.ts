import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { NotificationsService } from '../services/notifications.service.js';
import { NotificationSummary } from './notification-summary.model.js';

@Resolver(() => NotificationSummary)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Mutation(() => NotificationSummary)
  markNotificationRead(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Query(() => Int)
  unreadNotificationCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Query(() => [NotificationSummary])
  viewerNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findViewerNotifications(user.id);
  }
}
