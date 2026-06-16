import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { NotificationsService } from '../services/notifications.service.js';
import { NotificationPreferenceSummary } from './notification-preference.model.js';
import { NotificationSummary } from './notification-summary.model.js';
import { SendNotificationInput } from './send-notification.input.js';
import { UpdateNotificationPreferenceInput } from './update-notification-preference.input.js';

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

  @Query(() => [NotificationPreferenceSummary])
  viewerNotificationPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findViewerPreferences(user.id);
  }

  @Mutation(() => NotificationPreferenceSummary)
  updateNotificationPreference(
    @Args('input') input: UpdateNotificationPreferenceInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.updatePreference({
      channel: input.channel,
      enabled: input.enabled,
      type: input.type,
      userId: user.id,
    });
  }

  @Mutation(() => NotificationSummary)
  sendNotification(
    @Args('input') input: SendNotificationInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertCanSendNotifications(user);
    return this.notificationsService.sendNotification(input);
  }
}

function assertCanSendNotifications(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
    return;
  }

  throw new ForbiddenException('Moderator access required');
}
