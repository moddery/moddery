export interface NotificationActionLinkAttributes {
  rel?: 'noreferrer';
  target?: '_blank';
}

export function notificationActionLinkAttributes(
  url: string,
): NotificationActionLinkAttributes {
  return url.startsWith('/') ? {} : { rel: 'noreferrer', target: '_blank' };
}
