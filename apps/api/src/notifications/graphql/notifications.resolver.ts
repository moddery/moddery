import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { NotificationsService } from '../services/notifications.service.js';
import { NotificationPreferenceSummary } from './notification-preference.model.js';
import {
  NotificationSearchResult,
  NotificationSummary,
} from './notification-summary.model.js';
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

  @Mutation(() => Int)
  markAllNotificationsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Query(() => Int)
  unreadNotificationCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Query(() => [NotificationSummary])
  viewerNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Args('type', { nullable: true, type: () => String })
    type?: string | null,
    @Args('unreadOnly', { nullable: true, type: () => Boolean })
    unreadOnly?: boolean | null,
  ) {
    return this.notificationsService.findViewerNotificationList(user.id, {
      type,
      unreadOnly,
    });
  }

  @Query(() => NotificationSearchResult)
  viewerNotificationSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args('type', { nullable: true, type: () => String })
    type?: string | null,
    @Args('unreadOnly', { nullable: true, type: () => Boolean })
    unreadOnly?: boolean | null,
    @Args('limit', { nullable: true, type: () => Int })
    limit?: number | null,
    @Args('offset', { nullable: true, type: () => Int })
    offset?: number | null,
  ) {
    return this.notificationsService.findViewerNotifications(user.id, {
      limit: limit ?? undefined,
      offset: offset ?? undefined,
      type,
      unreadOnly,
    });
  }

  @Query(() => [String])
  viewerNotificationTypes(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findViewerNotificationTypes(user.id);
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
