import { Check, ExternalLink } from 'lucide-react';

import { cn } from '../../lib/cn.ts';
import { timeAgo } from '../../lib/format.ts';
import { enumLabel } from '../../lib/labels.ts';
import {
  type NotificationDelivery,
  type NotificationItem,
} from '../../lib/notifications.ts';
import { notificationActionLinkAttributes } from './notification-action-link.ts';

export function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => Promise<void>;
}) {
  const unread = item.readAt === null;

  return (
    <article
      className={cn(
        'flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-start sm:justify-between',
        unread && 'bg-accent-soft/40 px-3',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-extrabold text-ink">
            {item.title}
          </h2>
          <span className="rounded-full border border-line px-2 py-0.5 text-xs font-bold uppercase text-muted">
            {enumLabel(item.type)}
          </span>
          {unread && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
              New
            </span>
          )}
        </div>
        {item.body && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {item.body}
          </p>
        )}
        <p className="mt-2 text-xs font-semibold text-faint">
          {timeAgo(item.createdAt)} · {enumLabel(item.state)}
        </p>
        {item.deliveries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.deliveries.map((delivery) => (
              <DeliveryPill key={delivery.id} delivery={delivery} />
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {item.actionUrl && <NotificationActionLink url={item.actionUrl} />}
        {unread && (
          <button
            type="button"
            onClick={() => void onRead(item.id)}
            className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
          >
            <Check className="size-4" />
            Mark read
          </button>
        )}
      </div>
    </article>
  );
}

function NotificationActionLink({ url }: { url: string }) {
  const className =
    'inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-control-hover';
  const linkAttributes = notificationActionLinkAttributes(url);

  return (
    <a
      href={url}
      className={className}
      target={linkAttributes.target}
      rel={linkAttributes.rel}
    >
      Open
      <ExternalLink className="size-4" />
    </a>
  );
}

function DeliveryPill({ delivery }: { delivery: NotificationDelivery }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1 text-xs font-bold text-muted">
      <span>{enumLabel(delivery.channel)}</span>
      <span>·</span>
      <span>{enumLabel(delivery.state)}</span>
      {delivery.attempts > 0 && (
        <>
          <span>·</span>
          <span>{delivery.attempts} attempt(s)</span>
        </>
      )}
      {delivery.sentAt && (
        <>
          <span>·</span>
          <span>{timeAgo(delivery.sentAt)}</span>
        </>
      )}
      {delivery.lastError && (
        <>
          <span>·</span>
          <span className="truncate text-ink">{delivery.lastError}</span>
        </>
      )}
    </span>
  );
}
